const algolia = require("../algolia/client");
const cloudinary = require("../cloudinary/client");
const psql = require("../postgresql/client");
const nodemailer = require("nodemailer");
const passport = require("passport");
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

router.get(
  "/search",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 500,
    message:
      "Too many search requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const q = xss(req.query["q"] || "");
    const ip = xss(req.query["ip"] || "");
    const lat = xss(req.query["lat"] || "");
    const lng = xss(req.query["lng"] || "");

    if (q === "") {
      console.log("Missing query parameter");
      res.status(400).end();
    } else if (lat !== "" && lng !== "") {
      await algolia
        .search(q, {
          aroundLatLng: `${lat}, ${lng}`,
        })
        .then((results) => {
          res.write(JSON.stringify(results));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).end();
        });
    } else if (ip !== "") {
      await algolia
        .search(q, {
          aroundLatLngViaIP: true,
          headers: {
            "X-Forwarded-For": ip,
          },
        })
        .then((results) => {
          res.write(JSON.stringify(results));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).end();
        });
    } else {
      await algolia
        .search(q)
        .then((results) => {
          res.write(JSON.stringify(results));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).end();
        });
    }
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
  async (req, res, next) => {
    const email = xss(req.body.email || "");
    const name = xss(req.body.name || "");
    const productTypes = xss(req.body.productTypes || "");
    const productNum = xss(req.body.productNum || "");
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
      html: `<html><head><style type="text/css">.localityTable {border-collapse: collapse;}.localityBody {height: 100%;margin: 0;padding: 0;width: 100%;}.localityGreeting {display: block;margin: 0;margin-top: -24px;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: left;}.localityContent {background-color: #ffffff;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;width: 60%;padding: 36px;}.localityFooter{background-color: #333333;color: #ffffff;font-family: Helvetica;font-size: 12px;line-height: 150%;padding-top: 36px;padding-bottom: 36px;text-align: center;}</style></head><body class="localityBody"><table class="localityTable" width="100%"><tr><td><center><img alt="Locality Logo" src="https://res.cloudinary.com/hcory49pf/image/upload/v1613266097/email/locality-logo.png" style="width: 400px" /></center></td></tr><tr><td class="localityContent"><center><table><tr><td><h3 class="localityGreeting">Hi ${name},</h3><br />Thank you for reaching out! We will get back to you as soon as we can.<br /><br />- The Locality Team</td></tr></table></center></td></tr><tr><td class="localityFooter"><em>Copyright © 2021 Locality, All rights reserved.</em></td></tr></table></body></html>`,
    };

    await transporter.sendMail(customerMailOptions).catch((err) => {
      console.log(err);
      res.status(400);
    });

    await transporter.sendMail(selfMailOptions).catch((err) => {
      console.log(err);
      res.status(400);
    });

    res.end("{}");
  }
);

router.post(
  "/companies",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many company requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403);
      res.end("{}");
    } else if (companyId === "0") {
      const companies = await psql.query(
        "SELECT * FROM companies ORDER BY name"
      );
      res.write(JSON.stringify({ companies: companies.rows }));
      res.end();
    } else {
      const companies = await psql.query(
        `SELECT * FROM companies WHERE company_id=${companyId} ORDER BY name`
      );
      res.write(JSON.stringify({ companies: companies.rows }));
      res.end();
    }
  }
);

router.post(
  "/products",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many products requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403);
      res.end("{}");
    } else if (companyId === "0") {
      const products = await psql.query(
        `SELECT * FROM products WHERE company_id=${req.body.companyId} ORDER BY name`
      );
      res.write(JSON.stringify({ products: products.rows }));
      res.end();
    } else {
      const products = await psql.query(
        `SELECT * FROM companies WHERE company_id=${companyId} ORDER BY name`
      );
      res.write(JSON.stringify({ products: products.rows }));
      res.end();
    }
  }
);

router.post(
  "/product",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403);
      res.end("{}");
    } else if (companyId === "0") {
      await algolia
        .getObject(`${req.body.companyId}_${req.body.productId}`)
        .then((result) => {
          res.write(JSON.stringify({ product: result }));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).end();
        });
    } else {
      await algolia
        .getObject(`${companyId}_${req.body.productId}`)
        .then((result) => {
          res.write(JSON.stringify({ product: result }));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).end();
        });
    }
  }
);

router.post(
  "/product/update",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403);
      res.end("{}");
    } else if (companyId === "0") {
      const url = await cloudinary.upload(req.body.product.image, {
        crop: "scale",
        exif: false,
        format: "webp",
        public_id: `${req.body.companyId}/${req.body.productId}`,
        unique_filename: false,
        overwrite: true,
        width: 175,
      });
      await algolia.partialUpdateObject(
        {
          objectID: `${req.body.companyId}_${req.body.productId}`,
          name: req.body.product.name,
          primary_keywords: req.body.product.primaryKeywords,
          secondary_keywords: req.body.product.secondaryKeywords,
          price: req.body.product.price,
          link: req.body.product.link,
          image: url,
        },
        { createIfNotExists: false }
      );
      await psql.query(
        `UPDATE products SET name='${req.body.product.name}', image='${url}' WHERE company_id=${req.body.companyId} AND product_id=${req.body.productId}`
      );
    } else {
      console.log(req.body);
    }
    res.end("{}");
  }
);

router.post(
  "/product/add",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403);
      res.end("{}");
    } else if (companyId === "0") {
      const url = await cloudinary.upload(req.body.product.image, {
        crop: "scale",
        exif: false,
        format: "webp",
        public_id: `${req.body.companyId}/${req.body.productId}`,
        unique_filename: false,
        overwrite: true,
        width: 175,
      });

      const geolocation = [];
      const latitude = req.body.latitude.split(",");
      const longitude = req.body.longitude.split(",");
      for (let i = 0; i < Math.min(latitude.length, longitude.length); ++i) {
        geolocation.push({
          lat: latitude[i],
          lng: longitude[i],
        });
      }

      await algolia.saveObject(
        {
          objectID: `${req.body.companyId}_${req.body.productId}`,
          _geoloc: geolocation,
          name: req.body.product.name,
          company: req.body.companyName,
          primary_keywords: req.body.product.primaryKeywords,
          secondary_keywords: req.body.product.secondaryKeywords,
          price: req.body.product.price,
          link: req.body.product.link,
          image: url,
        },
        { autoGenerateObjectIDIfNotExist: false }
      );
      await psql.query(
        `INSERT INTO products (company_id, product_id, name, image) VALUES (${req.body.companyId}, ${req.body.productId}, '${req.body.product.name}', '${url}')`
      );
    } else {
      console.log(req.body);
    }
    res.end("{}");
  }
);

router.post(
  "/signin",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign in requests from this IP, please try again after 24hrs",
  }),
  (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) {
        res.write(JSON.stringify({ message: err.message }));
        res.end();
      } else if (!user) {
        res.write(JSON.stringify({ message: "Missing credentials" }));
        res.end();
      } else {
        res.cookie("firstName", user.firstName);
        res.cookie("lastName", user.lastName);
        res.cookie("companyId", user.companyId);
        res.write(
          JSON.stringify({
            message: "Successfully signed in",
            redirectTo: "/dashboard",
          })
        );
        res.end();
      }
    })(req, next);
  }
);

router.get(
  "/signout",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign out requests from this IP, please try again after 24hrs",
  }),
  (req, res) => {
    req.logout();
    res.clearCookie("firstName");
    res.clearCookie("lastName");
    res.clearCookie("companyId");
    res.write(JSON.stringify({ redirectTo: "/" }));
    res.end();
  }
);

module.exports = router;
