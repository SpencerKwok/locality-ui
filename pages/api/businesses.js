import { camelCase, mapKeys } from "lodash";

import Psql from "../../lib/api/postgresql";

const deepMapKeys = (obj, fn) => {
  const isArray = Array.isArray(obj);
  const newObj = isArray ? [] : {};
  for (const k in obj) {
    if (!obj.hasOwnProperty(k)) {
      continue;
    }
    if (typeof obj[k] === "object") {
      const v = deepMapKeys(obj[k], fn);
      newObj[fn(v, k)] = v;
    } else {
      newObj[fn(obj[k], k)] = obj[k];
    }
  }
  return newObj;
};

export async function helper() {
  const [businesses, error] = await Psql.query(
    "SELECT * FROM businesses ORDER BY name"
  );
  if (error) {
    return [null, error];
  }

  return [
    {
      businesses: businesses.rows.map((business) => ({
        ...mapKeys(business, (v, k) => camelCase(k)),
        homepages: JSON.parse(business.homepages),
        uploadSettings: deepMapKeys(
          JSON.parse(business.upload_settings),
          (v, k) => camelCase(k)
        ),
      })),
    },
    null,
  ];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const [data, error] = await helper();
  if (error) {
    res.status(500).json({ error: error });
    return;
  }

  res.status(200).json(data);
}
