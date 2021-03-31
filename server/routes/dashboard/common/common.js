import algolia from "../../../algolia/client.js";
import cloudinary from "../../../cloudinary/client.js";
import psql from "../../../postgresql/client.js";
import sqlString from "sqlstring";

export const productAdd = async (
  companyId,
  companyName,
  productName,
  image,
  latitude,
  longitude,
  primaryKeywords,
  description,
  price,
  priceRange,
  link,
  nextProductId
) => {
  if (!Number.isInteger(nextProductId)) {
    const [nextIdResponse, psqlErrorGetNextId] = await psql.query(
      sqlString.format("SELECT next_product_id FROM companies WHERE id=?", [
        companyId,
      ])
    );
    if (psqlErrorGetNextId) {
      return [null, psqlErrorGetNextId];
    }

    nextProductId = nextIdResponse.rows[0].next_product_id;

    const [_, psqlErrorUpdateNextId] = await psql.query(
      sqlString.format("UPDATE companies SET next_product_id=? WHERE id=?", [
        nextProductId + 1,
        companyId,
      ])
    );
    if (psqlErrorUpdateNextId) {
      return [null, psqlErrorUpdateNextId];
    }
  }

  const [url, cloudinaryError] = await cloudinary.upload(image, {
    exif: false,
    format: "webp",
    public_id: `${companyId}/${nextProductId}`,
    unique_filename: false,
    overwrite: true,
  });
  if (cloudinaryError) {
    return [null, cloudinaryError];
  }

  const geolocation = [];
  for (let i = 0; i < Math.min(latitude.length, longitude.length); ++i) {
    geolocation.push({
      lat: latitude[i],
      lng: longitude[i],
    });
  }

  const algoliaError = await algolia.saveObject(
    {
      objectID: `${companyId}_${nextProductId}`,
      _geoloc: geolocation,
      name: productName,
      company: companyName,
      primary_keywords: primaryKeywords,
      description: description,
      price: price,
      price_range: priceRange,
      link: link,
      image: url,
    },
    { autoGenerateObjectIDIfNotExist: false }
  );
  if (algoliaError) {
    return [null, algoliaError];
  }

  const [_, psqlErrorAddProduct] = await psql.query(
    sqlString.format(
      "INSERT INTO products (company_id, id, name, image) VALUES (?, ?, E?, ?)",
      [companyId, nextProductId, productName, url]
    )
  );
  if (psqlErrorAddProduct) {
    return [null, psqlErrorAddProduct];
  }

  return [
    {
      objectID: `${companyId}_${nextProductId}`,
      name: productName,
      image: url,
    },
    null,
  ];
};

export const productDelete = async (companyId, productIds) => {
  const algoliaObjectIds = productIds.map(
    (productId) => `${companyId}_${productId}`
  );
  const algoliaError = await algolia.deleteObjects(algoliaObjectIds);
  if (algoliaError) {
    return algoliaError;
  }

  for (let i = 0; i < productIds.length; i += 100) {
    const cloudinaryObjectIds = productIds
      .slice(i, Math.min(i + 100, productIds.length))
      .map((productId) => `${companyId}/${productId}`);
    const cloudinaryError = await cloudinary.deleteResources(
      cloudinaryObjectIds
    );
    if (cloudinaryError) {
      return cloudinaryError;
    }
  }

  const psqlObjectIds = [];
  productIds.forEach((productId) => {
    psqlObjectIds.push(`id=${productId}`);
  });
  const psqlObjectIdString = `(${psqlObjectIds.join(" OR ")})`;
  const [_, psqlError] = await psql.query(
    sqlString.format(
      `DELETE FROM products WHERE company_id=? AND ${psqlObjectIdString}`,
      [companyId]
    )
  );
  if (psqlError) {
    return psqlError;
  }

  return null;
};
