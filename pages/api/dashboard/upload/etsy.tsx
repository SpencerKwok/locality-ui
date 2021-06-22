import SqlString from "sqlstring";
import Xss from "xss";
import { decode, encode } from "html-entities";

import { ETSY_API_KEY } from "lib/env";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { productAdd, productDelete } from "lib/api/dashboard";
import { runMiddlewareBusiness } from "lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type {
  BaseUploadTypeSettings,
  DatabaseProduct,
  HomepagesUpdateResponse,
} from "common/Schema";

const currentUploadsRunning = new Set<number>();
export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/etsy",
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
      method: "dashboard/upload/etsy",
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
      method: "dashboard/upload/etsy",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (businessResponse.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/etsy",
      message: "Failed to SELECT from Heroku PSQL: Business does not exist",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  let nextProductId = businessResponse.rows[0].next_product_id;
  const homepages: HomepagesUpdateResponse = JSON.parse(
    businessResponse.rows[0].homepages
  );
  const uploadSettings: BaseUploadTypeSettings =
    JSON.parse(businessResponse.rows[0].upload_settings).etsy ?? {};
  const includeTags: Set<string> = new Set(
    (uploadSettings.includeTags ?? []).map((x: string) =>
      encode(x.trim()).toLowerCase()
    )
  );
  const excludeTags: Set<string> = new Set(
    (uploadSettings.excludeTags ?? []).map((x: string) =>
      encode(x.trim()).toLowerCase()
    )
  );

  const etsyHomepage: string = homepages.etsyHomepage ?? "";
  if (!etsyHomepage) {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/etsy",
      message: "Attempted to upload Etsy products with no Etsy homepage",
      params: { body: reqBody },
    });
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Etsy storefront yet! Please go to the \"Business\" tab and add your Etsy storefront",
    });
    return;
  }

  const etsyHomepageSections = etsyHomepage.split("/");
  const shopId = etsyHomepageSections[etsyHomepageSections.length - 1];
  const productsResponse = await Psql.select<{ id: number }>({
    table: "products",
    values: ["id"],
    conditions: SqlString.format("business_id=?", [businessId]),
  });
  if (!productsResponse) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/etsy",
      message: "Failed to SELECT from HEROKU PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (currentUploadsRunning.has(businessId)) {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/etsy",
      message:
        "Attempted to re-upload Etsy products with an unfinished upload queued",
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
  const products = Array<DatabaseProduct>();
  do {
    try {
      await fetch(
        `https://openapi.etsy.com/v2/shops/${shopId}/listings/active?api_key=${ETSY_API_KEY}&page=${page}`
      )
        .then(async (res) => res.json())
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
              continue;
            }

            await fetch(
              `http://openapi.etsy.com/v2/listings/${product.listing_id}?api_key=${ETSY_API_KEY}&includes=MainImage,Variations`
            )
              .then(async (res) => res.json())
              .then(async (data) => {
                // Etsy data is encoded, so we need to decode it
                const product: any = data.results[0];
                const name: string = decode(Xss(product.title.trim()));
                const tags: Array<string> = product.tags
                  .map((x: string) => decode(Xss(x.trim())))
                  .filter(Boolean);
                const description: string = Xss(
                  decode(product.description.trim())
                    .replace(/<br>/g, "\n")
                    .replace(/<[^>]*>/g, "")
                );
                const departments: Array<string> = product.taxonomy_path
                  .map((x: string) => decode(Xss(x.trim())))
                  .filter(Boolean);
                // Don't decode link, links are meant to be encoded
                const link: string = Xss(product.url.trim());
                const price: number = parseFloat(product.price);
                const priceRange: FixedLengthArray<[number, number]> = [
                  price,
                  price,
                ];
                const variantTags: Array<string> = [];
                product.Variations.forEach(
                  (variation: {
                    options: Array<{ formatted_value: string }>;
                  }) => {
                    variation.options.forEach(({ formatted_value }) => {
                      variantTags.push(Xss(formatted_value.trim()));
                    });
                  }
                );
                if (variantTags.length === 0) {
                  variantTags.push("");
                }
                const mainImage: { url_fullxfull: string; url_570xN?: string } =
                  product.MainImage;
                const variantImages = Array(variantTags.length).fill(
                  Xss((mainImage.url_570xN ?? mainImage.url_fullxfull).trim())
                );

                await fetch(
                  `http://openapi.etsy.com/v2/listings/${product.listing_id}/inventory?api_key=${ETSY_API_KEY}`
                )
                  .then(async (res) => res.json())
                  .then(async (data) => {
                    data.results.products.forEach(
                      (product: {
                        offerings: Array<{
                          price: {
                            before_conversion: {
                              currency_formatted_raw: string;
                            };
                            currency_formatted_raw: string;
                            original_currency_code: string;
                          };
                        }>;
                      }) => {
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
                            const { currency_formatted_raw } =
                              before_conversion;
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
                      }
                    );

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
        });
    } catch (err: unknown) {
      error = err as Error;
      done = true;
    }
  } while (!done);

  if (error) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/etsy",
      message: "Failed to fetch products from Etsy",
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
      method: "dashboard/upload/etsy",
      message: "Failed to UPDATE Heroku PSQL",
      params: { body: reqBody, error: psqlErrorUpdateNextId },
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
      method: "dashboard/upload/etsy",
      message: "Failed to delete old products",
      params: { body: reqBody, error: deleteError },
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
      method: "dashboard/upload/etsy",
      message: "Failed to add old products: Missing response",
      params: { body: reqBody },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
