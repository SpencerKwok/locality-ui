import { camelCase, mapKeys } from "lodash";

import Algolia from "../../lib/api/algolia";
import { runMiddleware } from "../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const f = async (businessId, productId) => {
    const objectID = `${businessId}_${productId}`;
    const [object, error] = await Algolia.getObject(objectID);
    if (error) {
      res.status(500).json({ error });
    } else if (!object) {
      res.status(400).json({ error: "Product does not exist" });
    } else {
      res
        .status(200)
        .json({ product: { ...mapKeys(object, (v, k) => camelCase(k)) } });
    }
  };

  const productId = req.body.id;
  if (!Number.isInteger(productId)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  if (Number.isInteger(req.body.businessId)) {
    await f(req.body.businessId, productId);
  } else {
    res.status(400).json({ error: "Invalid business id" });
  }
}
