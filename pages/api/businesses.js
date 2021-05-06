import { camelCase, mapKeys } from "lodash";

import Psql from "../../lib/api/postgresql";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const [businesses, error] = await Psql.query(
    "SELECT * FROM businesses ORDER BY name"
  );

  if (error) {
    res.status(500).json({ error: error });
    return;
  }

  res.status(200).json({
    businesses: businesses.rows.map((business) => ({
      ...mapKeys(business, (v, k) => camelCase(k)),
    })),
  });
}
