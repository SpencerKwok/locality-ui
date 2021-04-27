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

  /* TODO: Add sign-in
  const username = req.cookies["username"];
  if (!username) {
    res.status(403).end();
  }

  const objectId = Xss(req.body.id || "");
  if (objectId === "") {
    res.status(400).json({ error: "Invalid object id" });
    return;
  }

  const [productIDs, productIDsError] = await Psql.query(
    SqlString.format("SELECT wishlist FROM users WHERE username=E?", [username])
  );
  if (productIDsError) {
    res.status(500).json({ error: productIDsError });
    return;
  }

  const updatedWishlist = productIDs.rows[0].wishlist
    .split(",")
    .filter((x) => x !== "" && x !== objectId)
    .join(",");
  const [_, removeProductIdError] = await Psql.query(
    SqlString.format("UPDATE users SET wishlist=E? WHERE username=E?", [
      updatedWishlist,
      username,
    ])
  );
  if (removeProductIdError) {
    res.status(500).json({ error: removeProductIdError });
    return;
  }

  res.status(200).json({});
  */
}
