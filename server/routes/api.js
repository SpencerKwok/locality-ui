const algolia = require("../algolia/client");
const bcrypt = require("bcryptjs");
const cloudinary = require("../cloudinary/client");
const fetch = require("node-fetch");
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

// Initialization
let companyCount = -1;
(async () => {
  const response = await psql.query("SELECT COUNT(*) FROM companies");
  companyCount = parseInt(response[0].rows[0].count);
})();

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

    if (lat !== "" && lng !== "") {
      const [hits, error] = await algolia.search(q, {
        aroundLatLng: `${lat}, ${lng}`,
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify({ hits: hits }));
      }
    } else if (ip !== "") {
      const [hits, error] = await algolia.search(q, {
        aroundLatLngViaIP: true,
        headers: { "X-Forwarded-For": ip },
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify({ hits: hits }));
      }
    } else {
      const [hits, error] = await algolia.search(q);
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify({ hits: hits }));
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
  "/dashboard/inventory/companies",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message:
      "Too many company requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const [companies, error] = await psql.query(
        `SELECT * FROM companies ${
          companyId !== 0 ? `WHERE id=${companyId}` : ""
        } ORDER BY name`
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
    };

    let companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(0);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/inventory/products",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many products requests from this IP, please try again after 24hrs",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const [products, error] = await psql.query(
        `SELECT id, name, image FROM products WHERE company_id=${companyId} ORDER BY name`
      );
      if (error) {
        res.send(JSON.stringify(error));
      } else {
        res.send(
          JSON.stringify({
            products: products.rows,
          })
        );
      }
    };

    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(req.body.companyId);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/inventory/product/get",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const objectID = `${companyId}_${req.body.productId}`;
      const [object, error] = await algolia.getObject(objectID);
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(
          JSON.stringify({
            product: { ...object, id: req.body.productId },
          })
        );
      }
    };

    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(req.body.companyId);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/inventory/product/update",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const [url, cloudinaryError] = await cloudinary.upload(
        req.body.product.image,
        {
          crop: "scale",
          exif: false,
          format: "webp",
          public_id: `${companyId}/${req.body.product.id}`,
          unique_filename: false,
          overwrite: true,
          width: 175,
        }
      );
      if (cloudinaryError) {
        res.send(JSON.stringify({ errror: cloudinaryError }));
      } else {
        const algoliaError = await algolia.partialUpdateObject(
          {
            objectID: `${companyId}_${req.body.product.id}`,
            name: req.body.product.name,
            primary_keywords: req.body.product.primaryKeywords,
            secondary_keywords: req.body.product.secondaryKeywords,
            price: req.body.product.price,
            link: req.body.product.link,
            image: url,
          },
          { createIfNotExists: false }
        );

        if (algoliaError) {
          res.send(JSON.stringify({ error: algoliaError }));
        } else {
          const [_, psqlError] = await psql.query(
            `UPDATE products SET name='${req.body.product.name}', image='${url}' WHERE company_id=${companyId} AND id=${req.body.product.id}`
          );
          if (psqlError) {
            res.send(JSON.stringify({ error: psqlError }));
          } else {
            res.send(
              JSON.stringify({
                product: {
                  id: req.body.product.id,
                  name: req.body.product.name,
                  image: url,
                },
              })
            );
          }
        }
      }
    };

    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(req.body.companyId);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/inventory/product/add",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const [nextIdResponse, psqlErrorGetNextId] = await psql.query(
        `SELECT next_product_id FROM companies WHERE id=${companyId}`
      );

      if (psqlErrorGetNextId) {
        res.send(JSON.stringify({ error: psqlErrorGetNextId }));
      } else {
        const next_product_id = nextIdResponse.rows[0].next_product_id;
        const [url, cloudinaryError] = await cloudinary.upload(
          req.body.product.image,
          {
            crop: "scale",
            exif: false,
            format: "webp",
            public_id: `${companyId}/${next_product_id}`,
            unique_filename: false,
            overwrite: true,
            width: 175,
          }
        );

        if (cloudinaryError) {
          res.send(JSON.stringify({ error: cloudinaryError }));
        } else {
          const geolocation = [];
          const latitude = req.body.latitude.split(",");
          const longitude = req.body.longitude.split(",");
          for (
            let i = 0;
            i < Math.min(latitude.length, longitude.length);
            ++i
          ) {
            geolocation.push({
              lat: latitude[i],
              lng: longitude[i],
            });
          }

          const algoliaError = await algolia.saveObject(
            {
              objectID: `${companyId}_${next_product_id}`,
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

          if (algoliaError) {
            res.send(JSON.stringify({ error: algoliaError }));
          } else {
            const [_, psqlErrorAddProduct] = await psql.query(
              `INSERT INTO products (company_id, id, name, image) VALUES (${companyId}, ${next_product_id}, '${req.body.product.name}', '${url}')`
            );

            if (psqlErrorAddProduct) {
              res.send(JSON.stringify({ error: psqlErrorAddProduct }));
            } else {
              const [_, psqlErrorUpdateNextId] = await psql.query(
                `UPDATE companies SET next_product_id=${
                  next_product_id + 1
                } WHERE id=${companyId}`
              );

              if (psqlErrorUpdateNextId) {
                res.send(JSON.stringify({ error: psqlErrorUpdateNextId }));
              } else {
                res.end(
                  JSON.stringify({
                    product: {
                      id: next_product_id,
                      name: req.body.product.name,
                      image: url,
                    },
                  })
                );
              }
            }
          }
        }
      }
    };

    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(req.body.companyId);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/inventory/product/delete",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product delete requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId) => {
      const cloudinaryError = await cloudinary.delete([
        `${companyId}/${req.body.productId}`,
      ]);
      if (cloudinaryError) {
        res.send(JSON.stringify({ error: cloudinaryError }));
      } else {
        const algoliaError = await algolia.deleteObject(
          `${companyId}_${req.body.productId}`
        );
        if (algoliaError) {
          res.send(JSON.stringify({ error: algoliaError }));
        } else {
          const [_, psqlError] = await psql.query(
            `DELETE FROM products WHERE company_id=${companyId} AND id=${req.body.productId}`
          );
          if (psqlError) {
            res.send(JSON.stringify({ error: psqlError }));
          } else {
            res.send(JSON.stringify({}));
          }
        }
      }
    };

    const companyId = req.cookies["companyId"];
    if (!companyId) {
      res.status(403).end();
    } else if (companyId === "0") {
      await f(req.body.companyId);
    } else {
      await f(companyId);
    }
  }
);

router.post(
  "/dashboard/profile/password/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many password update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const username = req.cookies["username"];
    if (!username) {
      res.status(403).end();
    } else {
      const [user, psqlError] = await psql.query(
        `SELECT password FROM users WHERE username='${username}'`
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
                `UPDATE users SET password='${newPasswordHash}' WHERE username='${username}'`
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
        res.cookie("companyName", user.companyName);
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
    const {
      firstName,
      lastName,
      email,
      companyName,
      address,
      city,
      province,
      country,
      password,
    } = req.body;
    try {
      let latLng = {};
      await fetch(
        `http://www.mapquestapi.com/geocoding/v1/address?key=${proccess.env.MAPQUEST_KEY}&maxResults=1&location=${address},${city},${province},${country}`
      )
        .then((res) => res.json())
        .then(({ results }) => (latLng = results[0].locations[0].latLng));

      const [_, psqlErrorAddCompany] = await psql.query(
        `INSERT INTO companies (id, name, address, city, province, country, latitude, longitude) VALUES ('${companyCount}', '${companyName}', '${address}', '${city}', '${province}', '${country}', '${latLng.lat}', '${latLng.lng}')`
      );

      if (psqlErrorAddCompany) {
        res.send(JSON.stringify({ error: psqlErrorAddCompany }));
      } else {
        const hash = await bcrypt.hash(password, 12);
        const [_, psqlErrorAddUser] = await psql.query(
          `INSERT INTO users (username, password, first_name, last_name, id) VALUES ('${email}', '${hash}', '${firstName}', '${lastName}', ${companyCount})`
        );
        if (psqlErrorAddUser) {
          res.send(JSON.stringify({ error: psqlErrorAddUser }));
        } else {
          companyCount += 1;
          res.end(JSON.stringify({}));
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
    res.clearCookie("companyName");
    res.end(JSON.stringify({ redirectTo: "/signin" }));
  }
);

module.exports = router;
