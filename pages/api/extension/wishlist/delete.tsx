import SqlString from "sqlstring";

import Psql from "../../../../lib/api/postgresql";
import SumoLogic from "../../../../lib/api/sumologic";
import { runMiddlewareExtension } from "../../../../lib/api/middleware";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../../lib/api/middleware";
import type { DeleteFromWishListRequest } from "../../../../common/Schema";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareExtension(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "extension/wishlist/delete",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const body: DeleteFromWishListRequest = req.body;
  if (
    !body.id ||
    typeof body.id !== "string" ||
    !body.id.match(/\d+_\d+_\d+/g)
  ) {
    SumoLogic.log({
      level: "error",
      method: "extension/wishlist/delete",
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
      method: "extension/wishlist/delete",
      message: "Failed to SELECT from Heroku PSQL: Empty response",
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const wishlist = JSON.parse(productIDs.rows[0].wishlist);
  const updatedWishlist = JSON.stringify(
    wishlist.filter((x: string) => x !== "" && x !== objectId)
  );
  const removeProductIdError = await Psql.update({
    table: "users",
    values: [{ key: "wishlist", value: updatedWishlist }],
    conditions: SqlString.format("id=?", [id]),
  });
  if (removeProductIdError) {
    SumoLogic.log({
      level: "error",
      method: "extension/wishlist/delete",
      message: `Failed to UPDATE from Heroku PSQL: ${removeProductIdError.message}`,
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(204).end();
}
