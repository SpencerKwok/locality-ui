import rateLimit from "express-rate-limit";
import { Router } from "express";

const router = Router();
router.get(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign out requests from this IP, please try again after 5 minutes",
  }),
  (req, res) => {
    req.logout();
    res.clearCookie("firstName", { domain: req.get("host"), path: "/" });
    res.clearCookie("lastName", { domain: req.get("host"), path: "/" });
    res.clearCookie("username", { domain: req.get("host"), path: "/" });
    res.clearCookie("companyId", { domain: req.get("host"), path: "/" });
    res.end(JSON.stringify({ redirectTo: "/signin" }));
  }
);

export default router;
