import { decode, encode } from "html-entities";
import Papa from "papaparse";
import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { productAdd, productDelete } from "lib/api/dashboard";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { UploadSquareProductsSchema } from "common/ValidationSchema";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type {
  DatabaseProduct,
  SquareProductUploadRequest,
  UploadTypeSettings,
} from "common/Schema";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

const currentUploadsRunning = new Set<number>();
export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/square",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: SquareProductUploadRequest = req.body;
  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  try {
    await UploadSquareProductsSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/square",
      message: `Invalid payload: ${err.inner}`,
      params: { body: reqBody, error: err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const rawCsv = Xss(reqBody.csv || "");
  let csv: Papa.ParseResult<Array<string>>;
  if (!rawCsv) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/square",
      message: "Invalid CSV: Empty CSV",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  try {
    csv = Papa.parse(rawCsv);
  } catch (error) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/square",
      message: `Invalid CSV: ${error.message}`,
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  if (csv.errors.length > 0) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/square",
      message: "Invalid CSV: Empty CSV",
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
      method: "dashboard/upload/square",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (businessResponse.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/square",
      message: "Failed to SELECT from Heroku PSQL: Business does not exist",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  let nextProductId: number = businessResponse.rows[0].next_product_id;
  const homepages = JSON.parse(businessResponse.rows[0].homepages);
  const uploadSettings: UploadTypeSettings =
    JSON.parse(businessResponse.rows[0].upload_settings).square || {};
  const includeTags = new Set<string>(
    (uploadSettings.includeTags || []).map((x) => x.toLowerCase())
  );
  const excludeTags = new Set<string>(
    (uploadSettings.excludeTags || []).map((x) => x.toLowerCase())
  );
  const departmentMapping = new Map<string, Array<string>>(
    (
      uploadSettings.departmentMapping || []
    ).map(
      ({ key, departments }: { key: string; departments: Array<string> }) => [
        encode(key.trim().toLowerCase()),
        departments.map((x) => x.trim()),
      ]
    )
  );
  const squareHomepage = homepages.squareHomepage || "";
  if (squareHomepage === "") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/square",
      message: "Attempted to upload Square products with no Square homepage",
      params: { body: reqBody },
    });
    res.status(400).json({
      error:
        "It looks like you haven't set your business's Square website yet! Please go to the \"Business\" tab and add your Square website",
    });
    return;
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

  const headerMap = new Map<string, Array<number>>();
  csv.data[0].forEach((header, index) => {
    header = header
      .replace("[Non Editable]", "")
      .replace(/[0-9]/g, "")
      .trim()
      .toLowerCase();
    const arr = headerMap.get(header);
    if (arr) {
      headerMap.set(header, [...arr, index]);
    } else {
      headerMap.set(header, [index]);
    }
  });

  const productPageHeaderIndices = headerMap.get("product page");
  const productUrlHeaderIndices = headerMap.get("product url");
  const titleHeaderIndices = headerMap.get("title");
  const descriptionHeaderIndices = headerMap.get("description");
  const optionValueHeaderIndices = headerMap.get("option value");
  const priceHeaderIndices = headerMap.get("price");
  const categoriesHeaderIndices = headerMap.get("categories");
  const tagsHeaderIndices = headerMap.get("tags");
  const hostedImageUrlsHeaderIndices = headerMap.get("hosted image urls");
  const visibleHeaderIndices = headerMap.get("visible");
  if (
    !productPageHeaderIndices ||
    !productUrlHeaderIndices ||
    !titleHeaderIndices ||
    !descriptionHeaderIndices ||
    !optionValueHeaderIndices ||
    !priceHeaderIndices ||
    !categoriesHeaderIndices ||
    !tagsHeaderIndices ||
    !hostedImageUrlsHeaderIndices ||
    !visibleHeaderIndices
  ) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/square",
      message: "Failed to parse CSV: Missing required headers",
      params: { body: reqBody, headerMap },
    });
    res.status(400).json({
      error:
        "Invalid CSV. Please contact us at locality.info@yahoo.com for assistance.",
    });
    return;
  }

  if (currentUploadsRunning.has(businessId)) {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/square",
      message:
        "Attempted to re-upload Square products with an unfinished upload queued",
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

  let visible = false;
  const products: Array<DatabaseProduct> = [];
  csv.data.slice(1).forEach((value) => {
    const productPage: string = Xss(
      value[productPageHeaderIndices[0]] || ""
    ).trim();
    const productUrl: string = Xss(
      value[productUrlHeaderIndices[0]] || ""
    ).trim();
    const title: string = Xss(value[titleHeaderIndices[0]] || "").trim();
    const description: string = decode(
      Xss(value[descriptionHeaderIndices[0]] || "")
        .trim()
        .replace(/<br>/g, "\n")
        .replace(/<[^>]*>/g, "")
    );
    const optionValue: Array<string> = optionValueHeaderIndices
      .map((x) => Xss(value[x] || "").trim())
      .filter(Boolean);
    const price: string = Xss(value[priceHeaderIndices[0]] || "").trim();
    const categories: Array<string> = Xss(
      value[categoriesHeaderIndices[0]] || ""
    )
      .split(",")
      .map((x) => Xss(x.trim()));
    const tags: Array<string> = Xss(value[tagsHeaderIndices[0]] || "")
      .trim()
      .split(",")
      .map((x) => Xss(x.trim()));
    const hostedImageUrls: Array<string> = (
      value[hostedImageUrlsHeaderIndices[0]] || ""
    )
      .split(",")
      .map((x) => Xss(x.trim()));

    try {
      parseFloat(price);
    } catch {
      SumoLogic.log({
        level: "error",
        method: "dashboard/upload/square",
        message: `Product: ${title} has an invalid price`,
        params: { body: reqBody },
      });
      return;
    }

    if (productUrl) {
      visible = value[visibleHeaderIndices[0]].toLowerCase() !== "no";
      if (!visible) {
        return;
      }

      const departments: Array<string> = [];
      categories.forEach((value) => {
        const department = departmentMapping.get(value.toLowerCase());
        if (department) {
          departments.push(...department);
        }
      });

      const name = decode(title);
      const link = `${squareHomepage}/${productPage}/${productUrl}`
        .replace(/\/\/+/g, "/")
        .replace("https:/", "https://");
      const priceRange: FixedLengthArray<[number, number]> = [
        parseFloat(price),
        parseFloat(price),
      ];
      const allTags = Array.from(
        new Set([...categories, ...tags].filter(Boolean))
      );
      const variantImages = [hostedImageUrls[0]];
      const variantTags = [optionValue.join(" ")].filter(Boolean);

      let shouldInclude = true;
      let shouldExclude = false;
      if (includeTags.size > 0) {
        shouldInclude = false;
        for (let i = 0; i < allTags.length; i++) {
          if (includeTags.has(allTags[i].toLowerCase())) {
            shouldInclude = true;
            break;
          }
        }
      }
      if (excludeTags.size > 0) {
        for (let i = 0; i < allTags.length; i++) {
          if (excludeTags.has(allTags[i].toLowerCase())) {
            shouldExclude = true;
            break;
          }
        }
      }

      if (shouldExclude || !shouldInclude) {
        visible = false;
        return;
      }

      products.push({
        nextProductId,
        name,
        departments,
        description,
        link,
        priceRange,
        tags: allTags.map((tag) => decode(tag)),
        variantImages,
        variantTags,
      });

      nextProductId += 1;
    } else if (optionValue && visible) {
      const variantTag = optionValue.join(" ");
      if (variantTag.length > 0) {
        const prevProduct = products[products.length - 1];
        const prevImage =
          prevProduct.variantImages[prevProduct.variantImages.length - 1];
        products[products.length - 1].variantImages.push(prevImage);
        products[products.length - 1].variantTags.push(variantTag);
      }
    }
  });

  const psqlErrorUpdateNextId = await Psql.update({
    table: "businesses",
    values: [{ key: "next_product_id", value: nextProductId }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlErrorUpdateNextId) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/square",
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
      method: "dashboard/upload/square",
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
      method: "dashboard/upload/square",
      message: "Failed to add old products: Missing response",
      params: { body: reqBody },
    });
    currentUploadsRunning.delete(businessId);
    return;
  }

  currentUploadsRunning.delete(businessId);
}
