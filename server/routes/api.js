const algolia = require("../algolia/client");
const bcrypt = require("bcryptjs");
const cloudinary = require("../cloudinary/client");
const dns = require("dns");
const emailValidator = require("email-validator");
const fetch = require("node-fetch");
const psql = require("../postgresql/client");
const nodemailer = require("nodemailer");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const router = require("express").Router();
const sqlString = require("sqlstring");
const xss = require("xss");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

router.post(
  "/dashboard/*",
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
    const ext = xss(req.query["ext"] || "");

    let page = 0;
    if (req.query["pg"]) {
      page = parseInt(req.query["pg"]);
      if (Number.isNaN(page)) {
        res.send(
          JSON.stringify({
            error: {
              code: 400,
              message: "Invalid page",
            },
          })
        );
        return;
      }
    }

    const restrictSearchableAttributes = ["name", "primary_keywords"];
    const attributesToRetrieve = [
      "company",
      "image",
      "link",
      "name",
      "price",
      "price_range",
    ];

    if (lat !== "" && lng !== "") {
      const [results, error] = await algolia.search(q, {
        aroundLatLng: `${lat}, ${lng}`,
        page: page,
        attributesToRetrieve,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify(results));
      }
    } else if (ip !== "") {
      const [results, error] = await algolia.search(q, {
        aroundLatLngViaIP: true,
        headers: { "X-Forwarded-For": ip },
        page: page,
        attributesToRetrieve,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify(results));
      }
    } else {
      const [results, error] = await algolia.search(q, {
        page: page,
        attributesToRetrieve,
        restrictSearchableAttributes,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify(results));
      }
    }
  }
);

router.post(
  "/contactus",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 5,
    message:
      "Too many mail requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const email = xss(req.body.email || "");
    const name = xss(req.body.name || "");
    const message = xss(req.body.message || "");

    const selfMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Customer!",
      html: `Name: ${name}<br/>Email: ${email}<br/>Message: ${message}`,
    };

    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Locality!",
      html: `<html><head><style type="text/css">.localityTable {border-collapse: collapse;}.localityBody {height: 100%;margin: 0;padding: 0;width: 100%;}.localityGreeting {display: block;margin: 0;margin-top: -24px;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: left;}.localityContent {background-color: #ffffff;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;width: 60%;padding: 36px;}.localityFooter{background-color: #333333;color: #ffffff;font-family: Helvetica;font-size: 12px;line-height: 150%;padding-top: 36px;padding-bottom: 36px;text-align: center;}</style></head><body class="localityBody"><table class="localityTable" width="100%"><tr><td><center><img alt="Locality Logo" src="https://res.cloudinary.com/hcory49pf/image/upload/v1613266097/email/locality-logo.png" style="width: 400px" /></center></td></tr><tr><td class="localityContent"><center><table><tr><td><h3 class="localityGreeting">Hi ${name},</h3><br />Thank you for reaching out! We will get back to you as soon as we can.<br /><br />- The Locality Team</td></tr></table></center></td></tr><tr><td class="localityFooter"><em>Copyright © 2021 Locality, All rights reserved.</em></td></tr></table></body></html>`,
    };

    try {
      await transporter.sendMail(customerMailOptions);
      await transporter.sendMail(selfMailOptions);
      res.send(JSON.stringify({}));
    } catch (err) {
      res.send(JSON.stringify({ error: { code: 500, message: err.message } }));
    }
  }
);

router.post(
  "/companies",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many companies requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const [companies, error] = await psql.query(
      "SELECT * FROM companies ORDER BY name"
    );
    if (error) {
      res.send(JSON.stringify(error));
    } else {
      res.send(
        JSON.stringify({
          companies: companies.rows,
        })
      );
    }
  }
);

router.post(
  "/company",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many company requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const [companies, error] = await psql.query(
        sqlString.format("SELECT * FROM companies WHERE id=? ORDER BY name", [
          companyId,
        ])
      );
      if (error) {
        res.send(JSON.stringify(error));
      } else if (companies.rows.length != 1) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Company does not exist" },
          })
        );
      } else {
        res.send(
          JSON.stringify({
            company: companies.rows[0],
          })
        );
      }
    };

    if (Number.isInteger(req.body.id)) {
      await f(req.body.id);
    } else {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company id" },
        })
      );
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
    const f = async (companyId) => {
      const [products, error] = await psql.query(
        sqlString.format(
          "SELECT CONCAT(company_id, '_', id) AS object_id, name, image FROM products WHERE company_id=? ORDER BY name",
          [companyId]
        )
      );
      if (error) {
        res.send(JSON.stringify(error));
      } else {
        res.send(
          JSON.stringify({
            products: products.rows.map(({ object_id, name, image }) => {
              return {
                objectID: object_id,
                name,
                image,
              };
            }),
          })
        );
      }
    };

    if (Number.isInteger(req.body.id)) {
      await f(req.body.id);
    } else {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company id" },
        })
      );
    }
  }
);

router.post(
  "/product",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId, productId) => {
      const objectID = `${companyId}_${productId}`;
      const [object, error] = await algolia.getObject(objectID);
      if (error) {
        res.send(JSON.stringify({ error }));
      } else if (!object) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Product does not exist" },
          })
        );
      } else {
        res.send(
          JSON.stringify({
            product: { ...object },
          })
        );
      }
    };

    const productId = req.body.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    if (Number.isInteger(req.body.companyId)) {
      await f(req.body.companyId, productId);
    } else {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company id" },
        })
      );
    }
  }
);

router.post(
  "/dashboard/product/update",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (
      companyId,
      productId,
      name,
      image,
      primaryKeywords,
      description,
      price,
      priceRange,
      link
    ) => {
      const [url, cloudinaryError] = await cloudinary.upload(image, {
        exif: false,
        format: "webp",
        public_id: `${companyId}/${productId}`,
        unique_filename: false,
        overwrite: true,
      });
      if (cloudinaryError) {
        res.send(JSON.stringify({ errror: cloudinaryError }));
      } else {
        const algoliaError = await algolia.partialUpdateObject(
          {
            objectID: `${companyId}_${productId}`,
            name: name,
            primary_keywords: primaryKeywords,
            description: description,
            price: price,
            price_range: priceRange,
            link: link,
            image: url,
          },
          { createIfNotExists: false }
        );

        if (algoliaError) {
          res.send(JSON.stringify({ error: algoliaError }));
        } else {
          const query = sqlString.format(
            `UPDATE products SET name=E?, image=? WHERE company_id=? AND id=?`,
            [name, url, companyId, productId]
          );
          const [_, psqlError] = await psql.query(query);
          if (psqlError) {
            res.send(JSON.stringify({ error: psqlError }));
          } else {
            res.send(
              JSON.stringify({
                product: {
                  objectID: `${companyId}_${productId}`,
                  name: name,
                  image: url,
                },
              })
            );
          }
        }
      }
    };

    const productId = req.body.product.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    const image = xss(req.body.product.image || "");
    if (image === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product image" },
        })
      );
      return;
    }

    const name = xss(req.body.product.name || "");
    if (name === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product name" },
        })
      );
      return;
    }

    const primaryKeywords = xss(req.body.product.primaryKeywords || "");
    const description = xss(req.body.product.description || "");

    let price = req.body.product.price;
    if (typeof price !== "number") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price" },
        })
      );
      return;
    }
    price = parseFloat(price.toFixed(2));

    let priceRange = req.body.product.priceRange;
    if (!Array.isArray(priceRange) || priceRange.length !== 2) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }
    try {
      priceRange[0] = parseFloat(priceRange[0]);
      priceRange[1] = parseFloat(priceRange[1]);
    } catch {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }

    const link = xss(req.body.product.link || "");
    if (link === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product link" },
        })
      );
      return;
    }
    // Add "https://" to link URL if not included
    if (!link.includes("https://") && !link.includes("http://")) {
      link = `https://${link}`;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.companyId)) {
        await f(
          req.body.companyId,
          productId,
          name,
          image,
          primaryKeywords,
          description,
          price,
          priceRange,
          link
        );
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(
        parseInt(companyId),
        productId,
        name,
        image,
        primaryKeywords,
        description,
        price,
        priceRange,
        link
      );
    }
  }
);

const productAdd = async (
  companyId,
  companyName,
  productName,
  image,
  latitude,
  longitude,
  primaryKeywords,
  description,
  price,
  priceRange,
  link,
  res,
  nextProductId
) => {
  if (!nextProductId) {
    const [nextIdResponse, psqlErrorGetNextId] = await psql.query(
      sqlString.format("SELECT next_product_id FROM companies WHERE id=?", [
        companyId,
      ])
    );
    if (psqlErrorGetNextId) {
      res && res.send(JSON.stringify({ error: psqlErrorGetNextId }));
      return;
    }

    const [_, psqlErrorUpdateNextId] = await psql.query(
      sqlString.format("UPDATE companies SET next_product_id=? WHERE id=?", [
        nextProductId + 1,
        companyId,
      ])
    );
    if (psqlErrorUpdateNextId) {
      res && res.send(JSON.stringify({ error: psqlErrorUpdateNextId }));
      return;
    }

    nextProductId = nextIdResponse.rows[0].next_product_id;
  }

  const [url, cloudinaryError] = await cloudinary.upload(image, {
    exif: false,
    format: "webp",
    public_id: `${companyId}/${nextProductId}`,
    unique_filename: false,
    overwrite: true,
  });

  if (cloudinaryError) {
    res && res.send(JSON.stringify({ error: cloudinaryError }));
    return;
  }

  const geolocation = [];
  for (let i = 0; i < Math.min(latitude.length, longitude.length); ++i) {
    geolocation.push({
      lat: latitude[i],
      lng: longitude[i],
    });
  }
  const algoliaError = await algolia.saveObject(
    {
      objectID: `${companyId}_${nextProductId}`,
      _geoloc: geolocation,
      name: productName,
      company: companyName,
      primary_keywords: primaryKeywords,
      description: description,
      price: price,
      price_range: priceRange,
      link: link,
      image: url,
    },
    { autoGenerateObjectIDIfNotExist: false }
  );

  if (algoliaError) {
    res && res.send(JSON.stringify({ error: algoliaError }));
    return;
  }

  const [_, psqlErrorAddProduct] = await psql.query(
    sqlString.format(
      "INSERT INTO products (company_id, id, name, image) VALUES (?, ?, E?, ?)",
      [companyId, nextProductId, productName, url]
    )
  );
  if (psqlErrorAddProduct) {
    res && res.send(JSON.stringify({ error: psqlErrorAddProduct }));
    return;
  }

  res &&
    res.end(
      JSON.stringify({
        product: {
          objectID: `${companyId}_${nextProductId}`,
          name: productName,
          image: url,
        },
      })
    );

  return {
    objectID: `${companyId}_${nextProductId}`,
    name: productName,
    image: url,
  };
};

router.post(
  "/dashboard/product/add",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product add requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const companyName = xss(req.body.companyName || "");
    if (companyName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company name" },
        })
      );
      return;
    }

    const productName = xss(req.body.product.name || "");
    if (productName === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product name" },
        })
      );
      return;
    }

    const image = xss(req.body.product.image || "");
    if (image === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product image" },
        })
      );
      return;
    }

    let latitude = xss(req.body.latitude || "");
    if (latitude === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid latitude" },
        })
      );
      return;
    }
    latitude = latitude.split(",").map((x) => xss(x));
    for (let i = 0; i < latitude.length; ++i) {
      try {
        latitude[i] = parseFloat(latitude[i]);
      } catch (err) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid latitude" },
          })
        );
      }
    }

    let longitude = xss(req.body.longitude || "");
    if (longitude === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid longitude" },
        })
      );
      return;
    }
    longitude = longitude.split(",").map((x) => xss(x));
    for (let i = 0; i < longitude.length; ++i) {
      try {
        longitude[i] = parseFloat(longitude[i]);
      } catch (err) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid longitude" },
          })
        );
      }
    }

    const primaryKeywords = xss(req.body.product.primaryKeywords || "");
    const description = xss(req.body.product.description || "");

    let price = req.body.product.price;
    if (typeof price !== "number") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price" },
        })
      );
      return;
    }
    price = parseFloat(price.toFixed(2));

    let priceRange = req.body.product.priceRange;
    if (!Array.isArray(priceRange) || priceRange.length !== 2) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }
    try {
      priceRange[0] = parseFloat(priceRange[0]);
      priceRange[1] = parseFloat(priceRange[1]);
    } catch {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid price range" },
        })
      );
      return;
    }

    let link = xss(req.body.product.link || "");
    if (link === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product link" },
        })
      );
      return;
    }
    // Add "https://" to link URL if not included
    if (!link.includes("https://") && !link.includes("http://")) {
      link = `https://${link}`;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.companyId)) {
        await productAdd(
          req.body.companyId,
          companyName,
          productName,
          image,
          latitude,
          longitude,
          primaryKeywords,
          description,
          price,
          priceRange,
          link,
          res
        );
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await productAdd(
        parseInt(companyId),
        companyName,
        productName,
        image,
        latitude,
        longitude,
        primaryKeywords,
        description,
        price,
        priceRange,
        link,
        res
      );
    }
  }
);

const productDelete = async (companyId, productId, res) => {
  const cloudinaryError = await cloudinary.delete([
    `${companyId}/${productId}`,
  ]);
  if (cloudinaryError) {
    res && res.send(JSON.stringify({ error: cloudinaryError }));
  } else {
    const algoliaError = await algolia.deleteObject(
      `${companyId}_${productId}`
    );
    if (algoliaError) {
      res && res.send(JSON.stringify({ error: algoliaError }));
    } else {
      const [_, psqlError] = await psql.query(
        sqlString.format("DELETE FROM products WHERE company_id=? AND id=?", [
          companyId,
          productId,
        ])
      );
      if (psqlError) {
        res && res.send(JSON.stringify({ error: psqlError }));
      } else {
        res && res.send(JSON.stringify({}));
      }
    }
  }
};

router.post(
  "/dashboard/product/delete",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product delete requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const productId = req.body.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.companyId)) {
        await productDelete(req.body.companyId, productId, res);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await productDelete(parseInt(companyId), productId, res);
    }
  }
);

router.post(
  "/dashboard/shopify/product/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many shopify product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const companyId = req.cookies["companyId"];

    const f = async (companyId) => {
      const [productsResponse, productsError] = await psql.query(
        `SELECT id FROM products WHERE company_id=${companyId}`
      );

      if (productsError) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
        return;
      }

      await Promise.all(
        productsResponse.rows.map(async (product) => {
          await productDelete(companyId, product.id);
        })
      );

      const [companyResponse, companyError] = await psql.query(
        `SELECT * FROM companies WHERE id=${companyId}`
      );

      if (companyError) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
        return;
      }

      let nextProductId = companyResponse.rows[0].next_product_id;
      const companyName = companyResponse.rows[0].name;
      const latitude = companyResponse.rows[0].latitude;
      const longitude = companyResponse.rows[0].longitude;
      const homepage = companyResponse.rows[0].homepage;
      const domain = homepage.match(/(?<=http(s?):\/\/)[^\/]*/g)[0];

      if (!homepage) {
        res.send(
          JSON.stringify({
            error: {
              code: 400,
              message:
                'It looks like you haven\'t set your Shopify homepage yet! Please go to the "Company" tab and add your homepage to your profile',
            },
          })
        );
        return;
      }

      dns.resolveCname(domain, async (err, addresses) => {
        if (err) {
          res.send(
            JSON.stringify({
              error: {
                code: 500,
                message: err.message,
              },
            })
          );
          return;
        } else if (
          addresses.length !== 1 ||
          addresses[0] !== "shops.myshopify.com"
        ) {
          res.send(
            JSON.stringify({
              error: {
                code: 400,
                message:
                  "Failed to upload products from your Shopify homepage. Please make sure you have set up your Shopify homepage properly!",
              },
            })
          );
          return;
        }

        let page = 1;
        let done = false;
        let error = null;
        const products = [];
        while (!done) {
          await fetch(`${homepage}/collections/all/products.json?page=${page}`)
            .then((res) => res.json())
            .then(async (data) => {
              if (data.products.length === 0) {
                done = true;
                return;
              }

              await Promise.all(
                data.products.map(async (product, index) => {
                  const productName = product.title;
                  const image = product.images[0].src;
                  const primaryKeywords = product.product_type;
                  const description = product.body_html.replace(/<[^>]*>/g, "");
                  const link = `https://www.thealfajorcompany.ca/products/${product.handle}`;
                  let price = parseFloat(product.variants[0].price);
                  let priceRange = [price, price];
                  product.variants.forEach((variant) => {
                    priceRange[0] = Math.min(
                      priceRange[0],
                      parseFloat(variant.price)
                    );
                    priceRange[1] = Math.max(
                      priceRange[1],
                      parseFloat(variant.price)
                    );
                  });
                  price = priceRange[0];

                  await productAdd(
                    companyId,
                    companyName,
                    productName,
                    image,
                    latitude,
                    longitude,
                    primaryKeywords,
                    description,
                    price,
                    priceRange,
                    link,
                    null,
                    nextProductId + index
                  ).then((obj) => {
                    products.push(obj);
                  });
                })
              );

              nextProductId += data.products.length;
              page += 1;
            })
            .catch((err) => {
              console.log(err);
              error = err;
              done = true;
            });
        }

        if (error) {
          res.send(
            JSON.stringify({
              error: {
                code: 500,
                message: error.message,
              },
            })
          );
          return;
        }

        const [_, psqlErrorUpdateNextId] = await psql.query(
          sqlString.format(
            "UPDATE companies SET next_product_id=? WHERE id=?",
            [nextProductId, companyId]
          )
        );
        if (psqlErrorUpdateNextId) {
          res.send(JSON.stringify({ error: psqlErrorUpdateNextId }));
          return;
        }

        products.sort((a, b) => a.name.localeCompare(b.name));

        res.send(
          JSON.stringify({
            products,
          })
        );
      });
    };

    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId));
    }
  }
);

router.post(
  "/dashboard/logo/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many logo update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId, image) => {
      const [url, cloudinaryError] = await cloudinary.upload(image, {
        exif: false,
        format: "webp",
        public_id: `logo/${companyId}`,
        unique_filename: false,
        overwrite: true,
      });

      if (cloudinaryError) {
        res.send(JSON.stringify({ error: cloudinaryError }));
      } else {
        const [_, psqlError] = await psql.query(
          sqlString.format("UPDATE companies SET logo=? WHERE id=?", [
            url,
            companyId,
          ])
        );
        if (psqlError) {
          res.send(JSON.stringify({ error: psqlError }));
        } else {
          res.send(JSON.stringify({ url: url }));
        }
      }
    };

    const image = xss(req.body.image || "");
    if (image === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid logo" },
        })
      );
      return;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id, image);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId), image);
    }
  }
);

router.post(
  "/dashboard/homepage/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many homepage update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId, homepage) => {
      const [_, psqlError] = await psql.query(
        sqlString.format("UPDATE companies SET homepage=? WHERE id=?", [
          homepage,
          companyId,
        ])
      );
      if (psqlError) {
        res.send(JSON.stringify({ error: psqlError }));
      } else {
        res.send(JSON.stringify({}));
      }
    };

    let homepage = xss(req.body.homepage || "");
    if (homepage === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid homepage" },
        })
      );
      return;
    }
    // Add "https://" to homepage URL if not included
    if (!homepage.includes("https://") && !homepage.includes("http://")) {
      homepage = `https://${homepage}`;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id, homepage);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId), homepage);
    }
  }
);

router.post(
  "/dashboard/password/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many password update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const username = req.cookies["username"];
    const [user, psqlError] = await psql.query(
      sqlString.format("SELECT password FROM users WHERE username=E?", [
        username,
      ])
    );
    if (psqlError) {
      res.send(JSON.stringify({ error: psqlError }));
    } else if (user.rows.length === 0) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "User does not exist" },
        })
      );
    } else {
      const hashedPassword = user.rows[0].password;
      bcrypt.compare(
        req.body.currentPassword,
        hashedPassword,
        async (bcryptError, result) => {
          if (bcryptError) {
            res.end(
              JSON.stringify({
                error: { code: 400, message: bcryptError.message },
              })
            );
          } else if (result) {
            const newPasswordHash = await bcrypt.hash(
              req.body.newPassword,
              parseInt(process.env.SALT)
            );
            const [_, psqlError] = await psql.query(
              sqlString.format(
                "UPDATE users SET password=? WHERE username=E?",
                [newPasswordHash, username]
              )
            );
            if (psqlError) {
              res.end(
                JSON.stringify({
                  error: { code: 400, message: psqlError.message },
                })
              );
            } else {
              res.end(JSON.stringify({}));
            }
          } else {
            res.end(
              JSON.stringify({
                error: { code: 403, message: "Incorrect Password" },
              })
            );
          }
        }
      );
    }
  }
);

router.post(
  "/signin",
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

router.post(
  "/signup",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign in requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
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

      const [company, psqlErrorCompanyId] = await psql.query(
        "SELECT id FROM companies ORDER BY id DESC LIMIT 1"
      );
      if (psqlErrorCompanyId) {
        res.send(JSON.stringify({ error: psqlErrorCompanyId }));
      } else {
        const companyId = company.rows[0].id + 1;
        const [_, psqlErrorAddCompany] = await psql.query(
          sqlString.format(
            "INSERT INTO companies (id, name, address, city, province, country, latitude, longitude, logo, homepage) VALUES (?, E?, E?, E?, E?, E?, ?, ?, ?, ?)",
            [
              companyId,
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
              [email, hash, firstName, lastName, companyId]
            )
          );
          if (psqlErrorAddUser) {
            res.send(JSON.stringify({ error: psqlErrorAddUser }));
          } else {
            res.end(JSON.stringify({}));
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.end(JSON.stringify({ error: { code: 400, message: err.message } }));
    }
  }
);

router.get(
  "/signout",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many sign out requests from this IP, please try again after 5 minutes",
  }),
  (req, res) => {
    req.logout();
    res.clearCookie("firstName");
    res.clearCookie("lastName");
    res.clearCookie("username");
    res.clearCookie("companyId");
    res.end(JSON.stringify({ redirectTo: "/signin" }));
  }
);

module.exports = router;
