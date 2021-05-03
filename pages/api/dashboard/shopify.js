import { camelCase, mapKeys } from "lodash";
import Dns from "dns";
import Fetch from "node-fetch";
import SqlString from "sqlstring";

import Psql from "../../../lib/api/postgresql";
import { productAdd, productDelete } from "../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const f = async (companyId) => {
    const [companyResponse, companyError] = await Psql.query(
      `SELECT * FROM companies WHERE id=${companyId}`
    );
    if (companyError) {
      res.status(500).json({ error: companyError });
      return;
    } else if (companyResponse.rows.length === 1) {
      res.status(400).json({ error: "Invalid company id" });
      return;
    }

    let nextProductId = companyResponse.rows[0].next_product_id;
    const companyName = companyResponse.rows[0].name;
    const departments = companyResponse.rows[0].departments.split(":");
    const latitude = companyResponse.rows[0].latitude
      .split(",")
      .map((x) => parseFloat(x));
    const longitude = companyResponse.rows[0].longitude
      .split(",")
      .map((x) => parseFloat(x));
    const homepage = companyResponse.rows[0].homepage;
    const domain = homepage.match(/(?<=http(s?):\/\/)[^\/]*/

  /*g)[0];
    if (!homepage) {
      res.status(400).json({
        error:
          'It looks like you haven\'t set your Shopify homepage yet! Please go to the "Company" tab and add your homepage to your profile',
      });
      return;
    }

    Dns.resolveCname(domain, async (err, addresses) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      let isShopify = false;
      addresses.forEach((address) => {
        isShopify = isShopify || address.match(/^.*\.myshopify.com$/) !== null;
      });

      if (!isShopify) {
        const message =
          "Failed to upload products from your Shopify homepage. Please make sure you have set up your Shopify homepage properly!";
        res.status(400).json({ error: message });
        return;
      }

      const [productsResponse, productsError] = await Psql.query(
        `SELECT id FROM products WHERE company_id=${companyId}`
      );
      if (productsError) {
        res.status(500).json({ error: productsError });
        return;
      } else if (productsResponse.rows.length === 0) {
        res.status(400).json({ error: "Invalid company id" });
      }

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

            data.products.map((product, index) => {
              const productName = product.title;
              const image = product.images[0].src;
              const primaryKeywords = product.product_type.split(",");
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

              products.push({
                departments,
                description,
                image,
                link,
                nextProductId: nextProductId + index,
                price,
                priceRange,
                primaryKeywords,
                productName,
              });
            });

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
        res.status(500).json({ error });
        return;
      }

      const [_, psqlErrorUpdateNextId] = await Psql.query(
        SqlString.format("UPDATE companies SET next_product_id=? WHERE id=?", [
          nextProductId,
          companyId,
        ])
      );
      if (psqlErrorUpdateNextId) {
        res.status(500).JSON.stringify({ error: psqlErrorUpdateNextId });
        return;
      }

      const deleteError = await productDelete(
        companyId,
        productsResponse.rows.map((product) => product.id)
      );
      if (deleteError) {
        res.status(500).json({ error: deleteError });
        return;
      }

      await Promise.all(
        products.map(
          async ({
            productName,
            image,
            primaryKeywords,
            departments,
            description,
            link,
            price,
            priceRange,
            nextProductId,
          }) => {
            const [baseProduct, _] = await productAdd({
              companyId,
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
              link,
              nextProductId,
            });
            return baseProduct;
          }
        )
      )
        .then((products) => {
          products.sort((a, b) => a.name.localeCompare(b.name));
          res.status(200).json({ 
            products: products.map((product) => ({
              ...mapKeys(product, (v, k) => camelCase(k)),
            }))
          });
        })
        
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err.message });
        });
    });
  };

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(parseInt(companyId));
  }
  */
}
