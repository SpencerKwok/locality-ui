import { productDelete } from "../../../../lib/api/dashboard";
import { runMiddlewareCompany } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareCompany(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const productId = req.body.id;
  if (!Number.isInteger(productId)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.companyId)) {
      const error = await productDelete(req.body.companyId, [productId]);
      if (error) {
        res.status(500).json({ error });
      } else {
        res.status(200).json({});
      }
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    const error = await productDelete(parseInt(companyId), [productId]);
    if (error) {
      res.status(500).json({ error });
    } else {
      res.status(200).json({});
    }
  }
  */
}
