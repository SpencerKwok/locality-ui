import { camelCase } from "lodash";
import SqlString from "sqlstring";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { mapKeys } from "lib/api/common";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BaseProduct, ProductsResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "products",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { id?: string } = req.query;
  const { id } = query;
  if (!id || typeof id !== "string" || !id.match(/\d+/g)) {
    SumoLogic.log({
      level: "warning",
      method: "products",
      message: "Invalid id",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const businessId = parseInt(id);
  const products = await Psql.select<{
    rows: Array<{
      object_id: string;
      name: string;
      preview: string;
    }>;
  }>({
    table: "products",
    values: ["CONCAT(business_id, '_', id) AS object_id", "name", "preview"],
    conditions: SqlString.format("business_id=?", [businessId]),
    orderBy: "name",
  });
  if (!products) {
    SumoLogic.log({
      level: "error",
      method: "products",
      message:
        "Failed to get business products from Heroku PSQL: Missing response",
      params: query,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: ProductsResponse = {
    products: products.rows.map((product) => ({
      ...mapKeys<BaseProduct>(product, (v, k) => camelCase(k)),
    })),
  };

  res.status(200).json(body);
}
