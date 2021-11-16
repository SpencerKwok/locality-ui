import SqlString from "sqlstring";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type { ShopAppCheckoutResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/checkout/shop_app/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { name?: string } = req.query;
  if (typeof query.name !== "string") {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/shop_app/get",
      message: "Invalid query",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const domainData = await Psql.select<{
    domain: string;
  }>({
    table: "domain",
    values: ["domain"],
    conditions: SqlString.format("name=E?", [query.name]),
  });
  if (!domainData) {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/shop_app/get",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (domainData.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/shop_app/get",
      message: "Failed to SELECT from Heroku PSQL: Domain does not exist",
    });
    res.status(400).json({ error: "Internal server error" });
    return;
  }

  const domain = domainData.rows[0].domain;
  const coupons = await Psql.select<{
    coupon: string;
  }>({
    table: "coupons",
    values: ["coupon"],
    conditions: SqlString.format("expiration > NOW() AND domain=E?", [domain]),
    orderBy: '"order" ASC',
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

  const body: ShopAppCheckoutResponse = {
    coupons: coupons.rows.map(({ coupon }) => ({
      coupon,
    })),
    input: [
      "#app > section > div._1dOw_ > div._1qfTa > div > div:nth-child(2) > div._2cMPZ._3I5rK._1-iiB > div > button > span",
      "#add-discount",
    ],
    submit: ["cOfoK _3tFTe _10xhA mzPaI _3yT0X"],
    total: [
      "#app > section > div._1dOw_ > div._1qfTa > div > div:nth-child(2) > div._39SW-._2dQzu._160BV.ioQcb > div > div:last-child > div._2Vp7v > span > div > span:nth-child(2)",
    ],
  };

  res.status(200).json(body);
}
