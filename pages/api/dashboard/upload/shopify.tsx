import Dns from "dns";
import SqlString from "sqlstring";
import Xss from "xss";
import { decode, encode } from "html-entities";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { productAdd, productDelete } from "lib/api/dashboard";
import { runMiddlewareBusiness } from "lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type {
  DatabaseProduct,
  Homepages,
  UploadTypeSettings,
} from "common/Schema";

/*
This list may change at any time, but for now these are all the valid Shopify IP addresses
Source: https://help.shopify.com/en/manual/online-store/domains/managing-domains/troubleshooting
*/
const validShopifyIp4 = new Set<string>([
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

const currentUploadsRunning = new Set<number>();
export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/shopify",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: { id: number } = req.body;
  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  if (!Number.isInteger(businessId)) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/shopify",
      message: "Invalid payload",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const businessResponse = await Psql.select<{
    homepages: string;
    next_product_id: number;
    upload_settings: string;
  }>({
    table: "businesses",
    values: ["homepages", "next_product_id", "upload_settings"],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (!businessResponse) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (businessResponse.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: "Failed to SELECT from Heroku PSQL: Business does not exist",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  let nextProductId: number = businessResponse.rows[0].next_product_id;
  const homepages: Homepages = JSON.parse(businessResponse.rows[0].homepages);
  const uploadSettings: UploadTypeSettings =
    JSON.parse(businessResponse.rows[0].upload_settings).shopify ?? {};
  const includeTags = new Set<string>(
    (uploadSettings.includeTags ?? []).map((x: string) =>
      encode(x.trim()).toLowerCase()
    )
  );
  const excludeTags = new Set<string>(
    (uploadSettings.excludeTags ?? []).map((x: string) =>
      encode(x.trim()).toLowerCase()
    )
  );
  const departmentMapping = new Map<string, Array<string>>(
    (uploadSettings.departmentMapping ?? []).map(
      ({ key, departments }: { key: string; departments: Array<string> }) => [
        encode(key.trim().toLowerCase()),
        departments.map((x) => x.trim()),
      ]
    )
  );
  let shopifyHomepage: string = homepages.shopifyHomepage ?? "";

  if (!shopifyHomepage) {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/shopify",
      message: "Attempted to upload Shopify products with no Shopify homepage",
      params: { body: reqBody },
    });
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Shopify website yet! Please go to the \"Business\" tab and add your Shopify website",
    });
    return;
  }

  const domain = (shopifyHomepage.match(/www\.[^\/]+/g) ?? [""])[0] || "";
  const addresses: Array<string> = await Dns.promises
    .resolve4(domain)
    .catch(() => {
      SumoLogic.log({
        level: "error",
        method: "dashboard/upload/shopify",
        message:
          "Attempted to upload Shopify products from an invalid Shopify domain",
        params: { body: reqBody, addresses },
      });
      res.status(400).json({
        error:
          'It looks like your Shopify website has not been set up properly. Please go to the "Business" tab and make sure your Shopify website URL is setup correctly or contact us at locality.info@yahoo.com for assistance',
      });
      return [];
    });

  let isShopify = addresses.length > 0;
  for (const address of addresses) {
    if (!validShopifyIp4.has(address)) {
      isShopify = false;
      break;
    }
  }
  if (!isShopify) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message:
        "Attempted to upload Shopify products from an invalid Shopify domain",
      params: { body: reqBody, addresses },
    });
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

  const productsResponse = await Psql.select<{ id: number }>({
    table: "products",
    values: ["id"],
    conditions: SqlString.format("business_id=?", [businessId]),
  });
  if (!productsResponse) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: "Failed to SELECT from HEROKU PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (currentUploadsRunning.has(businessId)) {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/shopify",
      message:
        "Attempted to re-upload Shopify products with an unfinished upload queued",
      params: { body: reqBody },
    });
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
  res.status(204).end();

  let page = 1;
  let done = false;
  let error: Error | null = null;
  const products: Array<DatabaseProduct> = [];
  do {
    try {
      await fetch(
        `${shopifyHomepage}/collections/all/products.json?page=${page}`
      )
        .then(async (res) => res.json())
        .then(async (data) => {
          if (data.products.length === 0) {
            done = true;
            return;
          }

          data.products.forEach((product: any, index: number) => {
            let shouldInclude = true;
            let shouldExclude = false;
            if (includeTags.size > 0) {
              shouldInclude = false;
              for (const tag of product.tags) {
                if (includeTags.has(tag.toLowerCase())) {
                  shouldInclude = true;
                  break;
                }
              }
            }
            if (excludeTags.size > 0) {
              for (const tag of product.tags) {
                if (excludeTags.has(tag.toLowerCase())) {
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

            const productTypes: Array<string> = product.product_type
              .split(",")
              .map((x: string) => Xss(x.trim()))
              .filter(Boolean);
            const departments: Array<string> = [];
            productTypes.forEach((value) => {
              const department = departmentMapping.get(value.toLowerCase());
              if (department) {
                departments.push(...department);
              }
            });

            // Shopify data is encoded, so we need to decode it
            const name = Xss(product.title);
            const tags = Array.from(
              new Set([
                ...productTypes.map((x) => decode(x)),
                ...product.tags
                  .map((x: string) => decode(Xss(x.trim())))
                  .filter(Boolean),
              ])
            );
            const description = Xss(
              product.body_html.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")
            );
            // Don't decode link, it is meant to be encoded
            const link = Xss(`${shopifyHomepage}/products/${product.handle}`)
              .replace(/\/\/+/g, "/")
              .replace("https:/", "https://");
            const price = parseFloat(product.variants[0].price);
            const priceRange: FixedLengthArray<[number, number]> = [
              price,
              price,
            ];
            product.variants.forEach((variant: { price: string }) => {
              priceRange[0] = Math.min(
                priceRange[0],
                parseFloat(variant.price)
              );
              priceRange[1] = Math.max(
                priceRange[1],
                parseFloat(variant.price)
              );
            });
            // Don't decode image urls, they are meant to be encoded
            const variantImages = Array<string>(product.variants.length).fill(
              product.images[0].src.replace(".jpg", "_400x.jpg")
            );
            const variantTags = product.variants.map(
              ({ title }: { title: string }) => decode(Xss(title.trim()))
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
        });
    } catch (err: unknown) {
      error = err as Error;
      done = true;
    }
  } while (!done);

  if (error !== null) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: "Failed to fetch products from Shopify",
      params: { body: reqBody, error },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  const psqlErrorUpdateNextId = await Psql.update({
    table: "businesses",
    values: [{ key: "next_product_id", value: nextProductId }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlErrorUpdateNextId) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: `Failed to UPDATE Heroku PSQL: ${psqlErrorUpdateNextId.message}`,
      params: { body: reqBody },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  const deleteError = await productDelete(
    businessId,
    productsResponse.rows.map((product) => product.id)
  );
  if (deleteError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: `Failed to delete old products: ${deleteError.message}`,
      params: { body: reqBody },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  const baseProducts = await productAdd(
    businessId,
    products,
    false //products.length < 1000
  );
  if (!baseProducts) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/shopify",
      message: "Failed to add old products: Missing response",
      params: { body: reqBody },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
