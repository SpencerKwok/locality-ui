import { decode } from "html-entities";
import SqlString from "sqlstring";
import Xss from "xss";
import { getSession } from "next-auth/client";

import Algolia from "../../lib/api/algolia";
import Psql from "../../lib/api/postgresql";
import SumoLogic from "../../lib/api/sumologic";
import { getBestVariant } from "../../lib/api/search";

import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingHttpHeaders } from "http";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "search",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const query: { q?: string; ip?: string; filters?: string; pg?: string } =
    req.query;
  const headers: {
    "x-forwarded-for"?: string;
  } = req.headers as IncomingHttpHeaders & { "x-forwarded-for"?: string };

  if (!query.q || typeof query.q !== "string") {
    SumoLogic.log({
      level: "warning",
      method: "search",
      message: "Invalid query",
      params: query,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  const q = decode(Xss(query.q));

  let filters = "";
  if (query.filters && typeof query.filters === "string") {
    filters = decode(Xss(query.filters));
  }

  let ip = "";
  if (query.ip && typeof query.ip === "string") {
    ip = query.ip;
  } else if (
    headers["x-forwarded-for"] &&
    typeof headers["x-forwarded-for"] === "string"
  ) {
    const header = headers["x-forwarded-for"];
    ip = Xss(header.split(/,\s*/g)[0]);
  }

  let page = 0;
  if (query.pg && typeof query.pg === "string" && query.pg.match(/\d+/g)) {
    page = parseInt(query.pg);
  }

  const facets = ["business", "departments"];
  const attributesToRetrieve = [
    "objectId",
    "business",
    "variant_images",
    "variant_tags",
    "link",
    "name",
    "price_range",
  ];

  let wishlist: Set<string> | null = null;
  const session = await getSession({ req });
  if (session && session.user) {
    const user = session.user as { id: number };
    const productIDs = await Psql.select<{
      wishlist: string;
    }>({
      table: "users",
      values: ["wishlist"],
      conditions: SqlString.format("id=?", [user.id]),
    });

    // Don't error out if the
    // wishlist cannot be retrieved
    if (productIDs) {
      wishlist = new Set(
        productIDs.rows[0].wishlist.split(",").filter(Boolean)
      );
    }
  }

  if (ip !== "") {
    const results = await Algolia.search(q, {
      aroundLatLngViaIP: true,
      facets,
      filters,
      headers: { "X-Forwarded-For": ip },
      page,
      attributesToRetrieve,
    });
    if (!results) {
      SumoLogic.log({
        level: "error",
        method: "search",
        message: `Failed to search for product from Algolia: Missing response`,
        params: query,
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    results.hits = results.hits.map((hit) => getBestVariant(q, hit));
    if (wishlist) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist?.has(`${hit.objectId}_${hit.variantIndex}`),
        };
      });
    }

    res.status(200).json(results);
  } else {
    const results = await Algolia.search(q, {
      facets,
      filters,
      page,
      attributesToRetrieve,
    });
    if (!results) {
      SumoLogic.log({
        level: "error",
        method: "search",
        message: `Failed to search for product from Algolia: Missing response`,
        params: query,
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    results.hits = results.hits.map((hit) => getBestVariant(q, hit));
    if (wishlist) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist?.has(`${hit.objectId}_${hit.variantIndex}`),
        };
      });
    }

    res.status(200).json(results);
  }
}
