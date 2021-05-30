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
  const businessId = id === 0 ? req.body.id : id;
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
  const homepages = JSON.parse(businessResponse.rows[0].homepages);
  const squareHomepage = homepages.squareHomepage || "";
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

  const headerMap = new Map();
  csv.data[0].forEach((header, index) => {
    header = header
      .replace("[Non Editable]", "")
      .replace(/[0-9]/g, "")
      .trim()
      .toLowerCase();
    if (headerMap.has(header)) {
      headerMap.set(header, [...headerMap.get(header), index]);
    } else {
      headerMap.set(header, [index]);
    }
  });

  if (
    !headerMap.has("product page") ||
    !headerMap.has("title") ||
    !headerMap.has("description") ||
    !headerMap.has("option value") ||
    !headerMap.has("price") ||
    !headerMap.has("categories") ||
    !headerMap.has("tags") ||
    !headerMap.has("hosted image urls")
  ) {
    res.status(400).json({
      error:
        "Invalid CSV. Please contact us at locality.info@yahoo.com for assistance.",
    });
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
    // Data should already be encoded from Square export file
    const productPage = Xss(value[headerMap.get("product page")[0]] || "");
    const productUrl = Xss(value[headerMap.get("product url")[0]] || "");
    const title = Xss(value[headerMap.get("title")[0]] || "");
    const description = Xss(
      (value[headerMap.get("description")[0]] || "")
        .replace(/<br>/g, "\n")
        .replace(/<[^>]*>/g, "")
    );
    const optionValue = headerMap
      .get("option value")
      .map((x) => Xss(value[x] || ""))
      .filter(Boolean);
    const price = Xss(value[headerMap.get("price")[0]] || "");
    const categories = Xss(value[headerMap.get("categories")[0]] || "");
    const tags = Xss(value[headerMap.get("tags")[0]] || "");
    const hostedImageUrls = (value[headerMap.get("hosted image urls")[0]] || "")
      .split(",")
      .map((x) => Xss(x));
    const visible = Xss(value[headerMap.get("visible")[0]] || "");

    try {
      parseFloat(price);
    } catch {
      console.log(`Product: ${title} has an invalid price`);
      return;
    }

    if (productUrl) {
      const name = title;
      const link = `${squareHomepage}/${productPage}/${productUrl}`
        .replace(/\/\/+/g, "/")
        .replace("https:/", "https://");
      const priceRange = [parseFloat(price), parseFloat(price)];
      const allTags = [
        ...new Set([
          ...categories.split(",").filter(Boolean),
          ...tags.split(",").filter(Boolean),
        ]),
      ];
      const variantImages = [hostedImageUrls[0]];
      const variantTags = [optionValue.join(" ")];
      products.push({
        nextProductId,
        name,
        departments,
        description,
        link,
        priceRange,
        tags: allTags,
        variantImages,
        variantTags,
      });
    } else if (optionValue) {
      const variantTag = optionValue.join(" ");
      if (variantTag.length > 0) {
        const prevProduct = products[products.length - 1];
        const prevImage =
          prevProduct.variantImages[prevProduct.variantImages.length - 1];
        products[products.length - 1].variantImages.push(prevImage);
        products[products.length - 1].variantTags.push(variantTag);
      }
    }

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
    false //products.length < 1000
  );
  if (addError) {
    console.log(addError);
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
