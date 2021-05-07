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

const helmet = require("helmet");

const app = next({ dev: process.env.NODE_ENV !== "production" });
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

      // Need to be able to load images from Cloudinary
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,

      dnsPrefetchControl: {
        // Less privacy for users, but improves performance
        allow: false,
      },
      expectCt: {
        enforce: true,
      },
      frameguard: {
        action: "same-origin",
      },
      hsts: {
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: {
        permittedPolicies: "none",
      },
      referrerPolicy: {
        policy: "same-origin",
      },
      xssFilter: true,
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
