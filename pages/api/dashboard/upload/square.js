import Papa from "papaparse";
import SqlString from "sqlstring";
import Xss from "xss";

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
  const businessId = id === 0 ? req.body.businessId : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  let csv = Xss(req.body.csv || "");
  if (csv === "") {
    res.status(400).json({ error: "Invalid csv" });
    return;
  }
  try {
    csv = Papa.parse(csv);
  } catch {
    res.status(400).json({ error: "Invalid csv" });
    return;
  }
  if (csv.errors.length > 0) {
    res.status(400).json({ error: "Invalid csv" });
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
  const squareHomepage = businessResponse.rows[0].square_homepage;
  if (squareHomepage === "") {
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Square website yet! Please go to the \"Business\" tab and add your Square website",
    });
    return;
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

  const products = [];
  csv.data.slice(1).forEach((value) => {
    const [
      productPage,
      productUrl,
      title,
      description,
      price,
      categories,
      tags,
      hostedImageUrls,
    ] = value;
    if (
      hostedImageUrls === "" ||
      productUrl === "" ||
      price === "" ||
      title == ""
    ) {
      return;
    }

    // If there is something wrong with
    // with the price, skip the product
    try {
      parseFloat(price);
    } catch {
      return;
    }

    const productName = Xss(title);
    const image = Xss(hostedImageUrls.split(",")[0]);
    const primaryKeywords = [
      ...new Set([
        ...categories
          .split(",")
          .map((x) => Xss(x))
          .filter(Boolean),
        ...tags
          .split(",")
          .map((x) => Xss(x))
          .filter(Boolean),
      ]),
    ];
    const cleansedDescription = Xss(description.replace(/<[^>]*>/g, ""));
    const link = Xss(`${squareHomepage}/${productPage}/${productUrl}`)
      .replace(/\/\/+/g, "/")
      .replace("https:/", "https://");
    const cleansedPrice = parseFloat(price);
    const priceRange = [cleansedPrice, cleansedPrice];

    products.push({
      departments,
      description: cleansedDescription,
      image,
      link,
      nextProductId,
      price: cleansedPrice,
      priceRange,
      primaryKeywords,
      productName,
    });

    nextProductId += 1;
  });

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
    products.length < 1000
  );
  if (addError) {
    console.log(addError);
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
