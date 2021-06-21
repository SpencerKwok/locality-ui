import { decode } from "html-entities";
import SqlString from "sqlstring";

import Algolia from "lib/api/algolia";
import Cloudinary from "lib/api/cloudinary";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { BaseProduct, DatabaseProduct } from "../../common/Schema";

const mapLimit = async <P extends any, R extends any>(
  arr: Array<P>,
  limit: number,
  func: (item: P) => Promise<R>
) => {
  let results = Array<R>();
  await Promise.all(
    arr.slice(0, limit).map(async (_, i) => {
      results[i] = await func(arr[i]);
      while ((i = limit++) < arr.length) {
        results[i] = await func(arr[i]);
      }
    })
  );
  return results;
};

export function addHttpsProtocol(url: string) {
  if (url.match(/^http:\/\/.+/g)) {
    url = `https://${url.slice(7)}`;
  } else if (!url.match(/^https:\/\/.+/g)) {
    url = `https://${url}`;
  }
  return url;
}

export async function productAdd(
  businessId: number,
  products: Array<DatabaseProduct>,
  addToCloudinary = true
): Promise<Array<BaseProduct> | null> {
  if (products.length === 0) {
    return [];
  }

  const businessResponse = await Psql.select<{
    name: string;
    latitude: string;
    longitude: string;
    next_product_id: number;
  }>({
    table: "businesses",
    values: ["name", "latitude", "longitude", "next_product_id"],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (!businessResponse) {
    SumoLogic.log({
      level: "error",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { businessId, products },
    });
    return null;
  }

  const businessName: string = businessResponse.rows[0].name;
  const latitude: string[] = businessResponse.rows[0].latitude.split(",");
  const longitude: string[] = businessResponse.rows[0].longitude.split(",");

  try {
    const baseProducts = await mapLimit<DatabaseProduct, BaseProduct>(
      products,
      5,
      async ({
        nextProductId,
        name,
        departments,
        description,
        link,
        priceRange,
        tags,
        variantImages,
        variantTags,
      }: DatabaseProduct) => {
        // TODO: This only works if we are adding 1 item
        // without a nextProductId. Should keep track of the
        // nextProductId as items are uploaded instead of
        // within the product
        if (!Number.isInteger(nextProductId)) {
          nextProductId = businessResponse.rows[0].next_product_id;
          const psqlErrorUpdateNextId = await Psql.update({
            table: "businesses",
            values: [{ key: "next_product_id", value: nextProductId + 1 }],
            conditions: SqlString.format("id=?", [businessId]),
          });
          if (psqlErrorUpdateNextId) {
            throw psqlErrorUpdateNextId;
          }
        }

        if (addToCloudinary) {
          const variantMap = new Map<string, string>();
          for (let i = 0; i < variantImages.length; ++i) {
            const variantImage = variantImages[i];
            if (variantMap.has(variantImage)) {
              variantImages[i] = variantMap.get(variantImage) || "";
              continue;
            }

            const url = await Cloudinary.upload(variantImage, {
              exif: false,
              format: "webp",
              public_id: `${businessId}/${nextProductId}/${i}`,
              unique_filename: false,
              overwrite: true,
            });
            if (!url) {
              throw Error(
                "Failed to upload image to Cloudinary: Missing response"
              );
            }

            variantImages[i] = url;
            variantMap.set(variantImage, url);
          }
        }

        const geolocation = [];
        for (let i = 0; i < Math.min(latitude.length, longitude.length); ++i) {
          geolocation.push({
            lat: parseFloat(latitude[i]),
            lng: parseFloat(longitude[i]),
          });
        }

        const algoliaError = await Algolia.saveObject(
          {
            objectID: `${businessId}_${nextProductId}`,
            _geoloc: geolocation,
            name: decode(name),
            business: decode(businessName),
            description: decode(description),
            description_length: decode(description)
              .replace(/\s+/g, "")
              .replace(/\n+/g, "").length,
            departments: departments.map((department) => decode(department)),
            link: link,
            price_range: priceRange,
            tags: tags.map((tag) => decode(tag)),
            tags_length: decode(tags.join("")).replace(/\s+/g, "").length,
            variant_images: variantImages,
            variant_tags: variantTags.map((tag) => decode(tag)),
          },
          { autoGenerateObjectIDIfNotExist: false }
        );
        if (algoliaError) {
          throw algoliaError;
        }

        const psqlErrorAddProduct = await Psql.insert({
          table: "products",
          values: [
            { key: "business_id", value: businessId },
            { key: "id", value: nextProductId || 0 }, // Shouldn't be undefined
            { key: "name", value: name },
            { key: "preview", value: variantImages[0] },
          ],
        });
        if (psqlErrorAddProduct) {
          throw psqlErrorAddProduct;
        }

        return {
          objectId: `${businessId}_${nextProductId}`,
          name: name,
          preview: variantImages[0],
        };
      }
    );
    return baseProducts;
  } catch (error) {
    SumoLogic.log({
      level: "error",
      message: `Failed to add product: ${error.message}`,
      params: { businessId, products },
    });
    return null;
  }
}

export async function productDelete(
  businessId: number,
  productIds: number[]
): Promise<Error | null> {
  if (productIds.length === 0) {
    return null;
  }

  const productIdsSegments = Array<Array<number>>();
  for (let i = 0; i < productIds.length; i += 100) {
    productIdsSegments.push(
      productIds.slice(i, Math.min(i + 100, productIds.length))
    );
  }

  try {
    await mapLimit(
      productIdsSegments,
      5,
      async (productIdsSegment: Array<number>) => {
        const algoliaObjectIds = productIdsSegment.map(
          (productId) => `${businessId}_${productId}`
        );
        const algoliaError = await Algolia.deleteObjects(algoliaObjectIds);
        if (algoliaError) {
          throw algoliaError;
        }
      }
    );

    /*
    Don't delete from Cloudinary for now..
    We are close to max monthly limit...

    for (let i = 0; i < productIds.length; ++i) {
      const cloudinaryError = await Cloudinary.deleteFolder(
        `${businessId}/${productIds[i]}`
      );
      if (cloudinaryError) {
        throw cloudinaryError;
      }
    }
    */

    for (let i = 0; i < productIdsSegments.length; ++i) {
      const productIdsSegment = productIdsSegments[i];
      const psqlObjectIds = productIdsSegment.map(
        (productId) => `id=${productId}`
      );

      const psqlError = await Psql.delete({
        table: "products",
        conditions: SqlString.format(
          `business_id=? AND (${psqlObjectIds.join(" OR ")})`,
          [businessId]
        ),
      });
      if (psqlError) {
        throw psqlError;
      }
    }

    return null;
  } catch (error) {
    SumoLogic.log({
      level: "error",
      message: `Failed to delete product: ${error.message}`,
      params: { businessId, productIds },
    });
    return error;
  }
}
