import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../lib/api/postgresql";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const f = async (businessId) => {
    const [products, error] = await Psql.query(
      SqlString.format(
        "SELECT CONCAT(business_id, '_', id) AS object_id, name, preview FROM products WHERE business_id=? ORDER BY name",
        [businessId]
      )
    );
    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.status(200).json({
      products: products.rows.map(({ object_id, name, preview }) => ({
        objectId: object_id,
        name,
        preview,
      })),
    });
  };

  let id = Xss(req.query["id"] || "");
  if (id === "") {
    res.status(400).json({
      error: "Invalid id",
    });
    return;
  }
  try {
    id = parseInt(id);
  } catch {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await f(id);
}
