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
    const id = xss(req.body.id || "");
    if (id === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid id" },
        })
      );
      return;
    }

    const accesstoken = xss(req.body.accesstoken || "");
    await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accesstoken}&access_token=${accesstoken}`
    )
      .then((res) => res.json())
      .then(async (results) => {
        if (
          results.error ||
          results.data.app_id !== process.env.FACEBOOK_APP_ID ||
          results.data.user_id !== id
        ) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid accesstoken" },
            })
          );
          return;
        }

        await fetch(
          `https://graph.facebook.com/${id}?fields=first_name,last_name&access_token=${accesstoken}`
        )
          .then((res) => res.json())
          .then(async (results) => {
            if (results.error) {
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

            const firstName = results.first_name || "X";
            const lastName = results.last_name || "X";
            const userId = user.rows[0].id + 1;
            const [_, psqlErrorAddUser] = await psql.query(
              sqlString.format(
                "INSERT INTO users (username, password, first_name, last_name, id, wishlist, type) VALUES (?, ?, E?, E?, ?, E?, E?)",
                [id, "", firstName, lastName, userId, "", "facebook"]
              )
            );
            if (psqlErrorAddUser) {
              res.send(JSON.stringify({ error: psqlErrorAddUser }));
              return;
            }

            res.cookie("username", id);
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
