import Etsy from "lib/api/etsy";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { DepartmentsResponse } from "common/Schema";

let departments: Array<string> = [];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "departments/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  if (departments.length <= 0) {
    try {
      departments = await Etsy.getTaxonomy();
    } catch (error: unknown) {
      console.log(error);
      SumoLogic.log({
        level: "error",
        method: "departments/get",
        message: "Failed to fetch Etsy taxonomy",
        params: { error },
      });
    }
  }

  const body: DepartmentsResponse = { departments };
  res.status(200).json(body);
}
