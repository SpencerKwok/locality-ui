import { camelCase } from "lodash";
import { deepMapKeys } from "../../lib/api/common";

import Psql from "../../lib/api/postgresql";
import SumoLogic from "../../lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessesResponse } from "../../common/Schema";

export async function helper(): Promise<
  FixedLengthArray<[BusinessesResponse, null] | [null, Error]>
> {
  const [businesses, error] = await Psql.select({
    table: "businesses",
    values: ["*"],
    orderBy: "name",
  });
  if (error) {
    return [null, error];
  }

  const body: BusinessesResponse = {
    businesses: [
      businesses.rows.map((business: any) => ({
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
      })),
    ],
  };

  return [body, null];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "businesses",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const [businesses, error] = await helper();
  if (error) {
    SumoLogic.log({
      level: "info",
      method: "businesses",
      message: `Failed to SELECT from Heroku PSQL: ${error.message}`,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(200).json(businesses);
}
