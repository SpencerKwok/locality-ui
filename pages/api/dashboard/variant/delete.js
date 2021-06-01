import Algolia from "../../../../lib/api/algolia";
import Cloudinary from "../../../../lib/api/cloudinary";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import { cleanseString, isObject, isString } from "../../../../lib/api/common";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  if (!isObject(req.body.product)) {
    res.status(400).json({ error: "Invalid product" });
    return;
  }

  const productId = req.body.product.id;
  if (!Number.isInteger(productId)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const variantIndex = req.body.product.index;
  if (!Number.isInteger(variantIndex)) {
    res.status(400).json({ error: "Invalid variant index" });
    return;
  }
  if (variantIndex <= 0) {
    res.status(400).json({ error: "Invalid variant index" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const [object, getObjectError] = await Algolia.getObject(
    `${businessId}_${productId}`
  );
  if (getObjectError) {
    res.status(500).json({ error: getObjectError });
    return;
  }

  if (
    variantIndex >= object.variant_images.length ||
    variantIndex >= object.variant_tags.length
  ) {
    res.status(400).json({ error: "Invalid variant index" });
    return;
  }

  const deleteVariantImageError = await Cloudinary.deleteResources([
    `${businessId}/${productId}/${variantIndex}`,
  ]);
  if (deleteVariantImageError) {
    res.status(500).json({ error: deleteVariantImageError });
    return;
  }

  object.variant_images = [
    ...object.variant_images.slice(0, variantIndex),
    ...object.variant_images.slice(variantIndex + 1),
  ];
  object.variant_tags = [
    ...object.variant_tags.slice(0, variantIndex),
    ...object.variant_tags.slice(variantIndex + 1),
  ];

  const uploadObjectError = await Algolia.partialUpdateObject(
    {
      objectID: `${businessId}_${productId}`,
      variant_images: object.variant_images,
      variant_tags: object.variant_tags,
    },
    { createIfNotExists: false }
  );
  if (uploadObjectError) {
    res.status(500).json({ error: uploadObjectError });
    return;
  }

  res.status(200).json({});
}
