import { camelCase } from "lodash";
import { deepMapKeys } from "lib/api/common";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessesResponse } from "common/Schema";

export async function helper(): Promise<BusinessesResponse | null> {
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
    orderBy: "name",
  });

  if (!businesses) {
    return null;
  }

  const body: BusinessesResponse = {
    businesses: businesses.rows.map((business) => ({
      id: business.id,
      name: business.name,
      logo: business.logo,
      departments: JSON.parse(business.departments),
      homepages: JSON.parse(business.homepages),
      uploadSettings: deepMapKeys(
        JSON.parse(business.upload_settings),
        (v, k) => camelCase(k)
      ),
    })),
  };

  return body;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "businesses",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const businesses = await helper();
  if (!businesses) {
    SumoLogic.log({
      level: "error",
      method: "businesses",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(200).json(businesses);
}
