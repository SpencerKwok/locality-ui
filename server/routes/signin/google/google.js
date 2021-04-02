import emailValidator from "email-validator";
import fetch from "node-fetch";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import sqlString from "sqlstring";
import { Router } from "express";
import xss from "xss";

const router = Router();

router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many google customer sign in requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const email = xss(req.body.username || "");
    if (!emailValidator.validate(email)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid email" },
        })
      );
      return;
    }

    const authtoken = xss(req.body.authtoken || "");
    await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authtoken}`
    )
      .then((res) => res.json())
      .then(async (results) => {
        if (
          results.error ||
          results.issued_to !== process.env.GOOGLE_CLIENT_ID ||
          results.audience !== process.env.GOOGLE_CLIENT_ID ||
          results.email !== email
        ) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid authtoken" },
            })
          );
          return;
        }

        const [user, getUserError] = await psql.query(
          sqlString.format(
            "SELECT first_name, last_name, id FROM users WHERE username=E?",
            [email]
          )
        );
        if (getUserError) {
          res.send(JSON.stringify({ error: getUserError }));
          return;
        } else if (user.rows.length === 0) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid username" },
            })
          );
          return;
        }

        const [company, getCompanyError] = await psql.query(
          sqlString.format("SELECT id FROM companies WHERE id=?", [
            user.rows[0].id,
          ])
        );
        if (getCompanyError) {
          res.cookie("username", email);
          res.send(JSON.stringify({ redirectTo: "/" }));
        } else if (company.rows.length === 0) {
          res.cookie("username", email);
          res.send(JSON.stringify({ redirectTo: "/" }));
        } else {
          res.cookie("username", email);
          res.cookie("firstName", firstName);
          res.cookie("lastName", lastName);
          res.cookie("companyId", userId);
          res.send(JSON.stringify({ redirectTo: "/dashboard/company" }));
        }
      })
      .catch((error) => {
        console.log(error);
        res.send(
          JSON.stringify({
            error: { code: 500, message: error.message },
          })
        );
      });
  }
);

export default router;
