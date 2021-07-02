import Algolia from "lib/api/algolia";
import Cloudinary from "lib/api/cloudinary";
import SumoLogic from "lib/api/sumologic";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { VariantDeleteSchema } from "common/ValidationSchema";

import type { VariantDeleteRequest } from "common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/variant/delete",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: VariantDeleteRequest = req.body;
  try {
    await VariantDeleteSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/delete",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Already checked to be valid in VariantDeleteSchema and runMiddlewareBusiness
  const { id } = req.locals.user;
  const businessId = id === 0 ? reqBody.id : id;
  const productId = reqBody.product.id;
  const variantIndex = reqBody.product.variantIndex;

  const object = await Algolia.getObject(`${businessId}_${productId}`);
  if (!object) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/delete",
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
      method: "dashboard/variant/delete",
      message: "Invalid payload: index out of range",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  object.variantImages = [
    ...object.variantImages.slice(0, variantIndex),
    ...object.variantImages.slice(variantIndex + 1),
  ];
  object.variantTags = [
    ...object.variantTags.slice(0, variantIndex),
    ...object.variantTags.slice(variantIndex + 1),
  ];

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
      method: "dashboard/variant/delete",
      message: `Failed to partial update object from Algolia: ${uploadObjectError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  // If we fail to delete the variant image, don't return an error.
  // Having extra assets will still appear as a successful transaction
  // on the client side
  const deleteVariantImageError = await Cloudinary.deleteResources([
    `${businessId}/${productId}/${variantIndex}`,
  ]);
  if (deleteVariantImageError !== null) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/variant/delete",
      message: `Failed to delete resources from Algolia: ${deleteVariantImageError.message}`,
      params: { body: reqBody },
    });
  }

  res.status(204).end();
}
