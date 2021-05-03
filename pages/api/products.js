import SqlString from "sqlstring";

import Psql from "../../lib/api/postgresql";
import { runMiddleware } from "../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const f = async (businessId) => {
    const [products, error] = await Psql.query(
      SqlString.format(
        "SELECT CONCAT(company_id, '_', id) AS object_id, name, image FROM products WHERE business_id=? ORDER BY name",
        [businessId]
      )
    );
    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.status(200).json({
      products: products.rows.map(({ object_id, name, image }) => ({
        objectID: object_id,
        name,
        image,
      })),
    });
  };

  if (Number.isInteger(req.body.id)) {
    await f(req.body.id);
  } else {
    res.status(400).json({ error: "Invalid business id" });
  }
}
