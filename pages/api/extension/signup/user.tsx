import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";
import UIDGenerator from "uid-generator";
import Xss from "xss";

import MailChimp, { MainListId } from "lib/api/mailchimp";
import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { UserSignUpSchema } from "common/ValidationSchema";
import { SALT } from "lib/env";

import type { NextApiRequest, NextApiResponse } from "next";
import type { SignInResponse, UserSignUpRequest } from "common/Schema";

const uidgen = new UIDGenerator(256, UIDGenerator.BASE58);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "extension/signup/user",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: UserSignUpRequest = req.body;
  try {
    await UserSignUpSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "extension/signup/user",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const firstName = Xss(reqBody.firstName || "");
  const lastName = Xss(reqBody.lastName || "");
  const email = Xss(reqBody.email || "");
  const password = reqBody.password1;

  const user = await Psql.select<{ id: number }>({
    table: "users",
    values: ["id"],
    orderBy: "id DESC LIMIT 1",
  });
  if (!user) {
    SumoLogic.log({
      level: "error",
      method: "extension/signup/user",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const existingUser = await Psql.select<{
    id: number;
  }>({
    table: "users",
    values: ["id"],
    conditions: SqlString.format("email=E?", [email]),
  });
  if (!existingUser) {
    SumoLogic.log({
      level: "error",
      method: "extension/signup/user",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (existingUser.rowCount > 0) {
    SumoLogic.log({
      level: "warning",
      method: "extension/signup/user",
      message:
        "User attempted to sign up with an email that has already been used",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Account already exists" });
    return;
  }

  const userId = (user.rows[0] ?? { id: 0 }).id + 1;
  const hash = await Bcrypt.hash(password, parseInt(SALT ?? "12"));
  const psqlErrorAddUser = await Psql.insert({
    table: "users",
    values: [
      { key: "id", value: userId },
      { key: "username", value: email },
      { key: "email", value: email },
      { key: "password", value: hash },
      { key: "first_name", value: firstName },
      { key: "last_name", value: lastName },
    ],
  });
  if (psqlErrorAddUser) {
    SumoLogic.log({
      level: "error",
      method: "signup/user",
      message: `Failed to INSERT into Heroku PSQL: ${psqlErrorAddUser.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({
      error:
        'Failed to sign up. Please contact us at locality.info@yahoo.com with the title "Extension Sign up" for assistance',
    });
    return;
  }

  const mailchimpError = await MailChimp.addSubscriber(
    {
      email,
      firstName,
      lastName,
    },
    MainListId
  );

  if (mailchimpError) {
    SumoLogic.log({
      level: "error",
      method: "signup/user",
      message: `Failed to add subscriber to Mail Chimp: ${mailchimpError.message}`,
      params: user,
    });
    res.status(500).json({ error: "Internal server error" });
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
    id: userId,
    token: uid,
  };

  res.status(200).json(body);
}
