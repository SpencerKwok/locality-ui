import Xss from "xss";

import Algolia from "lib/api/algolia";
import Cloudinary from "lib/api/cloudinary";
import SumoLogic from "lib/api/sumologic";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { VariantUpdateSchema } from "common/ValidationSchema";

import type {
  VariantUpdateRequest,
  VariantUpdateResponse,
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
) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/variant/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: VariantUpdateRequest = req.body;
  try {
    await VariantUpdateSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/update",
      message: `Invalid payload: ${err.inner}`,
      params: { body: reqBody, error: err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? reqBody.id : id;
  const productId = reqBody.product.id;
  const variantIndex = reqBody.product.index;
  const variantImage = Xss(reqBody.product.variantImage);
  const variantTag = Xss(reqBody.product.variantTag);

  const object = await Algolia.getObject(`${businessId}_${productId}`);
  if (!object) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/variant/update",
      message: "Failed to get object from Algolia: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (
    variantIndex >= object.variantImages.length ||
    variantIndex >= object.variantTags.length
  ) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/update",
      message: "Invalid payload: index out of range",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const variantImageUrl = await Cloudinary.upload(variantImage, {
    exif: false,
    format: "webp",
    public_id: `${businessId}/${productId}/${variantIndex}`,
    unique_filename: false,
    overwrite: true,
  });
  if (!variantImageUrl) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/variant/update",
      message: "Failed to upload image to Cloudinary: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  object.variantImages[variantIndex] = variantImageUrl;
  object.variantTags[variantIndex] = variantTag;

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
    res.status(500).json({ error: uploadObjectError });
    return;
  }

  const body: VariantUpdateResponse = {
    variantImage: variantImage,
    variantTag: variantTag,
  };

  res.status(200).json(body);
}
