import { productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const productId = req.body.product.id;
  if (!Number.isInteger(productId)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const { id } = req.locals.user;
  if (id === 0) {
    if (Number.isInteger(req.body.businessId)) {
      const error = await productDelete(req.body.businessId, [productId]);
      if (error) {
        res.status(500).json({ error });
        return;
      }
      res.status(200).json({});
    } else {
      res.status(400).json({ error: "Invalid business id" });
    }
  } else {
    const error = await productDelete(id, [productId]);
    if (error) {
      res.status(500).json({ error });
    } else {
      res.status(200).json({});
    }
  }
}
