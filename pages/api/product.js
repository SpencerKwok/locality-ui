import { camelCase, mapKeys } from "lodash";
import Xss from "xss";

import Algolia from "../../lib/api/algolia";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const f = async (objectId) => {
    const [object, error] = await Algolia.getObject(objectId);
    if (error) {
      res.status(500).json({ error });
    } else if (!object) {
      res.status(400).json({ error: "Product does not exist" });
    } else {
      res
        .status(200)
        .json({ product: { ...mapKeys(object, (v, k) => camelCase(k)) } });
    }
  };

  let id = Xss(req.query["id"] || "");
  if (!id.match(/^\d+_\d+$/g)) {
    res.status(400).json({
      error: "Invalid id",
    });
    return;
  }

  await f(id);
}
