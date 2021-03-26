// Add WAF
if (process.env.ENV === "PROD") {
  import sqreen from "sqreen";
}

import api from "./routes/api.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import compression from "compression";
import enforce from "express-sslify";
import express from "express";
import { fileURLToPath } from "url";
import http from "http";
import path from "path";
import { passportSetup } from "./middleware/localstrategy.js";
import helmet from "helmet";

// Get port from Heroku dyno
const port = process.env.PORT || 3001;

// App setup
const app = express();

// Add gzip compression
app.use(compression({ level: 1 }));

// Add security layer
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "https://res.cloudinary.com", "blob:", "data:"],
        connectSrc: [
          "'self'",
          "https://ipv4.icanhazip.com",
          "https://api.ipify.org",
          "https://api.cloudinary.com",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'self'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        childSrc: ["'self'"],
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
  })
);

// Force ssl
if (process.env.ENV === "PROD") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

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
const passport = passportSetup();
app.use(passport.initialize());
app.use(passport.session());

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

const server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listening on port::" + port);
});
