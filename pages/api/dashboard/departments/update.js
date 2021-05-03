import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const f = async (businessId, departments) => {
    const [_, psqlDepartmentsError] = await Psql.query(
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

  const { id } = req.locals.user;
  const businessId = id;
  if (businessId === 0) {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, departments);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(id, departments);
  }
}
