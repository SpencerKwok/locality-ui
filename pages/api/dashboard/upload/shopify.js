import { camelCase, mapKeys } from "lodash";
import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { productAdd, productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

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
    const uploadSettings =
      JSON.parse(businessResponse.rows[0].upload_settings).Shopify || {};
    const includeTags = new Set(
      (uploadSettings.includeTags || []).map((x) => x.toLowerCase())
    );
    const excludeTags = new Set(
      (uploadSettings.excludeTags || []).map((x) => x.toLowerCase())
    );

    // TODO: Sometimes there is a certificate hostname mismatch that
    // causes an issue when connecting directly with HSTS. Although
    // not recommended due to MITMA, we switch to http and hope redirect
    // to https by the server is good enough
    const homepage = businessResponse.rows[0].shopify_homepage.replace(
      "https",
      "http"
    );

    if (homepage === "") {
      res.status(400).json({
        error:
          "It looks like you haven't set your business's Shopify website yet! Please go to the \"Business\" tab and add your Shopify website",
      });
      return;
    }

    const [productsResponse, productsError] = await Psql.query(
      `SELECT id FROM products WHERE business_id=${businessId}`
    );
    if (productsError) {
      res.status(500).json({ error: productsError });
      return;
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
            let shouldInclude = true;
            let shouldExclude = false;
            if (includeTags.size > 0) {
              shouldInclude = false;
              for (let i = 0; i < product.tags.length; i++) {
                if (includeTags.has(product.tags[i].toLowerCase())) {
                  shouldInclude = true;
                  break;
                }
              }
            }
            if (excludeTags.size > 0) {
              for (let i = 0; i < product.tags.length; i++) {
                if (excludeTags.has(product.tags[i].toLowerCase())) {
                  shouldExclude = true;
                  break;
                }
              }
            }

            if (shouldExclude || !shouldInclude) {
              return;
            }

            const productName = Xss(product.title);
            const image = Xss(product.images[0].src);
            const primaryKeywords = [
              ...new Set([
                ...product.product_type
                  .split(",")
                  .map((x) => Xss(x.trim()))
                  .filter(Boolean),
                ...product.tags.map((x) => Xss(x.trim())).filter(Boolean),
              ]),
            ];
            const description = Xss(product.body_html.replace(/<[^>]*>/g, ""));
            const link = Xss(`${homepage}/products/${product.handle}`);
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

          // Cap Shopify API calls to 100 requests per second
          await new Promise((resolve) => setTimeout(resolve, 10));
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

    const [baseProducts, addError] = await productAdd(
      businessId,
      products,
      products.length < 1000
    );
    if (addError) {
      res.status(500).json({ error: addError });
      return;
    }

    const sortedBasePorducts = baseProducts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    res.status(200).json({
      products: sortedBasePorducts.map((product) => ({
        ...mapKeys(product, (v, k) => camelCase(k)),
      })),
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