import SqlString from "sqlstring";
import Xss from "xss";

import Algolia from "lib/api/algolia";
import Cloudinary from "lib/api/cloudinary";
import Psql from "lib/api/postgresql";
import { addHttpsProtocol } from "lib/api/dashboard";
import { runMiddlewareBusiness } from "lib/api/middleware";
import SumoLogic from "lib/api/sumologic";
import { ProductUpdateSchema } from "common/ValidationSchema";

import type {
  ProductUpdateRequest,
  ProductUpdateResponse,
} from "common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/product/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: ProductUpdateRequest = req.body;
  try {
    await ProductUpdateSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/product/update",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Already checked to be valid in ProductUpdateSchema and runMiddlewareBusiness
  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  const productId: number = reqBody.product.id;
  const name: string = Xss(reqBody.product.name.trim());
  const departments: Array<string> = reqBody.product.departments.map(
    (department) => Xss(department.trim())
  );
  const description: string = Xss(reqBody.product.description.trim());
  const link: string = addHttpsProtocol(Xss(reqBody.product.link.trim()));
  const priceRange: FixedLengthArray<[number, number]> =
    reqBody.product.priceRange;
  const tags: Array<string> = reqBody.product.tags.map((tag) =>
    Xss(tag.trim())
  );
  const variantImages: Array<string> = reqBody.product.variantImages.map(
    (img) => Xss(img.trim())
  );
  const variantTags: Array<string> = reqBody.product.variantTags.map((tag) =>
    Xss(tag.trim())
  );
  if (variantTags.length <= 0) {
    variantTags.push("");
  }

  const url = await Cloudinary.upload(variantImages[0], {
    exif: false,
    format: "webp",
    public_id: `${businessId}/${productId}/0`,
    unique_filename: false,
    overwrite: true,
  });
  if (url === null) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/product/update",
      message: "Failed to upload image to Cloudinary: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  variantImages[0] = url;

  const algoliaError = await Algolia.partialUpdateObject(
    {
      objectID: `${businessId}_${productId}`,
      name: name,
      description: description,
      description_length: description.replace(/\s+/g, "").length,
      departments: departments,
      link: link,
      price_range: priceRange,
      tags: tags,
      tags_length: tags.join("").replace(/\s+/g, "").length,
      variant_images: variantImages,
      variant_tags: variantTags,
    },
    { createIfNotExists: false }
  );
  if (algoliaError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/product/update",
      message: `Failed to update product on Algolia: ${algoliaError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const psqlError = await Psql.update({
    table: "products",
    values: [
      { key: "name", value: name },
      { key: "preview", value: variantImages[0] },
    ],
    conditions: SqlString.format("business_id=? AND id=?", [
      businessId,
      productId,
    ]),
  });
  if (psqlError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/product/update",
      message: `Failed to UPDATE Heroku PSQL: ${psqlError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: ProductUpdateResponse = {
    product: {
      objectId: `${businessId}_${productId}`,
      name: name,
      preview: variantImages[0],
    },
  };

  res.status(200).json(body);
}
