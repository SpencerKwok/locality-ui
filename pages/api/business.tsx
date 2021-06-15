import { camelCase } from "lodash";
import SqlString from "sqlstring";

import { deepMapKeys } from "../../lib/api/common";
import Psql from "../../lib/api/postgresql";
import SumoLogic from "../../lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessResponse } from "../../common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  if (!id || typeof id !== "string") {
    SumoLogic.log({
      level: "warning",
      method: "business",
      message: "Invalid id",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  try {
    const businessId = parseInt(id);
    const [businesses, error] = await Psql.select({
      table: "businesses",
      values: ["*"],
      conditions: SqlString.format("id=?", [businessId]),
    });
    if (error) {
      SumoLogic.log({
        level: "error",
        method: "business",
        message: `Failed to SELECT from Heroku PSQL: ${error.message}`,
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
        address: business.address,
        city: business.city,
        province: business.province,
        country: business.country,
        logo: business.logo,
        departments: business.departments,
        homepages: JSON.parse(business.homepages),
        uploadSettings: deepMapKeys(
          JSON.parse(business.upload_settings),
          (v, k) => camelCase(k)
        ),
      },
    };

    res.status(200).json(resBody);
  } catch {
    SumoLogic.log({
      level: "error",
      method: "business",
      message: "Invalid id",
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
}
