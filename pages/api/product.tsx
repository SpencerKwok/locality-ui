import { camelCase } from "lodash";

import Algolia from "../../lib/api/algolia";
import SumoLogic from "../../lib/api/sumologic";
import { mapKeys } from "../../lib/api/common";

import type { NextApiRequest, NextApiResponse } from "next";
import type { Product, ProductResponse } from "../../common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "product",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { id?: string } = req.query;
  const { id } = query;

  if (!id || typeof id !== "string" || !id.match(/^\d+_\d+$/g)) {
    SumoLogic.log({
      level: "warning",
      method: "product",
      message: "Invalid id",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const object = await Algolia.getObject(id);
  if (!object) {
    SumoLogic.log({
      level: "error",
      method: "product",
      message: "Fetching non-existent object",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const body: ProductResponse = {
    product: {
      ...mapKeys<Product>(object, (v, k) => camelCase(k)),
    },
  };

  res.status(200).json(body);
}
