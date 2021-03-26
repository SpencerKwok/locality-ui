import algolia from "../../../../algolia/client.js";
import cloudinary from "../../../../cloudinary/client.js";
import psql from "../../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (
      companyId,
      productId,
      name,
      image,
      primaryKeywords,
      description,
      price,
      priceRange,
      link
    ) => {
      const [url, cloudinaryError] = await cloudinary.upload(image, {
        exif: false,
        format: "webp",
        public_id: `${companyId}/${productId}`,
        unique_filename: false,
        overwrite: true,
      });
      if (cloudinaryError) {
        res.send(JSON.stringify({ errror: cloudinaryError }));
      } else {
        const algoliaError = await algolia.partialUpdateObject(
          {
            objectID: `${companyId}_${productId}`,
            name: name,
            primary_keywords: primaryKeywords,
            description: description,
            price: price,
            price_range: priceRange,
            link: link,
            image: url,
          },
          { createIfNotExists: false }
        );

        if (algoliaError) {
          res.send(JSON.stringify({ error: algoliaError }));
        } else {
          const query = sqlString.format(
            `UPDATE products SET name=E?, image=? WHERE company_id=? AND id=?`,
            [name, url, companyId, productId]
          );
          const [_, psqlError] = await psql.query(query);
          if (psqlError) {
            res.send(JSON.stringify({ error: psqlError }));
          } else {
            res.send(
              JSON.stringify({
                product: {
                  objectID: `${companyId}_${productId}`,
                  name: name,
                  image: url,
                },
              })
            );
          }
        }
      }
    };

    const productId = req.body.product.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    const image = xss(req.body.product.image || "");
    if (image === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product image" },
        })
      );
      return;
    }

    const name = xss(req.body.product.name || "");
    if (name === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product name" },
        })
      );
      return;
    }

    const primaryKeywords = xss(req.body.product.primaryKeywords || "");
    const description = xss(req.body.product.description || "");

    let price = req.body.product.price;
    if (typeof price !== "number") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price" },
        })
      );
      return;
    }
    price = parseFloat(price.toFixed(2));

    let priceRange = req.body.product.priceRange;
    if (!Array.isArray(priceRange) || priceRange.length !== 2) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }
    try {
      priceRange[0] = parseFloat(priceRange[0]);
      priceRange[1] = parseFloat(priceRange[1]);
    } catch {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }

    const link = xss(req.body.product.link || "");
    if (link === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product link" },
        })
      );
      return;
    }
    // Add "https://" to link URL if not included
    if (!link.includes("https://") && !link.includes("http://")) {
      link = `https://${link}`;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.companyId)) {
        await f(
          req.body.companyId,
          productId,
          name,
          image,
          primaryKeywords,
          description,
          price,
          priceRange,
          link
        );
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(
        parseInt(companyId),
        productId,
        name,
        image,
        primaryKeywords,
        description,
        price,
        priceRange,
        link
      );
    }
  }
);

export default router;
