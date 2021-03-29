import bcrypt from "bcryptjs";
import emailValidator from "email-validator";
import fetch from "node-fetch";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many company sign up requests from this IP, please try again after 5 minutes",
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

    const companyName = xss(req.body.companyName || "");
    if (companyName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company name" },
        })
      );
      return;
    }

    const address = xss(req.body.address || "");
    if (address === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid address" },
        })
      );
      return;
    }

    const city = xss(req.body.city || "");
    if (city === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid city" },
        })
      );
      return;
    }

    const province = xss(req.body.province || "");
    if (province === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid province" },
        })
      );
      return;
    }

    const country = xss(req.body.country || "");
    if (country === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid country" },
        })
      );
      return;
    }

    const password = req.body.password;
    if (typeof password !== "string" || password.length < 8) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid password" },
        })
      );
      return;
    }

    try {
      let latLng = {};
      await fetch(
        `http://www.mapquestapi.com/geocoding/v1/address?key=${process.env.MAPQUEST_KEY}&maxResults=1&location=${address},${city},${province},${country}`
      )
        .then((res) => res.json())
        .then(({ results }) => (latLng = results[0].locations[0].latLng));

      const [user, psqlErrorUserId] = await psql.query(
        "SELECT id FROM users ORDER BY id DESC LIMIT 1"
      );
      if (psqlErrorUserId) {
        res.send(JSON.stringify({ error: psqlErrorUserId }));
      } else {
        const userId = user.rows[0].id + 1;
        const [_, psqlErrorAddCompany] = await psql.query(
          sqlString.format(
            "INSERT INTO companies (id, name, address, city, province, country, latitude, longitude, logo, homepage) VALUES (?, E?, E?, E?, E?, E?, ?, ?, ?, ?)",
            [
              userId,
              companyName,
              address,
              city,
              province,
              country,
              latLng.lat,
              latLng.lng,
              "",
              "",
            ]
          )
        );

        if (psqlErrorAddCompany) {
          res.send(JSON.stringify({ error: psqlErrorAddCompany }));
        } else {
          const hash = await bcrypt.hash(password, 12);
          const [_, psqlErrorAddUser] = await psql.query(
            sqlString.format(
              "INSERT INTO users (username, password, first_name, last_name, id) VALUES (?, ?, E?, E?, ?)",
              [email, hash, firstName, lastName, userId]
            )
          );
          if (psqlErrorAddUser) {
            res.send(JSON.stringify({ error: psqlErrorAddUser }));
          } else {
            res.cookie("firstName", firstName);
            res.cookie("lastName", lastName);
            res.cookie("username", email);
            res.cookie("companyId", userId);
            res.end(
              JSON.stringify({ redirectTo: "/dashboard/company?newUser=true" })
            );
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.end(JSON.stringify({ error: { code: 400, message: err.message } }));
    }
  }
);

export default router;
