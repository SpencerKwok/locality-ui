import SqlString from "sqlstring";

import Psql from "../../../lib/api/postgresql";
import SumoLogic from "../../../lib/api/sumologic";
import { runMiddlewareUser } from "../../../lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../lib/api/middleware";
import type { AddToWishListRequest } from "../../../common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareUser(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "wishlist/add",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const body: AddToWishListRequest = req.body;
  if (
    !body.id ||
    typeof body.id !== "string" ||
    !body.id.match(/\d+_\d+_\d+/g)
  ) {
    SumoLogic.log({
      level: "error",
      method: "wishlist/add",
      message: "Invalid id",
      params: body,
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  const objectId = body.id;

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
      method: "wishlist/add",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const wishlist = JSON.parse(productIDs.rows[0].wishlist);
  wishlist.push(objectId);

  const updatedWishlist = JSON.stringify(wishlist);
  const addProductIdError = await Psql.update({
    table: "users",
    values: [{ key: "wishlist", value: updatedWishlist }],
    conditions: SqlString.format("id=?", [id]),
  });
  if (addProductIdError) {
    SumoLogic.log({
      level: "error",
      method: "wishlist/add",
      message: `Failed to UPDATE from Heroku PSQL: ${addProductIdError.message}`,
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(204).end();
}
