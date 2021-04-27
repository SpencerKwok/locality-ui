import Algolia from "./algolia.js";
import Cloudinary from "./cloudinary.js";
import Psql from "./postgresql.js";
import SqlString from "sqlstring";

export async function productAdd(product) {
  const {
    companyId,
    companyName,
    departments,
    description,
    image,
    latitude,
    link,
    longitude,
    nextProductId,
    price,
    priceRange,
    primaryKeywords,
    productName,
  } = product;

  if (!Number.isInteger(nextProductId)) {
    const [nextIdResponse, psqlErrorGetNextId] = await Psql.query(
      SqlString.format("SELECT next_product_id FROM companies WHERE id=?", [
        companyId,
      ])
    );
    if (psqlErrorGetNextId) {
      return [null, psqlErrorGetNextId];
    }

    nextProductId = nextIdResponse.rows[0].next_product_id;

    const [_, psqlErrorUpdateNextId] = await Psql.query(
      SqlString.format("UPDATE companies SET next_product_id=? WHERE id=?", [
        nextProductId + 1,
        companyId,
      ])
    );
    if (psqlErrorUpdateNextId) {
      return [null, psqlErrorUpdateNextId];
    }
  }

  const [url, cloudinaryError] = await Cloudinary.upload(image, {
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

  const algoliaError = await Algolia.saveObject(
    {
      objectID: `${companyId}_${nextProductId}`,
      _geoloc: geolocation,
      name: productName,
      company: companyName,
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
    return [null, algoliaError];
  }

  const [_, psqlErrorAddProduct] = await Psql.query(
    SqlString.format(
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
}

export async function productDelete(companyId, productIds) {
  if (productIds.length === 0) {
    return null;
  }

  const algoliaObjectIds = productIds.map(
    (productId) => `${companyId}_${productId}`
  );
  const algoliaError = await Algolia.deleteObjects(algoliaObjectIds);
  if (algoliaError) {
    return algoliaError;
  }

  for (let i = 0; i < productIds.length; i += 100) {
    const cloudinaryObjectIds = productIds
      .slice(i, Math.min(i + 100, productIds.length))
      .map((productId) => `${companyId}/${productId}`);
    const cloudinaryError = await Cloudinary.deleteResources(
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
  const [_, psqlError] = await Psql.query(
    SqlString.format(
      `DELETE FROM products WHERE company_id=? AND ${psqlObjectIdString}`,
      [companyId]
    )
  );
  if (psqlError) {
    return psqlError;
  }

  return null;
}
