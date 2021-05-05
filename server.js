/*
Middleware does not run on static pages for Next.js
applications and using next-secure-headers means no longer
utilizing automatic static optimization. So although
not recommended, we use a server to run middleware
between the user and Next application
*/

const express = require("express");
const next = require("next");
const { parse } = require("url");

const cors = require("cors");
const enforce = require("express-sslify");
const helmet = require("helmet");
const shrinkRay = require("shrink-ray-current");

const app = next({ dev: process.env.ENV !== "PROD" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          childSrc: ["'self'"],
          connectSrc: [
            "'self'",
            "https://ipv4.icanhazip.com",
            "https://api.ipify.org",
            "https://api.cloudinary.com",
          ],
          defaultSrc: ["'self'"],
          fontSrc: ["'self'"],
          frameSrc: ["'self'"],
          imgSrc: ["'self'", "blob:", "data:", "https://res.cloudinary.com"],
          manifestSrc: ["'self'"],
          mediaSrc: ["'self'", "https://res.cloudinary.com"],
          prefetchSrc: ["'self'"],
          objectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          scriptSrcElem: ["'self'"],
          scriptSrcAttr: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          styleSrcElem: ["'self'", "'unsafe-inline'"],
          styleSrcAttr: ["'self'", "'unsafe-inline'"],
          workerSrc: ["'self'"],
        },
      },
      forceHTTPSRedirect: [true, { maxAge: 63072000 }],
      frameGuard: "deny",
      noopen: "noopen",
      nosniff: "nosniff",
      referrerPolicy: "same-origin",
      xssProtection: "block-rendering",
    })
  );

  server.use(
    cors({
      origin: [
        "'self'",
        "https://www.etsy.com",
        "https://www.amazon.ca",
        "https://www.amazon.com",
        "https://www.walmart.ca",
        "https://www.walmart.com",
      ],
      allowedHeaders: ["X-Requested-With", "Content-Type"],
      credentials: true,
    })
  );

  server.use(
    shrinkRay({
      useZopfliForGzip: false,
      cache: () => true,
      zlib: { level: 1 },
      brotli: { quality: 1 },
    })
  );

  if (process.env.ENV === "PROD") {
    server.use(enforce.HTTPS({ trustProtoHeader: true }));
  }

  server.get("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });
  server.post("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });

  server.listen(process.env.PORT || 3000);
});
