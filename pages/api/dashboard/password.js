import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";

import Psql from "../../../lib/api/postgresql";
import { runMiddlewareCompany } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareCompany(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const username = req.cookies["username"];
  const [user, psqlError] = await Psql.query(
    sqlString.format("SELECT password FROM users WHERE username=E?", [username])
  );
  if (psqlError) {
    res.status(500).json({ error: psqlError });
  } else if (user.rows.length === 0) {
    res.status(400).json({ error: "User does not exist" });
  } else {
    const hashedPassword = user.rows[0].password;
    Bcrypt.compare(
      req.body.currentPassword,
      hashedPassword,
      async (bcryptError, result) => {
        if (bcryptError) {
          res.status(500).json({ error: bcryptError.message });
        } else if (result) {
          const newPasswordHash = await Bcrypt.hash(
            req.body.newPassword,
            parseInt(process.env.SALT)
          );
          const [_, psqlError] = await Psql.query(
            SqlString.format("UPDATE users SET password=? WHERE username=E?", [
              newPasswordHash,
              username,
            ])
          );
          if (psqlError) {
            res.status(500).json({ error: psqlError.message });
          } else {
            res.status(400).json({});
          }
        } else {
          res.status(403).json({ error: "Incorrect Password" });
        }
      }
    );
  }
  */
}
