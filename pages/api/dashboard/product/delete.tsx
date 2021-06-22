import { productDelete } from "lib/api/dashboard";
import { ProductDeleteSchema } from "common/ValidationSchema";
import { runMiddlewareBusiness } from "lib/api/middleware";
import SumoLogic from "lib/api/sumologic";

import type { ProductDeleteRequest } from "common/Schema";
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
      method: "dashboard/product/delete",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }
  const reqBody: ProductDeleteRequest = req.body;
  try {
    await ProductDeleteSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/product/delete",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Already checked to be valid in ProductDeleteSchema and runMiddlewareBusiness
  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  const productId: number = reqBody.product.id;

  const error = await productDelete(businessId, [productId]);
  if (error) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/product/delete",
      message: `Failed to delete product: ${error.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  res.status(200).json({});
}
