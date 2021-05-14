import { camelCase, mapKeys } from "lodash";
import Dns from "dns";
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
    const domain = homepage.match(/(?<=http(s?):\/\/)[^\/]*/g)[0];
    if (domain !== "www.etsy.com") {
      const message =
        "Failed to upload products from your Etsy website. Please make sure you have set up your Etsy website properly!";
      res.status(400).json({ error: message });
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
      await fetch(
        `https://openapi.etsy.com/v2/shops/${shopId}/listings/active?api_key=${process.env.ETSY_API_KEY}&page=${page}&includes=MainImage`
      )
        .then((res) => res.json())
        .then(async (data) => {
          if (data.results.length === 0) {
            done = true;
            return;
          }

          data.results.forEach((product, index) => {
            const productName = product.title;
            const image =
              product.MainImage.url_570xN || product.MainImage.url_fullxfull;
            const primaryKeywords = product.tags;
            const departments = product.taxonomy_path;
            const description = product.description.replace(/<[^>]*>/g, "");
            const link = product.url;
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
