const cors = require("cors");
const express = require("express");
const http = require("http");
const path = require("path");
const cookieSession = require("cookie-session");

// Get port from Heroku dyno
const port = process.env.PORT || 3001;

// App setup
const app = express();

// Setup cookie session
app.use(
  cookieSession({
    secret: process.env.SESSION_SECRET,
    secure: true, // Heroku provides TLS connection
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  })
);

// Setup passport
const passport = require("./middleware/localstrategy")();
app.use(passport.initialize());
app.use(passport.session());

// Enforce CORS
app.use(cors());

// Allow JSON body
app.use(express.json());

// Handle login/logout
app.use("/login", require("./routes/login"));
//app.use("/logout", require("./routes/logout"));

// Handle notifications
app.use("/notification", require("./routes/notification"));

app.use(express.static(path.join(__dirname, "../build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listening on port::" + port);
});
