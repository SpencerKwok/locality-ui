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

  if (
    !req.body.product.variantImage ||
    !isString(req.body.product.variantImage)
  ) {
    res.status(400).json({ error: "Invalid variant image" });
    return;
  }
  const variantImage = cleanseString(req.body.product.variantImage);

  if (!req.body.product.variantTag || !isString(req.body.product.variantTag)) {
    res.status(400).json({ error: "Invalid variant tag" });
    return;
  }
  const variantTag = cleanseString(req.body.product.variantTag);

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

  const [variantImageUrl, uploadVariantImageError] = await Cloudinary.upload(
    variantImage,
    {
      exif: false,
      format: "webp",
      public_id: `${businessId}/${productId}/${object.variant_images.length}`,
      unique_filename: false,
      overwrite: true,
    }
  );
  if (uploadVariantImageError) {
    res.status(500).json({ error: uploadVariantImageError });
    return;
  }

  object.variant_images.push(variantImageUrl);
  object.variant_tags.push(variantTag);

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

  res.status(200).json({
    variantImage: variantImage,
    variantTag: variantTag,
  });
}
