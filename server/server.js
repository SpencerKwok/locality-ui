// Add WAF
if (process.env.ENV === "PROD") {
  require("sqreen");
}

const cors = require("cors");
const express = require("express");
const http = require("http");
const path = require("path");
const helmet = require("helmet");
const enforce = require("express-sslify");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

// Get port from Heroku dyno
const port = process.env.PORT || 3001;

// App setup
const app = express();

// Add security layer
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          "https://ipv4.icanhazip.com",
          "https://api.ipify.org",
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
      "https://www.google.ca",
      "https://www.google.com",
      "https://www.etsy.com",
      "https://www.amazon.ca",
      "https://www.amazon.com",
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
  })
);

// Setup cookie parser
app.use(cookieParser());

// Setup passport
const passport = require("./middleware/localstrategy")();
app.use(passport.initialize());
app.use(passport.session());

// Move static middleware to top to improve load speed
// See: https://stackoverflow.com/questions/26106399/node-js-express-js-very-slow-serving-static-files
app.use(express.static(path.join(__dirname, "../build")));

// Allow JSON body
app.use(express.json());

// Handle search
app.use("/api", require("./routes/api"));

// Handle everything else
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listening on port::" + port);
});
