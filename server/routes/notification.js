const router = require("express").Router();
const uuid = require("uuid");

// Keep track of connections
const { EventEmitter } = require("events");
const emitter = new EventEmitter();

// Register listener to events
router.get("/", function (req, res, next) {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  });

  const listener = (event, data) => {
    console.log(data);
    res.write(`id:  ${uuid.v4()}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.addListener("push", listener);

  req.on("close", () => {
    emitter.removeListener("push", listener);
  });

  next();
});

// Sends events to listeners
router.post("/", function (req, res, next) {
  setTimeout(() => {
    emitter.emit("push", "notification", {
      title: req.body.title,
      description: req.body.description,
    });
  }, 5000);

  // Nothing to say
  res.end();
});

module.exports = router;
