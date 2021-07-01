import Xss from "xss";

import Algolia from "lib/api/algolia";
import Cloudinary from "lib/api/cloudinary";
import SumoLogic from "lib/api/sumologic";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { VariantAddSchema } from "common/ValidationSchema";

import type { VariantAddRequest, VariantAddResponse } from "common/Schema";
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
      method: "dashboard/variant/add",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: VariantAddRequest = req.body;
  try {
    await VariantAddSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/add",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Already checked to be valid in VariantAddSchema and runMiddlewareBusiness
  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  const productId = reqBody.product.id;
  const variantImage = Xss(reqBody.product.variantImage);
  const variantTag = Xss(reqBody.product.variantTag);

  const object = await Algolia.getObject(`${businessId}_${productId}`);
  if (!object) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/variant/add",
      message: "Failed to get object from Algolia: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const variantImageUrl = await Cloudinary.upload(variantImage, {
    exif: false,
    format: "webp",
    public_id: `${businessId}/${productId}/${object.variantImages.length}`,
    unique_filename: false,
    overwrite: true,
  });
  if (variantImageUrl === null) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/variant/add",
      message: "Failed to upload image to Cloudinary: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  object.variantImages.push(variantImageUrl);
  object.variantTags.push(variantTag);

  const uploadObjectError = await Algolia.partialUpdateObject(
    {
      objectID: `${businessId}_${productId}`,
      variant_images: object.variantImages,
      variant_tags: object.variantTags,
    },
    { createIfNotExists: false }
  );
  if (uploadObjectError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/variant/add",
      message: `Failed to partial update object from Algolia: ${uploadObjectError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: VariantAddResponse = {
    variantImage: variantImageUrl,
  };

  res.status(200).json(body);
}
