const router = require("express").Router();
const algoliaclient = require("../algolia/client");

// Keep track of connections
const { EventEmitter } = require("events");
const emitter = new EventEmitter();

router.get("/", function (req, res, next) {
  // Register listener to events
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  });

  // Flush headers to kick start
  // the persistent connection
  res.flushHeaders();

  const listener = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.addListener("push", listener);

  req.on("close", () => {
    emitter.removeListener("push", listener);
  });
});

router.post("/", function (req, res, next) {
  const notification = {
    title: req.body.title,
    description: req.body.description,
  };

  // Store notification in algolia
  algoliaclient.saveObjects([notification]);

  // Sends events to listeners
  setTimeout(() => {
    emitter.emit("push", "notification", notification);
  }, 1000);

  // Nothing to say
  res.end();
});

module.exports = router;
