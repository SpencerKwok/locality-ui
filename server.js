/*
Middleware does not run on static pages for Next.js
applications and using next-secure-headers means no longer
utilizing automatic static optimization. So although
not recommended, we use a server to run middleware
between the user and Next application
*/
process.env.NODE_ENV === "production" && require("sqreen");

const express = require("express");
const fs = require("fs");
const next = require("next");
const { parse } = require("url");

const shrinkRay = require("shrink-ray-current");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

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

  server.get("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });
  server.post("*", (req, res) => {
    const url = parse(req.url, true);
    return handle(req, res, url);
  });

  server.listen("/tmp/nginx.socket", (err) => {
    if (err) throw err;
    console.log("NextJS Server listening to NGINX");
    fs.openSync("/tmp/app-initialized", "w");
  });
});
