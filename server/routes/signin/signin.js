import passport from "passport";
import rateLimit from "express-rate-limit";
import { Router } from "express";

import google from "./google/google.js";

const router = Router();

router.use("/google", google);

router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign in requests from this IP, please try again after 5 minutes",
  }),
  (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) {
        res.send(
          JSON.stringify({ error: { code: 400, message: err.message } })
        );
      } else if (!user) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid credentials" },
          })
        );
      } else {
        res.cookie("username", user.username);
        if (typeof user.companyId === "number") {
          res.cookie("firstName", user.firstName);
          res.cookie("lastName", user.lastName);
          res.cookie("companyId", user.companyId);
          res.send(JSON.stringify({ redirectTo: "/dashboard" }));
        } else {
          res.send(JSON.stringify({ redirectTo: "/" }));
        }
      }
    })(req, next);
  }
);

export default router;
