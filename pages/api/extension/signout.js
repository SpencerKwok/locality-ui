import SqlString from "sqlstring";

import { runMiddlewareExtension } from "../../../../lib/api/middleware";
import Psql from "../../../../lib/api/postgresql";

export default async function handler(req, res) {
  await runMiddlewareExtension(req, res);

  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const { id } = req.locals.user;
  const [, deleteIdError] = await Psql.query(
    SqlString.format("DELETE FROM tokens WHERE id=?", [id])
  );

  // If delete fails, just log it...
  if (deleteIdError) {
    console.log(deleteIdError);
  }

  res.status(200).json({});
}
