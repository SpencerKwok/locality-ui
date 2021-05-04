import Algolia from "./algolia.js";
import Cloudinary from "./cloudinary.js";
import Psql from "./postgresql.js";
import SqlString from "sqlstring";

export async function productAdd(product) {
  const {
    businessId,
    departments,
    description,
    image,
    link,
    price,
    priceRange,
    primaryKeywords,
    productName,
  } = product;

  let { nextProductId } = product;
  const [businessResponse, psqlBusinessError] = await Psql.query(
    SqlString.format(
      "SELECT name, latitude, longitude, next_product_id FROM businesses WHERE id=?",
      [businessId]
    )
  );
  if (psqlBusinessError) {
    return [null, psqlBusinessError];
  }

  const businessName = businessResponse.rows[0].name;
  const latitude = businessResponse.rows[0].latitude
    .split(",")
    .map((value) => value.trim());
  const longitude = businessResponse.rows[0].longitude
    .split(",")
    .map((value) => value.trim());

  if (!Number.isInteger(nextProductId)) {
    nextProductId = businessResponse.rows[0].next_product_id;

    const [_, psqlErrorUpdateNextId] = await Psql.query(
      SqlString.format("UPDATE businesses SET next_product_id=? WHERE id=?", [
        nextProductId + 1,
        businessId,
      ])
    );
    if (psqlErrorUpdateNextId) {
      return [null, psqlErrorUpdateNextId];
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
    return [null, cloudinaryError];
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
    return [null, algoliaError];
  }

  const [_, psqlErrorAddProduct] = await Psql.query(
    SqlString.format(
      "INSERT INTO products (company_id, business_id, id, name, image) VALUES (?, ?, ?, E?, ?)",
      [businessId, businessId, nextProductId, productName, url]
    )
  );
  if (psqlErrorAddProduct) {
    return [null, psqlErrorAddProduct];
  }

  return [
    {
      objectId: `${businessId}_${nextProductId}`,
      name: productName,
      image: url,
    },
    null,
  ];
}

export async function productDelete(businessId, productIds) {
  if (productIds.length === 0) {
    return null;
  }

  const algoliaObjectIds = productIds.map(
    (productId) => `${businessId}_${productId}`
  );
  const algoliaError = await Algolia.deleteObjects(algoliaObjectIds);
  if (algoliaError) {
    return algoliaError;
  }

  for (let i = 0; i < productIds.length; i += 100) {
    const cloudinaryObjectIds = productIds
      .slice(i, Math.min(i + 100, productIds.length))
      .map((productId) => `${businessId}/${productId}`);
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
      `DELETE FROM products WHERE business_id=? AND ${psqlObjectIdString}`,
      [businessId]
    )
  );
  if (psqlError) {
    return psqlError;
  }

  return null;
}
