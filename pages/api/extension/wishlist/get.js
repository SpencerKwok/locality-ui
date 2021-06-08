import { camelCase, mapKeys } from "lodash";
import SqlString from "sqlstring";

import Algolia from "../../../../lib/api/algolia";
import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareExtension } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareExtension(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
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

  const wishlist = productIDs.rows[0].wishlist
    .split(",")
    .filter(Boolean)
    .map((id) => ({
      objectId: id.split("_").slice(0, 2).join("_"),
      variantIndex: id.split("_")[2],
    }));

  const [products, productsError] = await Algolia.getObjects(
    wishlist.map(({ objectId }) => objectId),
    {
      attributesToRetrieve: ["name", "business", "link", "variant_images"],
    }
  );
  if (productsError) {
    res.status(500).json({ error: productsError });
    return;
  }

  const results = [];
  for (let i = 0; i < wishlist.length; ++i) {
    if (!products[i]) {
      continue;
    }
    results.push({
      ...mapKeys(products[i], (v, k) => camelCase(k)),
      variantIndex: wishlist[i].variantIndex,
    });
  }

  res.status(200).json({ products: results });
}
