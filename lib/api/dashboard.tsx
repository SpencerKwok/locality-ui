import Algolia from "./algolia";
import Cloudinary from "./cloudinary";
import Psql from "./postgresql";
import SqlString from "sqlstring";

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

export interface BaseProduct {
  objectId: string;
  name: string;
  image: string;
}

export interface Product {
  businessId: number;
  departments: string[];
  description: string;
  image: string;
  link: string;
  price: number;
  priceRange: [number, number];
  primaryKeywords: string[];
  productName: string;
  nextProductId?: number;
}

export function addHttpsProtocol(url: string) {
  if (!url.match(/^https:\/\/www\..*$/)) {
    if (url.match(/^https:\/\/(?!www.).*$/)) {
      url = `https://www.${url.slice(8)}`;
    } else if (url.match(/^http:\/\/(?!www.).*$/)) {
      url = `https://www.${url.slice(7)}`;
    } else if (url.match(/^http:\/\/www\..*$/)) {
      url = `https://www.${url.slice(11)}`;
    } else if (url.match(/^www\..*$/)) {
      url = `https://${url}`;
    } else {
      url = `https://www.${url}`;
    }
  }
  return url;
}

export async function productAdd(
  businessId: number,
  products: Array<Product>,
  addToCloudinary = true
) {
  if (products.length === 0) {
    return [[], null];
  }

  const [businessResponse, psqlBusinessError] = await Psql.query(
    SqlString.format(
      "SELECT name, latitude, longitude, next_product_id FROM businesses WHERE id=?",
      [businessId]
    )
  );
  if (psqlBusinessError) {
    return [null, psqlBusinessError];
  }

  const businessName: string = businessResponse.rows[0].name;
  const latitude: string = businessResponse.rows[0].latitude
    .split(",")
    .map((value: string) => value.trim());
  const longitude: string = businessResponse.rows[0].longitude
    .split(",")
    .map((value: string) => value.trim());

  try {
    const baseProducts = await mapLimit<Product, BaseProduct>(
      products,
      5,
      async ({
        departments,
        description,
        image,
        link,
        nextProductId,
        price,
        priceRange,
        primaryKeywords,
        productName,
      }: Product) => {
        // TODO: This only works if we are adding 1 item
        // without a nextProductId. Should keep track of the
        // nextProductId as items are uploaded instead of
        // within the product
        if (!Number.isInteger(nextProductId)) {
          nextProductId = businessResponse.rows[0].next_product_id as number;
          const [_, psqlErrorUpdateNextId] = await Psql.query(
            SqlString.format(
              "UPDATE businesses SET next_product_id=? WHERE id=?",
              [nextProductId + 1, businessId]
            )
          );
          if (psqlErrorUpdateNextId) {
            throw psqlErrorUpdateNextId;
          }
        }

        let url = image;
        if (addToCloudinary) {
          const [cloudinaryUrl, cloudinaryError] = await Cloudinary.upload(
            image,
            {
              exif: false,
              format: "webp",
              public_id: `${businessId}/${nextProductId}`,
              unique_filename: false,
              overwrite: true,
            }
          );
          if (cloudinaryError) {
            throw cloudinaryError;
          }
          url = cloudinaryUrl;
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
            name: productName,
            company: businessName,
            business: businessName,
            primary_keywords: primaryKeywords,
            departments,
            description: description,
            price: price,
            price_range: priceRange,
            link: link,
            image: url,
          },
          { autoGenerateObjectIDIfNotExist: false }
        );
        if (algoliaError) {
          throw algoliaError;
        }

        const [, psqlErrorAddProduct] = await Psql.query(
          SqlString.format(
            "INSERT INTO products (business_id, id, name, image) VALUES (?, ?, E?, ?)",
            [businessId, nextProductId, productName, url]
          )
        );
        if (psqlErrorAddProduct) {
          throw psqlErrorAddProduct;
        }

        return {
          objectId: `${businessId}_${nextProductId}`,
          name: productName,
          image: url,
        };
      }
    );
    return [baseProducts, null];
  } catch (error) {
    return [null, error];
  }
}

export async function productDelete(businessId: number, productIds: string[]) {
  if (productIds.length === 0) {
    return null;
  }

  const productIdsSegments = Array<Array<string>>();
  for (let i = 0; i < productIds.length; i += 100) {
    productIdsSegments.push(
      productIds.slice(i, Math.min(i + 100, productIds.length))
    );
  }

  try {
    await mapLimit(
      productIdsSegments,
      5,
      async (productIdsSegment: Array<string>) => {
        const algoliaObjectIds = productIdsSegment.map(
          (productId) => `${businessId}_${productId}`
        );
        const algoliaError = await Algolia.deleteObjects(algoliaObjectIds);
        if (algoliaError) {
          throw algoliaError;
        }
      }
    );

    for (let i = 0; i < productIdsSegments.length; ++i) {
      const productIdsSegment = productIdsSegments[i];
      const cloudinaryObjectIds = productIdsSegment.map(
        (productId) => `${businessId}/${productId}`
      );
      const cloudinaryError = await Cloudinary.deleteResources(
        cloudinaryObjectIds
      );
      if (cloudinaryError) {
        throw cloudinaryError;
      }
    }

    const [, psqlError] = await Psql.query(
      SqlString.format(`DELETE FROM products WHERE business_id=?`, [businessId])
    );
    if (psqlError) {
      throw psqlError;
    }

    return null;
  } catch (error) {
    return error;
  }
}
