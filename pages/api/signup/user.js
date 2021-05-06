import Bcrypt from "bcryptjs";
import EmailValidator from "email-validator";
import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../lib/api/postgresql";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const email = Xss(req.body.email || "");
  if (!EmailValidator.validate(email)) {
    res.status(400).json({
      error: "Invalid email",
    });
    return;
  }

  const password = req.body.password;
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  const [user, psqlErrorUserId] = await Psql.query(
    "SELECT id FROM users ORDER BY id DESC LIMIT 1"
  );
  if (psqlErrorUserId) {
    res.status(500).json({ error: psqlErrorUserId });
    return;
  }

  const userId = user.rows[0].id + 1;
  const hash = await Bcrypt.hash(password, 12);
  const [_, psqlErrorAddUser] = await Psql.query(
    SqlString.format(
      "INSERT INTO users (username, email, password, first_name, last_name, id, wishlist, type) VALUES (E?, E?, E?, E?, E?, ?, E?, E?)",
      [email, email, hash, "X", "X", userId, "", ""]
    )
  );
  if (psqlErrorAddUser) {
    res.status(500).json({ error: psqlErrorAddUser });
  } else {
    res.status(200).json({});
  }
}
