import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { addHttpsProtocol } from "lib/api/dashboard";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { HomepagesUpdateSchema } from "common/ValidationSchema";

import type {
  HomepagesUpdateRequest,
  HomepagesUpdateResponse,
} from "common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
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

  const reqBody: HomepagesUpdateRequest = req.body;
  try {
    await HomepagesUpdateSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/homepages/update",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
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

  const homepage = addHttpsProtocol(Xss(reqBody.homepage));
  const etsyHomepage =
    typeof reqBody.etsyHomepage === "string"
      ? addHttpsProtocol(Xss(reqBody.etsyHomepage.replace(/\?.*$/g, "")))
      : "";
  const shopifyHomepage =
    typeof reqBody.shopifyHomepage === "string"
      ? addHttpsProtocol(Xss(reqBody.shopifyHomepage))
      : "";
  const squareHomepage =
    typeof reqBody.squareHomepage === "string"
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
  if (typeof homepages.etsyHomepage === "string") {
    homepages.etsyHomepage = etsyHomepage ? etsyHomepage : undefined;
  } else if (etsyHomepage) {
    homepages.etsyHomepage = etsyHomepage;
  }
  if (typeof homepages.shopifyHomepage === "string") {
    homepages.shopifyHomepage = shopifyHomepage ? shopifyHomepage : undefined;
  } else if (shopifyHomepage) {
    homepages.shopifyHomepage = shopifyHomepage;
  }
  if (typeof homepages.squareHomepage === "string") {
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
