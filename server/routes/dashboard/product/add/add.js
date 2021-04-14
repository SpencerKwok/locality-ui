import rateLimit from "express-rate-limit";
import { Router } from "express";
import xss from "xss";

import { productAdd } from "../../common/common.js";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product add requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const companyName = xss(req.body.companyName || "");
    if (companyName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company name" },
        })
      );
      return;
    }

    const productName = xss(req.body.product.name || "");
    if (productName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product name" },
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

    let latitude = xss(req.body.latitude || "");
    if (latitude === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid latitude" },
        })
      );
      return;
    }
    latitude = latitude.split(",").map((x) => xss(x));
    for (let i = 0; i < latitude.length; ++i) {
      try {
        latitude[i] = parseFloat(latitude[i]);
      } catch (err) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid latitude" },
          })
        );
      }
    }

    let longitude = xss(req.body.longitude || "");
    if (longitude === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid longitude" },
        })
      );
      return;
    }
    longitude = longitude.split(",").map((x) => xss(x));
    for (let i = 0; i < longitude.length; ++i) {
      try {
        longitude[i] = parseFloat(longitude[i]);
      } catch (err) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid longitude" },
          })
        );
      }
    }

    let primaryKeywords = req.body.product.primaryKeywords;
    if (!Array.isArray(primaryKeywords)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid primary keywords" },
        })
      );
      return;
    }
    try {
      primaryKeywords = primaryKeywords.map((keyword) => xss(keyword));
    } catch {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid primary keywords" },
        })
      );
      return;
    }

    let departments = req.body.product.departments;
    if (!Array.isArray(departments)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid departments" },
        })
      );
      return;
    }
    try {
      departments = departments
        .map((department) => xss(department.trim()))
        .filter(Boolean);
    } catch (err) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid departments" },
        })
      );
      return;
    }

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

    let link = xss(req.body.product.link || "");
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
        const [product, error] = await productAdd(
          req.body.companyId,
          companyName,
          productName,
          image,
          latitude,
          longitude,
          primaryKeywords,
          departments,
          description,
          price,
          priceRange,
          link
        );
        if (error) {
          res.send(JSON.stringify({ error }));
        } else {
          res.send(JSON.stringify({ product }));
        }
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      const [product, error] = await productAdd(
        parseInt(companyId),
        companyName,
        productName,
        image,
        latitude,
        longitude,
        primaryKeywords,
        departments,
        description,
        price,
        priceRange,
        link
      );
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify({ product }));
      }
    }
  }
);

export default router;
