import { camelCase, mapKeys } from "lodash";

import Psql from "../../lib/api/postgresql";
import ImageManager from "../../lib/ImageManager";

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

  const isCache = req.query["cache"] === "true";
  if (isCache) {
    res.status(200).json({
      businesses: businesses.rows.map((business) => ({
        ...mapKeys(business, (v, k) => camelCase(k)),
        cachedLogo: ImageManager.getInstance().getImage(business.logo, {
          // Should always have homepage images cached
          forever: true,
          timeout: 1200,
        }),
      })),
    });
  } else {
    res.status(200).json({
      businesses: businesses.rows.map((business) => ({
        ...mapKeys(business, (v, k) => camelCase(k)),
      })),
    });
  }
}
