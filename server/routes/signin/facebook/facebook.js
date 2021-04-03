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
    const id = xss(req.body.username || "");
    if (id === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid username" },
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
          results.data.app_id !== process.env.FACEBOOK_APP_ID
        ) {
          res.send(
            JSON.stringify({
              error: { code: 400, message: "Invalid accesstoken" },
            })
          );
          return;
        }

        await fetch(
          `https://graph.facebook.com/me?fields=id&access_token=${accesstoken}`
        )
          .then((res) => res.json())
          .then(async (results) => {
            if (results.error || results.id !== id) {
              res.send(
                JSON.stringify({
                  error: { code: 400, message: "Invalid accesstoken" },
                })
              );
              return;
            }

            const [user, getUserError] = await psql.query(
              sqlString.format(
                "SELECT first_name, last_name, id, type FROM users WHERE username=E?",
                [id]
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
            } else if (user.rows[0].type === "") {
              res.send(
                JSON.stringify({
                  error: {
                    code: 400,
                    message:
                      "Signed up using our Locality form, not Facebook. Please sign in using the Locality form",
                  },
                })
              );
              return;
            } else if (user.rows[0].type === "google") {
              res.send(
                JSON.stringify({
                  error: {
                    code: 400,
                    message:
                      "Signed up using Google, not Facebook. Please sign in using Google",
                  },
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
              res.cookie("username", id);
              res.send(JSON.stringify({ redirectTo: "/" }));
            } else if (company.rows.length === 0) {
              res.cookie("username", id);
              res.send(JSON.stringify({ redirectTo: "/" }));
            } else {
              res.cookie("username", id);
              res.cookie("firstName", firstName);
              res.cookie("lastName", lastName);
              res.cookie("companyId", userId);
              res.send(JSON.stringify({ redirectTo: "/dashboard/company" }));
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
  }
);

export default router;
