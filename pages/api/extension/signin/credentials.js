import Bcrypt from "bcryptjs";
import EmailValidator from "email-validator";
import SqlString from "sqlstring";
import UIDGenerator from "uid-generator";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";

const uidgen = new UIDGenerator(256, UIDGenerator.BASE58);
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const email = Xss(req.body.email || "");
  if (!EmailValidator.validate(email)) {
    console.log("hi");
    res.status(400).json({
      error: "Invalid credentials",
    });
    return;
  }

  const password = req.body.password;
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const [users, error] = await Psql.query(
    SqlString.format("SELECT email, password, id FROM users WHERE email=E?", [
      email,
    ])
  );
  if (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid credentials" });
    return;
  } else if (users.rows.length !== 1) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const passwordMatch = await Bcrypt.compare(
    password,
    users.rows[0].password
  ).catch((err) => console.log(err));
  if (!passwordMatch) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const [, deleteIdError] = await Psql.query(
    SqlString.format("DELETE FROM tokens WHERE id=?", [users.rows[0].id])
  );
  if (deleteIdError) {
    console.log(deleteIdError);
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const uid = await uidgen.generate();
  const [, insertTokenError] = await Psql.query(
    SqlString.format("INSERT INTO tokens (token, id) VALUES (E?, ?)", [
      uid,
      users.rows[0].id,
    ])
  );
  if (insertTokenError) {
    console.log(insertTokenError);
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  res.status(200).json({ id: users.rows[0].id, token: uid });
}
