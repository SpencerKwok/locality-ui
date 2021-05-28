import { productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import { isObject } from "../../../../lib/api/common";

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

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const error = await productDelete(businessId, [productId]);
  if (error) {
    res.status(500).json({ error });
    return;
  }
  res.status(200).json({});
}
