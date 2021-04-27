import { camelCase, mapKeys } from "lodash";

import Psql from "../../lib/api/postgresql";
import { runMiddleware } from "../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const [companies, error] = await Psql.query(
    "SELECT * FROM companies ORDER BY name"
  );

  if (error) {
    res.status(500).json({ error: error });
    return;
  }

  res.status(200).json({
    companies: companies.rows.map((company) => ({
      ...mapKeys(company, (v, k) => camelCase(k)),
    })),
  });
}
