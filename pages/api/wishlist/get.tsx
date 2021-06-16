import SqlString from "sqlstring";

import Algolia from "../../../lib/api/algolia";
import Psql from "../../../lib/api/postgresql";
import SumoLogic from "../../../lib/api/sumologic";
import { runMiddlewareUser } from "../../../lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../lib/api/middleware";
import type { WishListResponse } from "../../../common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareUser(req, res);

  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "wishlist/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const { id } = req.locals.user;
  const productIDs = await Psql.select<{
    wishlist: string;
  }>({
    table: "users",
    values: ["wishlist"],
    conditions: SqlString.format("id=?", [id]),
  });
  if (!productIDs) {
    SumoLogic.log({
      level: "error",
      method: "wishlist/get",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
      params: { req },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const attributesToRetrieve = [
    "objectId",
    "business",
    "variant_images",
    "link",
    "name",
    "price_range",
  ];

  const wishlist = productIDs.rows[0].wishlist
    .split(",")
    .filter(Boolean)
    .map((id) => ({
      objectId: id.split("_").slice(0, 2).join("_"),
      variantIndex: parseInt(id.split("_")[2]),
    }));
  const products = await Algolia.getObjects(
    wishlist.map(({ objectId }) => objectId),
    {
      attributesToRetrieve,
    }
  );
  if (!products) {
    SumoLogic.log({
      level: "error",
      method: "wishlist/delete",
      message: `Failed to get objects from Algolia Missing response`,
      params: { req },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const results = [];
  for (let i = 0; i < wishlist.length; ++i) {
    if (!products[i]) {
      continue;
    }
    results.push({
      ...products[i],
      variantIndex: wishlist[i].variantIndex,
    });
  }

  const body: WishListResponse = {
    products: results,
  };

  res.status(200).json(body);
}
