import bcrypt from "bcryptjs";
import emailValidator from "email-validator";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

import google from "./google/google.js";

const router = Router();

router.use("/google", google);

router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many customer sign up requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const email = xss(req.body.email || "");
    if (!emailValidator.validate(email)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid email" },
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

    const [user, psqlErrorUserId] = await psql.query(
      "SELECT id FROM users ORDER BY id DESC LIMIT 1"
    );
    if (psqlErrorUserId) {
      res.send(JSON.stringify({ error: psqlErrorUserId }));
      return;
    }

    const userId = user.rows[0].id + 1;
    const hash = await bcrypt.hash(password, 12);
    const [_, psqlErrorAddUser] = await psql.query(
      sqlString.format(
        "INSERT INTO users (username, password, first_name, last_name, id, wishlist, type) VALUES (?, ?, E?, E?, ?, E?, E?)",
        [email, hash, "X", "X", userId, "", ""]
      )
    );
    if (psqlErrorAddUser) {
      res.send(JSON.stringify({ error: psqlErrorAddUser }));
    } else {
      res.cookie("username", email);
      res.end(JSON.stringify({ redirectTo: "/?newUser=true" }));
    }
  }
);

export default router;
