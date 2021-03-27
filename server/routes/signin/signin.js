import passport from "passport";
import rateLimit from "express-rate-limit";
import { Router } from "express";

const router = Router();
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
        res.end(JSON.stringify({ error: { code: 400, message: err.message } }));
      } else if (!user) {
        res.end(
          JSON.stringify({
            error: { code: 400, message: "Invalid credentials" },
          })
        );
      } else {
        res.cookie("firstName", user.firstName);
        res.cookie("lastName", user.lastName);
        res.cookie("username", user.username);
        res.cookie("companyId", user.companyId);
        res.end(JSON.stringify({ redirectTo: "/dashboard" }));
      }
    })(req, next);
  }
);

export default router;
