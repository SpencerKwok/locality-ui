import rateLimit from "express-rate-limit";
import { Router } from "express";

import departments from "./departments/departments.js";
import homepage from "./homepage/homepage.js";
import logo from "./logo/logo.js";
import password from "./password/password.js";
import product from "./product/product.js";
import shopify from "./shopify/shopify.js";

const router = Router();
router.post(
  "/*",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many dashboard requests from this IP, please try again after 5 minutes",
  }),
  (req, res, next) => {
    const companyId = req.cookies["companyId"];
    const username = req.cookies["username"];
    if (!companyId || !username) {
      res.status(403).end();
      return;
    }
    next();
  }
);

router.use("/departments", departments);
router.use("/homepage", homepage);
router.use("/logo", logo);
router.use("/password", password);
router.use("/product", product);
router.use("/shopify", shopify);

export default router;
