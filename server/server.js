const cors = require("cors");
const express = require("express");
const http = require("http");
const path = require("path");
const helmet = require("helmet");
const enforce = require("express-sslify");

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
        scriptSrc: [
          "'self'",
          "'sha256-i2yG/9t5BT8ag9OWwSOKIcSLj4C7OAFDUZ2tgIGvxKw='",
        ],
        styleSrc: [
          "'self'",
          "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
          "'sha256-zKIMqpb9PngphVHnm5hraLGca6+kaUpcDBuiHrTyzuI='",
        ],
        imgSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
);

// Adding permissions policy
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(self)");
  next();
});

// Enable cors
app.use(cors());

// Force ssl
if (process.env.ENV === "PROD") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

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
