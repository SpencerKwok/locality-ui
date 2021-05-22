import Papa from "papaparse";
import Xss from "xss";

import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.businessId : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  let csv = Xss(req.body.csv || "");
  if (csv === "") {
    res.status(400).json({ error: "Invalid csv" });
    return;
  }
  try {
    csv = Papa.parse(csv);
  } catch {
    res.status(400).json({ error: "Invalid csv" });
    return;
  }
  if (csv.data.length <= 1) {
    res.status(400).json({ error: "Empty csv" });
    return;
  }

  console.log(csv);

  res.status(200).json({});
}
