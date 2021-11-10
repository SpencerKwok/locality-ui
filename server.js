/*
Middleware does not run on static pages for Next.js
applications and using next-secure-headers means no longer
utilizing automatic static optimization. So although
not recommended, we use a server to run middleware
between the user and Next application
*/
const prod = process.env.NODE_ENV === "production";
prod && require("sqreen");

const express = require("express");
const fs = require("fs");
const next = require("next");
const { parse } = require("url");

const shrinkRay = require("shrink-ray-current");

const app = next({ dev: false });
const handle = app.getRequestHandler();

const extensionOrigins = new Set([
  "chrome-extension://cklipomamlgjpmihfhfdjmlhnbadnedl",
  "chrome-extension://ebjlpijabgjciopejnjlcmadiifkackn",
  "https://www.etsy.com",
  "https://www.amazon.ca",
  "https://www.amazon.com",
  "https://www.walmart.ca",
  "https://www.walmart.com",
  "https://www.thealfajorcompany.ca",
  "https://www.unimpressedofficial.com",
  "https://shop.app",
]);

void app.prepare().then(() => {
  const server = express();

  server.use(
    shrinkRay({
      brotli: { quality: 1 },
      cache: () => true,
      useZopfliForGzip: false,
      zlib: { level: 1 },
    })
  );

  server.use((req, res, next) => {
    const origin = req.headers.origin;
    if (typeof origin === "string" && req.path.match(/\/api\/extension\/.*/g)) {
      if (extensionOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    }

    const vary = res.getHeader("Vary");
    if (typeof vary === "string" || typeof vary === "number") {
      res.setHeader("Vary", [vary.toString(), "Origin"]);
    } else if (Array.isArray(vary)) {
      res.setHeader("Vary", [...vary, "Origin"]);
    }
    next();
  });

  server.get("*", (req, res) => {
    const url = parse(req.url, true);
    void handle(req, res, url);
  });
  server.post("*", (req, res) => {
    const url = parse(req.url, true);
    void handle(req, res, url);
  });

  server.listen(prod ? "/tmp/nginx.socket" : 3000, () => {
    prod && console.log("NextJS Server listening to NGINX");
    prod && fs.openSync("/tmp/app-initialized", "w");
  });
});
