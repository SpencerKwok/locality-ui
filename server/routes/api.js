const algolia = require("../algolia/client");
const router = require("express").Router();

router.use("/search", async function (req, res, next) {
  let q = req.query["q"];
  if (!q) {
    res.end();
  }

  await algolia
    .findObjects(q)
    .then((results) => {
      res.write(JSON.stringify(results));
    })
    .catch((err) => console.log(err));

  res.end();
});

module.exports = router;
