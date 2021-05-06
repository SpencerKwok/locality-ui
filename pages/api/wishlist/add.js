import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../lib/api/postgresql";
import { runMiddlewareUser } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareUser(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const objectId = Xss(req.body.id || "");
  if (objectId === "") {
    res.status(400).json({ error: "Invalid object id" });
    return;
  }

  const { id } = req.locals.user;
  const [productIDs, productIDsError] = await Psql.query(
    SqlString.format("SELECT wishlist FROM users WHERE id=?", [id])
  );
  if (productIDsError) {
    res.status(500).json({ error: productIDsError });
    return;
  }

  const wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
  wishlist.push(objectId);

  const updatedWishlist = wishlist.join(",");
  const [_, addProductIdError] = await Psql.query(
    SqlString.format("UPDATE users SET wishlist=E? WHERE id=?", [
      updatedWishlist,
      id,
    ])
  );
  if (addProductIdError) {
    res.status(500).json({ error: addProductIdError });
    return;
  }

  res.status(200).json({});
}
