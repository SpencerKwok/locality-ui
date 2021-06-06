import Dns from "dns";
import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { productAdd, productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

/*
This list may change at any time, but for now these are all the valid Shopify IP addresses
Source: https://help.shopify.com/en/manual/online-store/domains/managing-domains/troubleshooting
*/
const validShopifyIp4 = new Set([
  "23.227.38.32",
  "23.227.38.36",
  "23.227.38.65",
  "23.227.38.66",
  "23.227.38.67",
  "23.227.38.68",
  "23.227.38.69",
  "23.227.38.70",
  "23.227.38.71",
  "23.227.38.72",
  "23.227.38.73",
  "23.227.38.74",
]);

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
  const departments = businessResponse.rows[0].departments
    .split(":")
    .filter(Boolean);
  const homepages = JSON.parse(businessResponse.rows[0].homepages);
  const uploadSettings =
    JSON.parse(businessResponse.rows[0].upload_settings).Shopify || {};
  const includeTags = new Set(
    (uploadSettings.includeTags || []).map((x) => x.toLowerCase())
  );
  const excludeTags = new Set(
    (uploadSettings.excludeTags || []).map((x) => x.toLowerCase())
  );
  let shopifyHomepage = homepages.shopifyHomepage || "";

  if (!shopifyHomepage) {
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Shopify website yet! Please go to the \"Business\" tab and add your Shopify website",
    });
    return;
  }

  const domain = shopifyHomepage.match(/www\.[^\/]+/g)[0] || "";
  const addresses = await Dns.promises.resolve4(domain).catch(() => {
    res.status(400).json({
      error:
        'It looks like your Shopify website has not been set up properly. Please go to the "Business" tab and make sure your Shopify website URL is setup correctly or contact us at locality.info@yahoo.com for assistance',
    });
    return;
  });

  let isShopify = addresses.length > 0;
  for (let i = 0; i < addresses.length; ++i) {
    if (!validShopifyIp4.has(addresses[i])) {
      isShopify = false;
      break;
    }
  }
  if (!isShopify) {
    res.status(400).json({
      error:
        'It looks like your Shopify website has not been set up properly. Please go to the "Business" tab and make sure your Shopify website URL is setup correctly or contact us at locality.info@yahoo.com for assistance',
    });
    return;
  }

  // TODO: There is a certificate hostname mismatch when
  // fetching from the www subdomain instead of the root
  // domain. For now, we just replace the www subdomain
  // with the root domain, but there is probably a better
  // way of handling this...
  if (domain.match(/.*\.myshopify.com(\/)?/g)) {
    shopifyHomepage = shopifyHomepage.replace("https://www.", "https://");
  }

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
    await fetch(`${shopifyHomepage}/collections/all/products.json?page=${page}`)
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

          if (product.images.length === 0 || product.variants.length === 0) {
            return;
          }

          // Data should already be encoded from Shopify
          const name = Xss(product.title);
          const tags = [
            ...new Set([
              ...product.product_type
                .split(",")
                .map((x) => Xss(x.trim()))
                .filter(Boolean),
              ...product.tags.map((x) => Xss(x.trim())).filter(Boolean),
            ]),
          ];
          const description = Xss(
            product.body_html.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")
          );
          const link = Xss(`${shopifyHomepage}/products/${product.handle}`)
            .replace(/\/\/+/g, "/")
            .replace("https:/", "https://");
          const price = parseFloat(product.variants[0].price);
          let priceRange = [price, price];
          product.variants.forEach((variant) => {
            priceRange[0] = Math.min(priceRange[0], parseFloat(variant.price));
            priceRange[1] = Math.max(priceRange[1], parseFloat(variant.price));
          });
          const variantImages = Array(product.variants.length).fill(
            product.images[0].src.replace(".jpg", "_400x.jpg")
          );
          const variantTags = product.variants.map(({ title }) =>
            Xss(title.trim())
          );

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
        });

        nextProductId += data.products.length;
        page += 1;

        // Cap Shopify API calls to 100 requests per second
        await new Promise((resolve) => setTimeout(resolve, 10));
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
