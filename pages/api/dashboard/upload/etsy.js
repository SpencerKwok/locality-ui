import SqlString from "sqlstring";
import Xss from "xss";
import { decode, encode } from "html-entities";

import { ETSY_API_KEY } from "../../../../lib/env";
import Psql from "../../../../lib/api/postgresql";
import { productAdd, productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

const currentUploadsRunning = new Set();
export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

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
  const homepages = JSON.parse(businessResponse.rows[0].homepages);
  const uploadSettings =
    JSON.parse(businessResponse.rows[0].upload_settings).Etsy || {};
  const includeTags = new Set(
    (uploadSettings.includeTags || []).map((x) => encode(x).toLowerCase())
  );
  const excludeTags = new Set(
    (uploadSettings.excludeTags || []).map((x) => encode(x).toLowerCase())
  );

  const etsyHomepage = homepages.etsyHomepage || "";
  if (etsyHomepage === "") {
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Etsy storefront yet! Please go to the \"Business\" tab and add your Etsy storefront",
    });
    return;
  }

  const etsyHomepageSections = etsyHomepage.split("/");
  const shopId = etsyHomepageSections[etsyHomepageSections.length - 1];
  const [productsResponse, productsError] = await Psql.query(
    `SELECT id FROM products WHERE business_id=${businessId}`
  );
  if (productsError) {
    res.status(500).json({ error: productsError });
    return;
  }

  if (currentUploadsRunning.has(businessId)) {
    res.status(400).json({
      error:
        "You have an unfinished upload queued. Please wait for it to complete before submitting another upload request",
    });
    return;
  }

  currentUploadsRunning.add(businessId);

  // TODO: Heroku has a timeout restriction
  // that can't be changed, so large uploads
  // cause UI errors. For now, we preemptively
  // return success even though we don't know
  // if the upload will actually succeed
  res.status(200).json({});

  let page = 1;
  let done = false;
  let error = null;
  const products = [];
  while (!done) {
    await fetch(
      `https://openapi.etsy.com/v2/shops/${shopId}/listings/active?api_key=${ETSY_API_KEY}&page=${page}`
    )
      .then((res) => res.json())
      .then(async (data) => {
        if (data.results.length === 0) {
          done = true;
          return;
        }

        for (let index = 0; index < data.results.length; ++index) {
          const product = data.results[index];
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
            continue;
          }

          await fetch(
            `http://openapi.etsy.com/v2/listings/${product.listing_id}?api_key=${ETSY_API_KEY}&includes=MainImage,Variations`
          )
            .then((res) => res.json())
            .then(async (data) => {
              // Data should be encoded from Etsy
              const product = data.results[0];
              const name = Xss(product.title);
              const tags = product.tags.map((x) => Xss(x)).filter(Boolean);
              const description = Xss(
                decode(product.description)
                  .replace(/<br>/g, "\n")
                  .replace(/<[^>]*>/g, "")
              );
              const departments = product.taxonomy_path
                .map((x) => Xss(x))
                .filter(Boolean);
              const link = Xss(product.url);
              const price = parseFloat(product.price);
              const priceRange = [price, price];
              const variantTags = [];
              product.Variations.forEach((variation) => {
                variation.options.forEach(({ formatted_value }) => {
                  variantTags.push(Xss(formatted_value));
                });
              });
              if (variantTags.length === 0) {
                variantTags.push("");
              }
              const variantImages = Array(variantTags.length).fill(
                Xss(
                  product.MainImage.url_570xN || product.MainImage.url_fullxfull
                )
              );

              await fetch(
                `http://openapi.etsy.com/v2/listings/${product.listing_id}/inventory?api_key=${ETSY_API_KEY}`
              )
                .then((res) => res.json())
                .then(async (data) => {
                  data.results.products.forEach((product) => {
                    product.offerings.forEach(({ price }) => {
                      const {
                        before_conversion,
                        currency_formatted_raw,
                        original_currency_code,
                      } = price;

                      if (original_currency_code === "USD") {
                        priceRange[0] = Math.min(
                          priceRange[0],
                          parseFloat(currency_formatted_raw)
                        );
                        priceRange[1] = Math.max(
                          priceRange[1],
                          parseFloat(currency_formatted_raw)
                        );
                      } else {
                        const { currency_formatted_raw } = before_conversion;
                        priceRange[0] = Math.min(
                          priceRange[0],
                          parseFloat(currency_formatted_raw)
                        );
                        priceRange[1] = Math.max(
                          priceRange[1],
                          parseFloat(currency_formatted_raw)
                        );
                      }
                    });
                  });

                  // Etsy API has a maximum of 5 requests per second
                  await new Promise((resolve) => setTimeout(resolve, 500));
                });

              products.push({
                nextProductId: nextProductId + index,
                name,
                departments,
                description,
                link,
                priceRange,
                tags,
                variantImages,
                variantTags,
              });

              // Etsy API has a maximum of 5 requests per second
              await new Promise((resolve) => setTimeout(resolve, 500));
            });
        }

        nextProductId += data.results.length;
        page += 1;

        // Etsy API has a maximum of 5 requests per second
        await new Promise((resolve) => setTimeout(resolve, 500));
      })
      .catch((err) => {
        error = err;
        done = true;
      });
  }
  if (error) {
    console.log(error);
    currentUploadsRunning.delete(businessId);
    return;
  }

  const [, psqlErrorUpdateNextId] = await Psql.query(
    SqlString.format("UPDATE businesses SET next_product_id=? WHERE id=?", [
      nextProductId,
      businessId,
    ])
  );
  if (psqlErrorUpdateNextId) {
    console.log(psqlErrorUpdateNextId);
    currentUploadsRunning.delete(businessId);
    return;
  }

  const deleteError = await productDelete(
    businessId,
    productsResponse.rows.map((product) => product.id)
  );
  if (deleteError) {
    console.log(deleteError);
    currentUploadsRunning.delete(businessId);
    return;
  }

  const [, addError] = await productAdd(
    businessId,
    products,
    false //products.length < 1000
  );
  if (addError) {
    console.log(addError);
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
