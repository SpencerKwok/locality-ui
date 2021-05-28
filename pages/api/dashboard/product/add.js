import { addHttpsProtocol, productAdd } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import {
  cleanseString,
  cleanseStringArray,
  isObject,
  isString,
  isStringArray,
} from "../../../../lib/api/common";

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

  if (!req.body.product.name || !isString(req.body.product.name)) {
    res.status(400).json({ error: "Invalid product name" });
    return;
  }
  const name = cleanseString(req.body.product.name);

  if (
    !req.body.product.departments ||
    !isStringArray(req.body.product.departments)
  ) {
    res.status(400).json({ error: "Invalid product departments" });
    return;
  }
  const departments = cleanseStringArray(req.body.product.departments);

  if (req.body.product.description && !isString(req.body.product.description)) {
    res.status(400).json({ error: "Invalid product description" });
    return;
  }
  const description = cleanseString(req.body.product.description);

  if (!req.body.product.link || !isString(req.body.product.link)) {
    res.status(400).json({ error: "Invalid product link" });
    return;
  }
  const link = addHttpsProtocol(cleanseString(req.body.product.link));

  let priceRange = req.body.product.priceRange;
  if (!Array.isArray(priceRange) || priceRange.length !== 2) {
    res.status(400).json({ error: "Invalid price range" });
    return;
  }
  try {
    priceRange[0] = parseFloat(priceRange[0]);
    priceRange[1] = parseFloat(priceRange[1]);
  } catch {
    res.status(400).json({ error: "Invalid price range" });
    return;
  }

  if (!req.body.product.tags || !isStringArray(req.body.product.tags)) {
    res.status(400).json({ error: "Invalid product tags" });
    return;
  }
  const tags = cleanseStringArray(req.body.product.tags);

  if (
    !req.body.product.variantImages ||
    !isStringArray(req.body.product.variantImages)
  ) {
    res.status(400).json({ error: "Invalid product variant images" });
    return;
  }
  const variantImages = cleanseStringArray(req.body.product.variantImages);

  if (
    !req.body.product.variantTags ||
    !isStringArray(req.body.product.variantTags)
  ) {
    res.status(400).json({ error: "Invalid product variant tags" });
    return;
  }
  const variantTags = cleanseStringArray(req.body.product.variantTags);

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const [products, error] = await productAdd(businessId, [
    {
      name,
      departments,
      description,
      link,
      priceRange,
      tags,
      variantImages,
      variantTags,
    },
  ]);
  if (error) {
    res.status(500).json({ error: error });
    return;
  }

  res.status(200).json({ product: products[0] });
}
