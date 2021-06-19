import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";
import UIDGenerator from "uid-generator";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import SumoLogic from "../../../../lib/api/sumologic";
import { SignInSchema } from "../../../../common/ValidationSchema";

import type { SignInRequest, SignInResponse } from "../../../../common/Schema";
import type { NextApiRequest, NextApiResponse } from "next";

const uidgen = new UIDGenerator(256, UIDGenerator.BASE58);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "extension/signin/credentials",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: SignInRequest = req.body;
  try {
    await SignInSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "extension/signin/credentials",
      message: `Invalid payload: ${err.inner}`,
      params: { body: reqBody, error: err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const email = Xss(req.body.email || "");
  const password = req.body.password;

  const user = await Psql.select<{
    email: string;
    id: number;
    password: string;
  }>({
    table: "users",
    values: ["email", "id", "password"],
    conditions: SqlString.format("email=E?", [email]),
  });
  if (!user) {
    SumoLogic.log({
      level: "error",
      method: "extension/signin/credentials",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  } else if (user.rowCount !== 1) {
    SumoLogic.log({
      level: "warning",
      method: "extension/signin/credentials",
      message: "Failed to SELECT from Heroku PSQL: User does not exist",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const passwordMatch = await Bcrypt.compare(
    password,
    user.rows[0].password
  ).catch((err) => console.log(err));
  if (!passwordMatch) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const deleteIdError = await Psql.delete({
    table: "tokens",
    conditions: SqlString.format("id=?", [user.rows[0].id]),
  });
  if (deleteIdError) {
    SumoLogic.log({
      level: "error",
      method: "extension/signin/credentials",
      message: `Failed to DELETE from Heroku PSQL: ${deleteIdError.message}`,
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const uid: string = await uidgen.generate();
  const insertTokenError = await Psql.insert({
    table: "tokens",
    values: [
      { key: "token", value: uid },
      { key: "id", value: user.rows[0].id },
    ],
  });
  if (insertTokenError) {
    SumoLogic.log({
      level: "error",
      method: "extension/signin/credentials",
      message: `Failed to INSERT into Heroku PSQL: ${insertTokenError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Invalid payload" });
    return;
  }

  const body: SignInResponse = {
    id: user.rows[0].id,
    token: uid,
  };

  res.status(200).json(body);
}
