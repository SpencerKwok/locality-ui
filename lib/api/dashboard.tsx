import Algolia from "./algolia";
import Cloudinary from "./cloudinary";
import Psql from "./postgresql";
import SqlString from "sqlstring";

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

export async function productAdd(businessId: number, products: Array<Product>) {
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
    const baseProducts = await Promise.all(
      products.map(
        async (
          {
            departments,
            description,
            image,
            link,
            price,
            priceRange,
            primaryKeywords,
            productName,
            nextProductId,
          },
          index
        ) => {
          // Slow down requests to 2 requests/second
          await new Promise((resolve) => setTimeout(resolve, index * 500));

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

          const [url, cloudinaryError] = await Cloudinary.upload(image, {
            exif: false,
            format: "webp",
            public_id: `${businessId}/${nextProductId}`,
            unique_filename: false,
            overwrite: true,
          });
          if (cloudinaryError) {
            throw cloudinaryError;
          }

          const geolocation = [];
          for (
            let i = 0;
            i < Math.min(latitude.length, longitude.length);
            ++i
          ) {
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
      )
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

  const productIdsSegments = [];
  for (let i = 0; i < productIds.length; i += 100) {
    productIdsSegments.push(
      productIds.slice(i, Math.min(i + 100, productIds.length))
    );
  }

  try {
    await Promise.all(
      productIdsSegments.map(async (productIdsSegment, index) => {
        // Slow down requests to 2 requests/second
        await new Promise((resolve) => setTimeout(resolve, index * 500));

        const algoliaObjectIds = productIdsSegment.map(
          (productId) => `${businessId}_${productId}`
        );
        const algoliaError = await Algolia.deleteObjects(algoliaObjectIds);
        if (algoliaError) {
          throw algoliaError;
        }

        const cloudinaryObjectIds = productIdsSegment.map(
          (productId) => `${businessId}/${productId}`
        );
        const cloudinaryError = await Cloudinary.deleteResources(
          cloudinaryObjectIds
        );
        if (cloudinaryError) {
          throw cloudinaryError;
        }
      })
    );

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
