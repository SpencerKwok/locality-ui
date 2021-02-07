const algolia = require("../algolia/client");
const router = require("express").Router();
const sw = require("stopword");
const customStopwords = new Set([
  "can't",
  "couldn't",
  "does",
  "doesn't",
  "don't",
  "isn't",
  "need",
  "needs",
  "no",
  "not",
  "shouldn't",
  "wasn't",
  "will",
  "won't",
  "wouldn't",
]);

router.get("/search", async function (req, res, next) {
  let q = req.query["q"];
  if (!q) {
    res.end();
  }

  q = sw
    .removeStopwords(q.split(/\s+/g), sw.en.concat(customStopwords))
    .join(" ");

  await algolia.findObjects(q).then((results) => {
    res.write(JSON.stringify(results));
  });

  res.end();
});

module.exports = router;
