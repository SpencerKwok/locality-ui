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

  const f = async (businessId) => {
    const [businessResponse, businessError] = await Psql.query(
      `SELECT * FROM businesses WHERE id=${businessId}`
    );
    if (businessError) {
      res.status(500).json({ error: businessError });
      return;
    } else if (businessResponse.rows.length !== 1) {
      res.status(400).json({ error: "Invalid business id" });
      return;
    }

    let nextProductId = businessResponse.rows[0].next_product_id;
    const departments = businessResponse.rows[0].departments.split(":");
    const homepage = businessResponse.rows[0].shopify_homepage;
    if (!homepage) {
      res.status(400).json({
        error:
          "It looks like you haven't set your business's Shopify website yet! Please go to the \"Business\" tab and add your Shopify website",
      });
      return;
    }

    const domain = homepage.match(/(?<=http(s?):\/\/)[^\/]*/g)[0];
    let addresses = [];
    try {
      addresses = await Dns.promises.resolveCname(domain);
    } catch (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    let isShopify = false;
    addresses.forEach((address) => {
      isShopify = isShopify || address.match(/^.*\.myshopify.com$/) !== null;
    });
    if (!isShopify) {
      const message =
        "Failed to upload products from your Shopify website. Please make sure you have set up your Shopify website properly!";
      res.status(400).json({ error: message });
      return;
    }

    const [productsResponse, productsError] = await Psql.query(
      `SELECT id FROM products WHERE business_id=${businessId}`
    );
    if (productsError) {
      res.status(500).json({ error: productsError });
      return;
    } else if (productsResponse.rows.length === 0) {
      res.status(400).json({ error: "Invalid business id" });
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

          data.products.forEach((product, index) => {
            if (product.images.length <= 0 || product.variants.length <= 0) {
              return;
            }

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

    const [, psqlErrorUpdateNextId] = await Psql.query(
      SqlString.format("UPDATE businesses SET next_product_id=? WHERE id=?", [
        nextProductId,
        businessId,
      ])
    );
    if (psqlErrorUpdateNextId) {
      res.status(500).JSON.stringify({ error: psqlErrorUpdateNextId });
      return;
    }

    const deleteError = await productDelete(
      businessId,
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
          const [baseProduct] = await productAdd({
            businessId,
            departments,
            description,
            image,
            link,
            nextProductId,
            price,
            priceRange,
            primaryKeywords,
            productName,
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
          })),
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  };

  const { id } = req.locals.user;
  if (id === 0) {
    if (Number.isInteger(req.body.businessId)) {
      await f(req.body.businessId);
    } else {
      res.status(400).json({ error: "Invalid business id" });
    }
  } else {
    await f(id);
  }
}
