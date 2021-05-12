import { camelCase, mapKeys } from "lodash";

import Psql from "../../lib/api/postgresql";
import SqlString from "sqlstring";
import Xss from "xss";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const f = async (businessId) => {
    const [businesses, error] = await Psql.query(
      SqlString.format("SELECT * FROM businesses WHERE id=?", [businessId])
    );
    if (error) {
      res.status(500).json({ error });
      return;
    }

    if (businesses.rows.length != 1) {
      res.status(400).json({ error: "Business does not exist" });
      return;
    }

    res.status(200).json({
      business: mapKeys(businesses.rows[0], (v, k) => camelCase(k)),
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
