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

            const id = `${xss(results.id)}_google`;
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
                  error: {
                    code: 400,
                    message:
                      "Did not sign up with Google. Please sign in with the same method used to sign up",
                  },
                })
              );
              return;
            } else if (user.rows[0].type === "") {
              res.send(
                JSON.stringify({
                  error: {
                    code: 400,
                    message:
                      "Signed up using our Locality form, not Google. Please sign in using the Locality form",
                  },
                })
              );
              return;
            } else if (user.rows[0].type === "facebook") {
              res.send(
                JSON.stringify({
                  error: {
                    code: 400,
                    message:
                      "Signed up using Facebook, not Google. Please sign in using Facebook",
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
              console.log(getCompanyError);
              res.cookie("username", id);
              res.send(JSON.stringify({ redirectTo: "/" }));
            } else if (company.rows.length === 0) {
              res.cookie("username", id);
              res.send(JSON.stringify({ redirectTo: "/" }));
            } else {
              res.cookie("username", id);
              res.cookie("firstName", user.rows[0].firstName);
              res.cookie("lastName", user.rows[0].lastName);
              res.cookie("companyId", user.rows[0].id);
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
