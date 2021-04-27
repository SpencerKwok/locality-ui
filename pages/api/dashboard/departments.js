import SqlString from "sqlstring";
import Xss from "xss";

import Algolia from "../../../lib/api/algolia";
import Psql from "../../../lib/api/postgresql";
import { runMiddlewareCompany } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareCompany(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const f = async (companyId, departments) => {
    const [_, psqlDepartmentsError] = await Psql.query(
      SqlString.format("UPDATE companies SET departments=E? WHERE id=?", [
        departments.join(":"),
        companyId,
      ])
    );
    if (psqlDepartmentsError) {
      res.status(500).json({ error: psqlDepartmentsError });
      return;
    }

    res.status(200).json({ departments: departments });
  };

  let departments = req.body.departments;
  if (!Array.isArray(departments)) {
    res.status(400).json({ error: "Invalid departments" });
    return;
  }
  try {
    departments = departments
      .map((department) => Xss(department.trim()))
      .filter(Boolean);
  } catch (err) {
    res.status(400).json({ error: "Invalid departments" });
    return;
  }

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, departments);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(parseInt(companyId), departments);
  }
  */
}
