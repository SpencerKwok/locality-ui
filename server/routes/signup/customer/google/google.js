import emailValidator from "email-validator";
import fetch from "node-fetch";
import psql from "../../../../postgresql/client.js";
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
      "Too many google customer sign up requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const firstName = xss(req.body.firstName || "");
    if (firstName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid first name" },
        })
      );
      return;
    }

    const lastName = xss(req.body.lastName || "");
    if (lastName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid last name" },
        })
      );
      return;
    }

    const email = xss(req.body.email || "");
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

        const [user, psqlErrorUserId] = await psql.query(
          "SELECT id FROM users ORDER BY id DESC LIMIT 1"
        );
        if (psqlErrorUserId) {
          res.send(JSON.stringify({ error: psqlErrorUserId }));
          return;
        }

        const userId = user.rows[0].id + 1;
        const [_, psqlErrorAddUser] = await psql.query(
          sqlString.format(
            "INSERT INTO users (username, password, first_name, last_name, id, wishlist, type) VALUES (?, ?, E?, E?, ?, E?, E?)",
            [email, "", firstName, lastName, userId, "", "google"]
          )
        );

        if (psqlErrorAddUser) {
          res.send(JSON.stringify({ error: psqlErrorAddUser }));
          return;
        }

        res.cookie("username", email);
        res.send(JSON.stringify({ redirectTo: "/" }));
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
