import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { cleanseStringArray, isStringArray } from "../../../../lib/api/common";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  if (!req.body.departments || !isStringArray(req.body.departments)) {
    res.status(400).json({ error: "Invalid departments" });
    return;
  }

  const departments = cleanseStringArray(req.body.departments);
  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const [, psqlDepartmentsError] = await Psql.query(
    SqlString.format("UPDATE businesses SET departments=E? WHERE id=?", [
      departments.join(":"),
      businessId,
    ])
  );
  if (psqlDepartmentsError) {
    res.status(500).json({ error: psqlDepartmentsError });
    return;
  }

  res.status(200).json({ departments: departments });
}
