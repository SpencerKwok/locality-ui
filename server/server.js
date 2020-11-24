const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");

// Get port from Heroku dyno
const port = process.env.PORT || 3001;

// Serve UI
const app = express();
app.use(express.static(path.join(__dirname, "../build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// Enforce CORS
app.use(cors());

// Allow JSON body
app.use(express.json());

// Handle notifications
app.use("/notification", require("./routes/notification"));

const server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listening on port::" + port);
});
