import SqlString from "sqlstring";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type { CouponsResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/coupons/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { domain?: string } = req.query;
  if (typeof query.domain !== "string" || !query.domain) {
    SumoLogic.log({
      level: "error",
      method: "extension/coupons/get",
      message: "Invalid query",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const domain = decodeURIComponent(query.domain);
  const coupons = await Psql.select<{
    coupon: string;
    is_stackable: boolean;
  }>({
    table: "coupons",
    values: ["coupon", "is_stackable"],
    conditions: SqlString.format("expiration > NOW() AND domain=E?", [domain]),
  });
  if (!coupons) {
    SumoLogic.log({
      level: "error",
      method: "extension/coupons/get",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: CouponsResponse = {
    coupons: coupons.rows.map(({ coupon, is_stackable }) => ({
      coupon,
      isStackable: is_stackable,
    })),
  };

  res.status(200).json(body);
}
