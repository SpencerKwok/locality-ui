import Bcrypt from "bcryptjs";
import EmailValidator from "email-validator";
import SqlString from "sqlstring";
import UIDGenerator from "uid-generator";
import Xss from "xss";

import MailChimp, { MainListId } from "../../../../lib/api/mailchimp";
import Psql from "../../../../lib/api/postgresql";

const uidgen = new UIDGenerator(256, UIDGenerator.BASE58);
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const firstName = Xss(req.body.firstName || "");
  if (firstName === "") {
    res.status(400).json({ error: "Invalid first name" });
    return;
  }

  const lastName = Xss(req.body.lastName || "");
  if (lastName === "") {
    res.status(400).json({ error: "Invalid last name" });
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
    console.log(psqlErrorUserId);
    res.status(500).json({
      error:
        'Failed to sign up. Please contact us at locality.info@yahoo.com with the title "Extension Sign up" for assistance',
    });
    return;
  }

  const userId = (user.rows[0] || { id: 0 }).id + 1;
  const hash = await Bcrypt.hash(password, 12);
  const [, psqlErrorAddUser] = await Psql.query(
    SqlString.format(
      "INSERT INTO users (id, username, email, password, first_name, last_name) VALUES (?, E?, E?, E?, E?, E?)",
      [userId, email, email, hash, firstName, lastName]
    )
  );
  if (psqlErrorAddUser) {
    console.log(psqlErrorAddUser);
    res.status(500).json({
      error:
        'Failed to sign up. Please contact us at locality.info@yahoo.com with the title "Extension Sign up" for assistance',
    });
    return;
  }

  const [, mailchimpError] = await MailChimp.addSubscriber(
    {
      email,
      firstName,
      lastName,
    },
    MainListId
  );
  if (mailchimpError) {
    console.log(mailchimpError);
    res.status(500).json({
      error:
        'Failed to sign up. Please contact us at locality.info@yahoo.com with the title "Extension Sign up" for assistance',
    });
    return;
  }

  const uid = await uidgen.generate();
  const [, insertTokenError] = await Psql.query(
    SqlString.format("INSERT INTO tokens (token, id) VALUES (E?, ?)", [
      uid,
      userId,
    ])
  );
  if (insertTokenError) {
    console.log(insertTokenError);
    res.status(500).json({
      error:
        'Failed to sign up. Please contact us at locality.info@yahoo.com with the title "Extension Sign up" for assistance',
    });
    return;
  }

  res.status(200).json({ id: userId, token: uid });
}
