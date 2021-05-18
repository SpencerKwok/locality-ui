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
    const homepage = businessResponse.rows[0].etsy_homepage;
    if (homepage === "") {
      res.status(400).json({
        error:
          "It looks like you haven't set your business's Etsy storefront yet! Please go to the \"Business\" tab and add your Etsy storefront",
      });
      return;
    }

    const homepageSections = homepage.split("/");
    const shopId = homepageSections[homepageSections.length - 1];
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
      await fetch(
        `https://openapi.etsy.com/v2/shops/${shopId}/listings/active?api_key=${process.env.ETSY_API_KEY}&page=${page}&includes=MainImage`
      )
        .then((res) => res.json())
        .then(async (data) => {
          if (data.results.length === 0) {
            done = true;
            return;
          }

          // Cap user upload to 1000 products
          if (products.length >= 1000) {
            done = true;
            return;
          }

          data.results.forEach((product, index) => {
            const productName = Xss(product.title);
            const image = Xss(
              product.MainImage.url_570xN || product.MainImage.url_fullxfull
            );
            const primaryKeywords = product.tags.map((x) => Xss(x));
            const departments = product.taxonomy_path.map((x) => Xss(x));
            const description = Xss(
              product.description.replace(/<[^>]*>/g, "")
            );
            const link = Xss(product.url);
            const price = parseFloat(product.price);
            const priceRange = [price, price];
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

          nextProductId += data.results.length;
          page += 1;

          // Etsy API has a maximum of 5 requests per second
          await new Promise((resolve) => setTimeout(resolve, 200));
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

    if (products.length >= 1000) {
      const message =
        'Yippers! It appears that your Etsy storefront has more than 1000 products! Please contact us with the subject "Large Etsy Upload" and your account email to locality.info@yahoo.com';
      res.status(400).json({ error: message });
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

    const [baseProducts, addError] = await productAdd(businessId, products);
    if (addError) {
      res.status(500).json({ error: addError });
      return;
    }

    const sortedBaseProducts = baseProducts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    res.status(200).json({
      products: sortedBaseProducts.map((product) => ({
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
