import dns from "dns";
import fetch from "node-fetch";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";

import { productAdd, productDelete } from "../common/common.js";

const router = Router();
router.post(
  "/product/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many shopify product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const companyId = req.cookies["companyId"];

    const f = async (companyId) => {
      const [companyResponse, companyError] = await psql.query(
        `SELECT * FROM companies WHERE id=${companyId}`
      );
      if (companyError) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
        return;
      }

      let nextProductId = companyResponse.rows[0].next_product_id;
      const companyName = companyResponse.rows[0].name;
      const latitude = companyResponse.rows[0].latitude.split(",");
      const longitude = companyResponse.rows[0].longitude.split(",");
      const homepage = companyResponse.rows[0].homepage;
      const domain = homepage.match(/(?<=http(s?):\/\/)[^\/]*/g)[0];
      if (!homepage) {
        res.send(
          JSON.stringify({
            error: {
              code: 400,
              message:
                'It looks like you haven\'t set your Shopify homepage yet! Please go to the "Company" tab and add your homepage to your profile',
            },
          })
        );
        return;
      }

      dns.resolveCname(domain, async (err, addresses) => {
        if (err) {
          res.send(
            JSON.stringify({
              error: {
                code: 500,
                message: err.message,
              },
            })
          );
          return;
        }

        let isShopify = false;
        addresses.forEach((address) => {
          isShopify =
            isShopify || address.match(/^.*\.myshopify.com$/) !== null;
        });

        if (!isShopify) {
          res.send(
            JSON.stringify({
              error: {
                code: 400,
                message:
                  "Failed to upload products from your Shopify homepage. Please make sure you have set up your Shopify homepage properly!",
              },
            })
          );
          return;
        }

        const [productsResponse, productsError] = await psql.query(
          `SELECT id FROM products WHERE company_id=${companyId}`
        );
        if (productsError) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid company id" },
            })
          );
          return;
        }

        await productDelete(
          companyId,
          productsResponse.rows.map((product) => product.id)
        );

        let page = 1;
        let done = false;
        let error = null;
        const products = [];
        while (!done) {
          await fetch(`${homepage}/collections/all/products.json?page=${page}`)
            .then((res) => res.json())
            .then(async (data) => {
              if (data.products.length === 0) {
                done = true;
                return;
              }

              await Promise.all(
                data.products.map(async (product, index) => {
                  const productName = product.title;
                  const image = product.images[0].src;
                  const primaryKeywords = product.product_type;
                  const description = product.body_html.replace(/<[^>]*>/g, "");
                  const link = `${homepage}/products/${product.handle}`;
                  let price = parseFloat(product.variants[0].price);
                  let priceRange = [price, price];
                  product.variants.forEach((variant) => {
                    priceRange[0] = Math.min(
                      priceRange[0],
                      parseFloat(variant.price)
                    );
                    priceRange[1] = Math.max(
                      priceRange[1],
                      parseFloat(variant.price)
                    );
                  });
                  price = priceRange[0];

                  const [baseProduct, err] = await productAdd(
                    companyId,
                    companyName,
                    productName,
                    image,
                    latitude,
                    longitude,
                    primaryKeywords,
                    description,
                    price,
                    priceRange,
                    link,
                    nextProductId + index
                  );
                  if (err) {
                    error = err;
                    done = true;
                    return;
                  }

                  products.push(baseProduct);
                })
              );

              nextProductId += data.products.length;
              page += 1;
            })
            .catch((err) => {
              console.log(err);
              error = err;
              done = true;
            });
        }
        if (error) {
          res.send(JSON.stringify({ error }));
          return;
        }

        const [_, psqlErrorUpdateNextId] = await psql.query(
          sqlString.format(
            "UPDATE companies SET next_product_id=? WHERE id=?",
            [nextProductId, companyId]
          )
        );
        if (psqlErrorUpdateNextId) {
          res.send(JSON.stringify({ error: psqlErrorUpdateNextId }));
          return;
        }

        products.sort((a, b) => a.name.localeCompare(b.name));
        res.send(
          JSON.stringify({
            products,
          })
        );
      });
    };

    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId));
    }
  }
);

export default router;
