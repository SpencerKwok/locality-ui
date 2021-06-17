import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import SumoLogic from "../../../../lib/api/sumologic";
import { addHttpsProtocol } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import { UpdateHomepagesSchema } from "../../../../common/ValidationSchema";

import type {
  HomepagesUpdateRequest,
  HomepagesUpdateResponse,
} from "../../../../common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../../lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/homepages/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/homepages/update",
      message: "Invalid id",
      params: { body: req.body },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const reqBody: HomepagesUpdateRequest = req.body;
  try {
    await UpdateHomepagesSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/homepages/update",
      message: "Invalid payload",
      params: { body: reqBody, err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const homepage = addHttpsProtocol(Xss(reqBody.homepage));
  const etsyHomepage = reqBody.etsyHomepage
    ? addHttpsProtocol(Xss(reqBody.etsyHomepage))
    : "";
  const shopifyHomepage = reqBody.shopifyHomepage
    ? addHttpsProtocol(Xss(reqBody.shopifyHomepage))
    : "";
  const squareHomepage = reqBody.squareHomepage
    ? addHttpsProtocol(Xss(reqBody.squareHomepage))
    : "";

  const prevHomepages = await Psql.select<{
    homepages: string;
  }>({
    table: "businesses",
    values: ["homepages"],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (!prevHomepages) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/homepages/update",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (prevHomepages.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/homepages/update",
      message: "Failed to SELECT from Heroku PSQL: Business does not exist",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const homepages = JSON.parse(prevHomepages.rows[0].homepages);
  homepages.homepage = homepage;
  if (homepages.etsyHomepage) {
    homepages.etsyHomepage = etsyHomepage ? etsyHomepage : undefined;
  } else if (etsyHomepage) {
    homepages.etsyHomepage = etsyHomepage;
  }
  if (homepages.shopifyHomepage) {
    homepages.shopifyHomepage = shopifyHomepage ? shopifyHomepage : undefined;
  } else if (shopifyHomepage) {
    homepages.shopifyHomepage = shopifyHomepage;
  }
  if (homepages.squareHomepage) {
    homepages.squareHomepage = squareHomepage ? squareHomepage : undefined;
  } else if (squareHomepage) {
    homepages.squareHomepage = squareHomepage;
  }

  const psqlError = await Psql.update({
    table: "businesses",
    values: [{ key: "homepages", value: JSON.stringify(homepages) }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/homepages/update",
      message: `Failed to UPDATE from Heroku PSQL: ${psqlError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: HomepagesUpdateResponse = {
    ...homepages,
  };

  res.status(200).json(body);
}
