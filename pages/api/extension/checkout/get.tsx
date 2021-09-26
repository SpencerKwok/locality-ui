import SqlString from "sqlstring";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type { CheckoutResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/checkout/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { domain?: string } = req.query;
  if (typeof query.domain !== "string" || !query.domain) {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/get",
      message: "Invalid query",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const domain = decodeURIComponent(query.domain);
  const checkoutUrl = await Psql.select<{
    checkout_url: string;
  }>({
    table: "checkout",
    values: ["checkout_url"],
    conditions: SqlString.format("domain=E?", [domain]),
  });
  if (!checkoutUrl) {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/get",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (checkoutUrl.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "extension/checkout/get",
      message: "Failed to SELECT from Heroku PSQL: Domain does not exist",
    });
    res.status(400).json({ error: "Internal server error" });
    return;
  }

  const body: CheckoutResponse = {
    checkoutUrl: checkoutUrl.rows[0].checkout_url,
  };

  res.status(200).json(body);
}
