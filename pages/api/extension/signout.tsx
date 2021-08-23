import SqlString from "sqlstring";

import { runMiddlewareExtension } from "lib/api/middleware";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareExtension(req, res);

  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/signout",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const { email } = req.locals.user;
  const deleteIdError = await Psql.delete({
    table: "tokens",
    conditions: SqlString.format("email=?", [email]),
  });

  // If delete fails, just log it...
  if (deleteIdError) {
    SumoLogic.log({
      level: "warning",
      method: "extension/signout",
      message: "Failed to delete authentication token",
    });
  }

  res.status(204).end();
}
