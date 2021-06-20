import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";

import { SALT } from "../../../../lib/env";
import Psql from "../../../../lib/api/postgresql";
import SumoLogic from "../../../../lib/api/sumologic";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import { PasswordUpdateSchema } from "../../../../common/ValidationSchema";

import type { PasswordUpdateRequest } from "../../../../common/Schema";
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
      method: "dashboard/password/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: PasswordUpdateRequest = req.body;
  try {
    await PasswordUpdateSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/password/update",
      message: `Invalid payload: ${err.inner}`,
      params: { body: reqBody, error: err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const currentPassword = reqBody.currentPassword;
  const newPassword = reqBody.newPassword1;

  const { email } = req.locals.user;
  const user = await Psql.select<{ password: string }>({
    table: "users",
    values: ["password"],
    conditions: SqlString.format("email=E?", [email]),
  });
  if (!user) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/password/update",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (user.rowCount !== 1) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/password/update",
      message: "Failed to SELECT from Heroku PSQL: User does not exist",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const hashedPassword = user.rows[0].password;
  try {
    const result = await Bcrypt.compare(currentPassword, hashedPassword);
    if (!result) {
      res.status(403).json({ error: "Incorrect Password" });
      return;
    }

    const newPasswordHash = await Bcrypt.hash(
      newPassword,
      parseInt(SALT || "12")
    );
    const psqlError = await Psql.update({
      table: "users",
      values: [{ key: "password", value: newPasswordHash }],
      conditions: SqlString.format("email=E?", [email]),
    });
    if (psqlError) {
      SumoLogic.log({
        level: "error",
        method: "dashboard/password/update",
        message: `Failed to UPDATE Heroku PSQL: ${psqlError.message}`,
        params: { body: reqBody },
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/password/update",
      message: `Failed to compare passwords: ${error.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
