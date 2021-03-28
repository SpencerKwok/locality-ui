import { Router } from "express";

import company from "./company/company.js";
import companies from "./companies/companies.js";
import contact from "./contact/contact.js";
import dashboard from "./dashboard/dashboard.js";
import product from "./product/product.js";
import products from "./products/products.js";
import search from "./search/search.js";
import signin from "./signin/signin.js";
import signout from "./signout/signout.js";
import signup from "./signup/signup.js";

const router = Router();

// Change underscore to camelCase
router.use("/*", (req, res, next) => {
  const send = res.send;
  res.send = function () {
    arguments[0] = arguments[0].replace(/_([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
    send.apply(res, arguments);
  };
  next();
});

router.use("/contact", contact);
router.use("/company", company);
router.use("/companies", companies);
router.use("/dashboard", dashboard);
router.use("/search", search);
router.use("/product", product);
router.use("/products", products);
router.use("/signin", signin);
router.use("/signout", signout);
router.use("/signup", signup);

export default router;
