import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";

import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const currentPassword = req.body.currentPassword;
  if (typeof currentPassword !== "string" || currentPassword.length < 8) {
    res.status(400).json({ error: "Invalid current password" });
    return;
  }

  const newPassword = req.body.newPassword;
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "Invalid new password" });
    return;
  }

  const { email } = req.locals.user;
  const [user, psqlError] = await Psql.query(
    SqlString.format("SELECT password FROM users WHERE email=E?", [email])
  );
  if (psqlError) {
    res.status(500).json({ error: psqlError });
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
      parseInt(process.env.SALT)
    );
    const [, psqlError] = await Psql.query(
      SqlString.format("UPDATE users SET password=? WHERE email=E?", [
        newPasswordHash,
        email,
      ])
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }

    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error });
  }
}
