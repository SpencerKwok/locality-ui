import Bcrypt from "bcryptjs";
import SqlString from "sqlstring";
import Xss from "xss";

import { BusinessSignUpSchema } from "../../../common/ValidationSchema";
import { MAPQUEST_KEY, SALT } from "../../../lib/env";
import MailChimp, { MainListId } from "../../../lib/api/mailchimp";
import Psql from "../../../lib/api/postgresql";
import SumoLogic from "../../../lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessSignUpRequest } from "../../../common/Schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "signup/business",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const body: BusinessSignUpRequest = req.body;
  try {
    await BusinessSignUpSchema.validate(body, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "signup/business",
      message: "Invalid payload",
      params: { body, err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const firstName = Xss(body.firstName);
  const lastName = Xss(body.lastName);
  const email = Xss(body.email);
  const businessName = Xss(body.businessName);
  const address = Xss(body.address);
  const city = Xss(body.city);
  const province = Xss(body.province);
  const country = Xss(body.country);
  const password = body.password1;

  try {
    const latLng = await fetch(
      `http://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_KEY}&maxResults=1&location=${address},${city},${province},${country}`
    )
      .then((res) => res.json())
      .then(({ results }) => results[0].locations[0].latLng);

    const user = await Psql.select<{ id: number }>({
      table: "users",
      values: ["id"],
      orderBy: "id DESC",
      limit: 1,
    });
    if (!user) {
      SumoLogic.log({
        level: "error",
        method: "signup/business",
        message: "Failed to SELECT from Heroku PSQL: Missing response",
        params: { body },
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
        method: "signup/business",
        message: "Failed to SELECT from Heroku PSQL: Missing response",
        params: { body },
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    } else if (existingUser.rowCount > 0) {
      SumoLogic.log({
        level: "warning",
        method: "signup/business",
        message:
          "User attempted to sign up with an email that has already been used",
        params: { body },
      });
      res.status(500).json({ error: "Account already exists" });
      return;
    }

    const userId = (user.rows[0] || { id: 0 }).id + 1;
    const psqlErrorAddBusiness = await Psql.insert({
      table: "businesses",
      values: [
        { key: "id", value: userId },
        { key: "name", value: businessName },
        { key: "address", value: address },
        { key: "city", value: city },
        { key: "province", value: province },
        { key: "country", value: country },
        { key: "latitude", value: latLng.lat.toString() },
        { key: "longitude", value: latLng.lng.toString() },
      ],
    });
    if (psqlErrorAddBusiness) {
      SumoLogic.log({
        level: "error",
        method: "signup/business",
        message: `Failed to INSERT into Heroku PSQL: ${psqlErrorAddBusiness.message}`,
        params: { body },
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const hash = await Bcrypt.hash(password, parseInt(SALT || "12"));
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
        method: "signup/business",
        message: `Failed to INSERT into Heroku PSQL: ${psqlErrorAddUser.message}`,
        params: { body },
      });
      res.status(500).json({ error: "Internal server error" });
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
        method: "signup/business",
        message: `Failed to add subscriber to Mail Chimp: ${mailchimpError.message}`,
        params: user,
      });
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.status(204).end();
  } catch (err) {
    SumoLogic.log({
      level: "error",
      method: "signup/business",
      message: `Failed to get business location using Map Quest: ${err.message}`,
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
