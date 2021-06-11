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

const app = next({ dev: !prod });
const handle = app.getRequestHandler();

const extensionOrigins = new Set([
  "chrome-extension://cklipomamlgjpmihfhfdjmlhnbadnedl",
  "chrome-extension://ebjlpijabgjciopejnjlcmadiifkackn",
  "https://www.etsy.com",
  "https://www.amazon.ca",
  "https://www.amazon.com",
  "https://www.walmart.ca",
  "https://www.walmart.com",
]);

app.prepare().then(() => {
  const server = express();

  server.use(
    shrinkRay({
      useZopfliForGzip: false,
      cache: () => true,
      zlib: { level: 1 },
      brotli: { quality: 1 },
    })
  );

  server.use((req, res, next) => {
    if (req.path.match(/\/api\/extension\/.*/g)) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        extensionOrigins.has(req.headers.origin) ? req.headers.origin : false
      );
    }
    const vary = res.headers ? res.headers["vary"] || [] : [];
    res.setHeader("Vary", [...vary, "Origin"]);
    next();
  });

  server.get("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });
  server.post("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });

  server.listen(prod ? "/tmp/nginx.socket" : 3000, (err) => {
    if (err) throw err;
    prod && console.log("NextJS Server listening to NGINX");
    prod && fs.openSync("/tmp/app-initialized", "w");
  });
});
