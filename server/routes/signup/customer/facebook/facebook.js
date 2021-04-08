import fetch from "node-fetch";
import psql from "../../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import sqlString from "sqlstring";
import { Router } from "express";
import xss from "xss";

const router = Router();

const signup = async (req, res, accesstoken, mobile) => {
  await fetch(
    `https://graph.facebook.com/debug_token?input_token=${accesstoken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_ACCESS_TOKEN}`
  )
    .then((res) => res.json())
    .then(async (results) => {
      if (
        results.error ||
        results.data.app_id !== process.env.FACEBOOK_APP_ID ||
        !results.data.user_id
      ) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid accesstoken" },
          })
        );
        return;
      }

      const id = xss(results.data.user_id);
      await fetch(
        `https://graph.facebook.com/me?fields=first_name,last_name,email&access_token=${accesstoken}`
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

          const email = xss(results.email || "X");
          const firstName = xss(results.first_name || "X");
          const lastName = xss(results.last_name || "X");
          const userId = user.rows[0].id + 1;
          const [_, psqlErrorAddUser] = await psql.query(
            sqlString.format(
              "INSERT INTO users (username, email, password, first_name, last_name, id, wishlist, type) VALUES (E?, E?, E?, E?, E?, ?, E?, E?)",
              [
                `${id}_facebook`,
                email,
                "",
                firstName,
                lastName,
                userId,
                "",
                "facebook",
              ]
            )
          );
          if (psqlErrorAddUser) {
            res.send(JSON.stringify({ error: psqlErrorAddUser }));
            return;
          }

          res.cookie("username", id);
          if (mobile) {
            res.redirect("/?newUser=true");
          } else {
            res.send(JSON.stringify({ redirectTo: "/?newUser=true" }));
          }
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
};

router.get(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many facebook customer sign up requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const code = xss(req.query["code"] || "");
    await fetch(
      `https://graph.facebook.com/v10.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=https://www.mylocality.shop/api/signup/customer/facebook&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
    )
      .then((res) => res.json())
      .then(async ({ access_token }) => {
        const accesstoken = xss(access_token || "");
        await signup(req, res, accesstoken, true);
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

router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many facebook customer sign up requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const accesstoken = xss(req.body.accesstoken || "");
    await signup(req, res, accesstoken, false);
  }
);

export default router;
