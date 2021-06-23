import { camelCase } from "lodash";
import SqlString from "sqlstring";

import { deepMapKeys } from "lib/api/common";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "business",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { id?: string } = req.query;
  const { id } = query;
  if (typeof id !== "string" || !id || !id.match(/\d+/g)) {
    SumoLogic.log({
      level: "warning",
      method: "business",
      message: "Invalid id",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const businessId = parseInt(id);
  const businesses = await Psql.select<{
    id: number;
    name: string;
    address: string;
    city: string;
    province: string;
    country: string;
    logo: string;
    departments: string;
    homepages: string;
    upload_settings: string;
  }>({
    table: "businesses",
    values: ["*"],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (!businesses) {
    SumoLogic.log({
      level: "error",
      method: "business",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { businessId },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (businesses.rowCount !== 1) {
    SumoLogic.log({
      level: "warning",
      method: "business",
      message: "Attempted to SELECT non-existing business from Heroku PSQL",
      params: { businessId },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const business = businesses.rows[0];
  const resBody: BusinessResponse = {
    business: {
      id: business.id,
      name: business.name,
      logo: business.logo,
      departments: JSON.parse(business.departments),
      homepages: JSON.parse(business.homepages),
      uploadSettings: deepMapKeys(
        JSON.parse(business.upload_settings),
        (v, k) => camelCase(k)
      ),
    },
  };

  res.status(200).json(resBody);
}
