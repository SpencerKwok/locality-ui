import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import { MonetizationMethodSchemas } from "common/ValidationSchema";
import type {
  ClickMonetizationRequest,
  ViewMonetizationRequest,
} from "common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "monetization",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqTypeBody: { type?: string } = req.body;
  if (
    typeof reqTypeBody.type !== "string" ||
    (reqTypeBody.type !== "click" && reqTypeBody.type !== "view")
  ) {
    SumoLogic.log({
      level: "warning",
      method: "monetization",
      message: "Invalid type",
      params: req.body,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  try {
    await MonetizationMethodSchemas[reqTypeBody.type].validate(req.body, {
      abortEarly: false,
    });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "monetization",
      message: "Invalid payload",
      params: { body: req.body, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // TODO: TIMESTAMP
  switch (reqTypeBody.type) {
    case "click": {
      const clickData: ClickMonetizationRequest = {
        type: "click",
        isMobile: req.body.isMobile,
        objectId: req.body.objectId,
      };
      const psqlErrorAddMonetization = await Psql.insert({
        table: "monetization",
        values: [
          { key: "type", value: clickData.type },
          { key: "is_mobile", value: clickData.isMobile ?? false },
          { key: "is_extension", value: clickData.isExtension ?? false },
          { key: "business_id", value: clickData.objectId.split("_")[0] },
          { key: "product_id", value: clickData.objectId.split("_")[1] },
        ],
      });
      if (psqlErrorAddMonetization) {
        SumoLogic.log({
          level: "error",
          method: "monetization",
          message: "Failed to INSERT into Heroku PSQL",
          params: { psqlErrorAddMonetization },
        });
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      break;
    }
    case "view": {
      const viewData: ViewMonetizationRequest = {
        type: "view",
        isMobile: req.body.isMobile,
        objectId: req.body.objectId,
        offsetTop: req.body.offsetTop,
      };
      const psqlErrorAddMonetization = await Psql.insert({
        table: "monetization",
        values: [
          { key: "type", value: viewData.type },
          { key: "is_mobile", value: viewData.isMobile ?? false },
          { key: "is_extension", value: viewData.isExtension ?? false },
          { key: "business_id", value: viewData.objectId.split("_")[0] },
          { key: "product_id", value: viewData.objectId.split("_")[1] },
          { key: "offset_top", value: viewData.offsetTop },
        ],
      });
      if (psqlErrorAddMonetization) {
        SumoLogic.log({
          level: "error",
          method: "monetization",
          message: "Failed to INSERT into Heroku PSQL",
          params: { psqlErrorAddMonetization },
        });
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      break;
    }
  }

  res.status(204).end();
}
