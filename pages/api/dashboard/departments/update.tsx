import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import SumoLogic from "../../../../lib/api/sumologic";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import { UpdateDepartmentsSchema } from "../../../../common/ValidationSchema";

import type {
  DepartmentsUpdateRequest,
  DepartmentsUpdateResponse,
} from "../../../../common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../../lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/departments/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/departments/update",
      message: "Invalid id",
      params: { body: req.body },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const reqBody: DepartmentsUpdateRequest = req.body;
  try {
    await UpdateDepartmentsSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/departments/update",
      message: "Invalid payload",
      params: { body: reqBody, err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const departments = reqBody.departments
    .map((department) => Xss(department))
    .filter(Boolean);
  const psqlDepartmentsError = await Psql.update({
    table: "businesses",
    values: [{ key: "departments", value: JSON.stringify(departments) }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlDepartmentsError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/departments/update",
      message: `Failed to UPDATE Heroku PSQL: ${psqlDepartmentsError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: DepartmentsUpdateResponse = {
    departments,
  };

  res.status(200).json(body);
}
