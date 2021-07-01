import SqlString from "sqlstring";

import Algolia from "lib/api/algolia";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { runMiddlewareExtension } from "lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";
import type { Product, WishListResponse } from "common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareExtension(req, res);

  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/wishlist/get",
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
      method: "extension/wishlist/get",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (productIDs.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "extension/wishlist/add",
      message: "Failed to SELECT from Heroku PSQL: User does not exist",
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

  const wishlist: Array<{
    objectId: string;
    variantIndex: number;
  }> = JSON.parse(productIDs.rows[0].wishlist).map((id: string) => ({
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
      method: "extension/wishlist/get",
      message: `Failed to get objects from Algolia Missing response`,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const results = Array<Product>();
  let wishlistIndex = 0;
  for (const product of products) {
    if (product === null) {
      continue;
    }
    results.push({
      ...product,
      variantIndex: wishlist[wishlistIndex].variantIndex,
    });
    wishlistIndex += 1;
  }

  const body: WishListResponse = {
    products: results,
  };

  res.status(200).json(body);
}
