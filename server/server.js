// Add WAF
import { createRequire } from "module";
if (process.env.ENV === "PROD") {
  const require = createRequire(import.meta.url);
  require("sqreen");
}

import api from "./routes/api.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import enforce from "express-sslify";
import express from "express";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import https from "https";
import passport from "passport";
import path from "path";
import { localPassportSetup } from "./middleware/localstrategy.js";
import helmet from "helmet";
import shrinkRay from "shrink-ray-current";

// Get port from Heroku dyno
const port = process.env.PORT || 3001;

// App setup
const app = express();

// Add brotli/gzip compression
app.use(
  shrinkRay({
    useZopfliForGzip: false,
    cache: () => true,
    zlib: { level: 1 },
    brotli: { quality: 1 },
  })
);

// Add security layer
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://apis.google.com",
          "https://connect.facebook.net",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://www.facebook.com",
          "https://res.cloudinary.com",
        ],
        connectSrc: [
          "'self'",
          "https://ipv4.icanhazip.com",
          "https://api.ipify.org",
          "https://api.cloudinary.com",
          "https://www.facebook.com",
          "https://graph.facebook.com",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'self'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

// Adding additional security headers
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), screen-wake-lock=(), xr-spatial-tracking=()"
  );

  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Enable cors
app.use(
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

// Force ssl
app.use(enforce.HTTPS({ trustProtoHeader: true }));

// Setup cookie session
app.use(
  cookieSession({
    secret: process.env.SESSION_SECRET,
    secure: true, // Heroku provides TLS connection
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    sameSite: "strict",
  })
);

// Setup cookie parser
app.use(cookieParser());

// Setup passport
const initializedPassport = localPassportSetup(passport);
app.use(initializedPassport.initialize());
app.use(initializedPassport.session());

// Move static middleware to top to improve load speed
// See: https://stackoverflow.com/questions/26106399/node-js-express-js-very-slow-serving-static-files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../build")));

// Allow JSON body
app.use(express.json({ limit: "100mb" }));

// Setup API
app.use("/api", api);

// Handle everything else
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// We use the heroku certificates on PROD
if (process.env.ENV === "PROD") {
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log("Server listening on port::" + port);
  });
} else {
  // redirect HTTP server
  const reverseProxy = express();
  reverseProxy.all("*", (req, res) => {
    res.redirect(301, `https://localhost:${port}`);
  });
  const reverseProxyServer = http.createServer(reverseProxy);
  reverseProxyServer.listen(3000);

  // HTTPS server using self-signed certificates
  const certOptions = {
    key: fs.readFileSync(path.resolve("cert/server.key")),
    cert: fs.readFileSync(path.resolve("cert/server.crt")),
  };
  const server = https.createServer(certOptions, app);
  server.listen(port, () => {
    console.log("Server listening on port::" + port);
  });
}
