const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const port = process.env.PORT || 3001;

const app = express();
app.use(express.static(path.join(__dirname, "../build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listening on port::" + port);
});
