import { camelCase, mapKeys } from "lodash";
import SqlString from "sqlstring";

import Algolia from "../../../lib/api/algolia";
import Psql from "../../../lib/api/postgresql";
import { runMiddlewareUser } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareUser(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  /* TODO: Add sign-in
  const username = req.cookies["username"];
  if (!username) {
    res.status(403).end();
  }

  const [productIDs, productIDsError] = await Psql.query(
    SqlString.format("SELECT wishlist FROM users WHERE username=E?", [username])
  );
  if (productIDsError) {
    res.status(500).json({ error: productIDsError });
    return;
  }

  const wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
  const [products, productsError] = await Algolia.getObjects(wishlist);
  if (productsError) {
    res.status(500).json({ error: productsError });
    return;
  }

  res.status(200).json({
    products: products.map((product) => ({
      ...mapKeys(product, (v, k) => camelCase(k)),
    }))
  });
  */
}
