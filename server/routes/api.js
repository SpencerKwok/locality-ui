const algolia = require("../algolia/client");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const router = require("express").Router();
const xss = require("xss");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.use((req, res, next) => {
  if (process.env.SECRET !== req.headers.secret) {
    res.status(401).end();
  } else {
    next();
  }
});

router.get(
  "/search",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 1000,
    message:
      "Too many search requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const q = xss(req.query["q"] || "");
    if (q === "") {
      next(new Error("Missing query parameter"));
    } else {
      await algolia
        .findObjects(q)
        .then((results) => {
          res.write(JSON.stringify(results));
        })
        .catch((err) => {
          next(err);
        });
    }
    res.end();
  }
);

router.post(
  "/mail",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 5,
    message:
      "Too many mail requests from this IP, please try again after 24hrs",
  }),
  (req, res, next) => {
    const email = xss(req.body.email || "");
    const name = xss(req.body.name || "");
    const productTypes = xss(req.body.productTypes || "");
    const productNum = req.body.productNum;
    const message = xss(req.body.message || "");

    const selfMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Customer!",
      html: `Name: ${name}<br/>Email: ${email}<br/>Product Types: ${productTypes}<br/>Number of products: ${productNum}<br/>Message: ${message}`,
    };

    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Locality!",
      html: `<html><head><style type="text/css">.localityTable {border-collapse: collapse;}.localityBody {height: 100%;margin: 0;padding: 0;width: 100%;}.localityGreeting {display: block;margin: 0;margin-top: -24px;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: left;}.localityContent {background-color: #ffffff;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;width: 60%;padding: 36px;}.localityFooter{background-color: #333333;color: #ffffff;font-family: Helvetica;font-size: 12px;line-height: 150%;padding-top: 36px;padding-bottom: 36px;text-align: center;}</style></head><body class="localityBody"><table class="localityTable" width="100%"><tr><td><center><img alt="Locality Logo" src="https://mcusercontent.com/74cd481a5fa49dfd5261da025/images/bf5807cf-551c-41c5-b812-8e29f56939dc.png" style="width: 400px" /></center></td></tr><tr><td class="localityContent"><center><table><tr><td><h3 class="localityGreeting">Hi ${name},</h3><br />Thank you for reaching out! We will get back to you as soon as we can.<br /><br />- The Locality Team</td></tr></table></center></td></tr><tr><td class="localityFooter"><em>Copyright © 2021 Locality, All rights reserved.</em></td></tr></table></body></html>`,
    };

    transporter.sendMail(selfMailOptions, (err) => {
      if (err) {
        next(err);
      }
    });

    transporter.sendMail(customerMailOptions, (err) => {
      if (err) {
        next(err);
      }
    });

    res.end("{}");
  }
);

module.exports = router;
