import NodeMailer from "nodemailer";
import Xss from "xss";

import MailChimp, { MainListId } from "lib/api/mailchimp";
import { BusinessSignUpSchema } from "common/ValidationSchema";
import { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } from "lib/env";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { BusinessSignUpRequest } from "common/Schema";

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
): Promise<void> {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "contact",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const body: BusinessSignUpRequest = req.body;
  try {
    await BusinessSignUpSchema.validate(body, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "contact",
      message: "Invalid payload",
      params: { body, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const firstName = Xss(body.firstName);
  const lastName = Xss(body.lastName);
  const email = Xss(body.email);
  const phoneNumber = Xss(body.phoneNumber ?? "");
  const businessName = Xss(body.businessName);
  const businessHomepage = Xss(body.businessHomepage);
  const subscribe = body.subscribe;

  if (
    firstName !== body.firstName ||
    lastName !== body.lastName ||
    email !== body.email ||
    phoneNumber !== body.phoneNumber ||
    businessName !== body.businessName ||
    businessHomepage !== body.businessHomepage
  ) {
    SumoLogic.log({
      level: "warning",
      method: "contact",
      message: "XSS attack",
      params: { body },
    });
  }

  const selfMailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: "New Customer!",
    html: `Name: ${firstName} ${lastName}<br/>Email: ${email}<br/>Phone Number: ${phoneNumber}<br/>Business Name: ${businessName}<br/>Business Homepage: ${businessHomepage}`,
  };

  const customerMailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Welcome to Locality!",
    html: `<html><head><style type="text/css">.localityTable {border-collapse: collapse;}.localityBody {height: 100%;margin: 0;padding: 0;width: 100%;}.localityGreeting {display: block;margin: 0;margin-top: -24px;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: left;}.localityContent {background-color: #ffffff;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;width: 60%;padding: 36px;}.localityFooter{background-color: #333333;color: #ffffff;font-family: Helvetica;font-size: 12px;line-height: 150%;padding-top: 36px;padding-bottom: 36px;text-align: center;}</style></head><body class="localityBody"><table class="localityTable" width="100%"><tr><td><center><img alt="Locality Logo" src="https://res.cloudinary.com/hcory49pf/image/upload/v1613266097/email/locality-logo.png" style="width: 400px" /></center></td></tr><tr><td class="localityContent"><center><table><tr><td><h3 class="localityGreeting">Hi ${firstName} ${lastName},</h3><br />Thank you for reaching out! We will get back to you as soon as we can.<br /><br />- The Locality Team</td></tr></table></center></td></tr><tr><td class="localityFooter"><em>Copyright © 2021 Locality, All rights reserved.</em></td></tr></table></body></html>`,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(selfMailOptions);
  } catch (error: unknown) {
    SumoLogic.log({
      level: "error",
      method: "contact",
      message: "Failed to send mail",
      params: { body, error },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (subscribe) {
    const mailchimpError = await MailChimp.addSubscriber(
      {
        email,
        firstName,
        lastName,
      },
      MainListId
    );

    // Don't respond with error on mailchimp subscription
    // error, users should still be able to log in if a
    // failure occured here
    if (mailchimpError) {
      SumoLogic.log({
        level: "error",
        method: "signup/user",
        message: "Failed to add subscriber to Mail Chimp",
        params: { body, mailchimpError },
      });
    }
  }

  res.status(204).end();
}
