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
    res.clearCookie("firstName", { path: "/" });
    res.clearCookie("lastName", { path: "/" });
    res.clearCookie("username", { path: "/" });
    res.clearCookie("companyId", { path: "/" });
    res.end(JSON.stringify({ redirectTo: "/signin" }));
  }
);

export default router;
