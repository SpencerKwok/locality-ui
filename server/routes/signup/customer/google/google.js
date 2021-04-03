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
    const accesstoken = xss(req.body.accesstoken || "");
    await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accesstoken}`
    )
      .then((res) => res.json())
      .then(async (results) => {
        if (
          results.error ||
          results.issued_to !== process.env.GOOGLE_CLIENT_ID ||
          results.audience !== process.env.GOOGLE_CLIENT_ID
        ) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid accesstoken" },
            })
          );
          return;
        }

        await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accesstoken}`
        )
          .then((res) => res.json())
          .then(async (results) => {
            if (results.error || !results.id) {
              res.send(
                JSON.stringify({
                  error: { code: 400, message: "Invalid accesstoken" },
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

            const id = xss(results.id);
            const email = xss(results.email || "X");
            const firstName = xss(results.given_name || "X");
            const lastName = xss(results.family_name || "X");
            const userId = user.rows[0].id + 1;
            const [_, psqlErrorAddUser] = await psql.query(
              sqlString.format(
                "INSERT INTO users (username, email, password, first_name, last_name, id, wishlist, type) VALUES (E?, E?, E?, E?, E?, ?, E?, E?)",
                [
                  `${id}_google`,
                  email,
                  "",
                  firstName,
                  lastName,
                  userId,
                  "",
                  "google",
                ]
              )
            );
            if (psqlErrorAddUser) {
              res.send(JSON.stringify({ error: psqlErrorAddUser }));
              return;
            }

            res.cookie("username", email);
            res.send(JSON.stringify({ redirectTo: "/?newUser=true" }));
          });
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