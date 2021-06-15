import EmailValidator from "email-validator";
import NodeMailer from "nodemailer";
import Xss from "xss";

import { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } from "../../lib/env";
import SumoLogic from "../../lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { ContactRequest } from "../../common/Schema";

const transporter = NodeMailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "contact",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const body: ContactRequest = req.body;
  if (!EmailValidator.validate(body.email)) {
    SumoLogic.log({
      level: "warning",
      method: "contact",
      message: "Incorrect email",
      params: body,
    });
    res.status(400).json({
      error: "Invalid payload",
    });
    return;
  }

  if (!body.name || typeof body.name !== "string" || body.name.length > 255) {
    SumoLogic.log({
      level: "warning",
      method: "contact",
      message: "Invalid name",
      params: body,
    });
    res.status(400).json({
      error: "Invalid payload",
    });
    return;
  }

  if (
    !body.message ||
    typeof body.message !== "string" ||
    body.message.length > 500
  ) {
    SumoLogic.log({
      level: "warning",
      method: "contact",
      message: "Invalid message",
      params: body,
    });
    res.status(400).json({
      error: "Invalid payload",
    });
    return;
  }

  const name = Xss(body.name);
  const email = Xss(body.email);
  const message = Xss(body.message);

  const selfMailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: "New Customer!",
    html: `Name: ${name}<br/>Email: ${email}<br/>Message: ${message}`,
  };

  const customerMailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Welcome to Locality!",
    html: `<html><head><style type="text/css">.localityTable {border-collapse: collapse;}.localityBody {height: 100%;margin: 0;padding: 0;width: 100%;}.localityGreeting {display: block;margin: 0;margin-top: -24px;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: left;}.localityContent {background-color: #ffffff;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;width: 60%;padding: 36px;}.localityFooter{background-color: #333333;color: #ffffff;font-family: Helvetica;font-size: 12px;line-height: 150%;padding-top: 36px;padding-bottom: 36px;text-align: center;}</style></head><body class="localityBody"><table class="localityTable" width="100%"><tr><td><center><img alt="Locality Logo" src="https://res.cloudinary.com/hcory49pf/image/upload/v1613266097/email/locality-logo.png" style="width: 400px" /></center></td></tr><tr><td class="localityContent"><center><table><tr><td><h3 class="localityGreeting">Hi ${name},</h3><br />Thank you for reaching out! We will get back to you as soon as we can.<br /><br />- The Locality Team</td></tr></table></center></td></tr><tr><td class="localityFooter"><em>Copyright © 2021 Locality, All rights reserved.</em></td></tr></table></body></html>`,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(selfMailOptions);
    res.status(204).end();
  } catch (err) {
    SumoLogic.log({
      level: "error",
      method: "contact",
      message: `Failed to send mail: ${err.message}`,
      params: body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
