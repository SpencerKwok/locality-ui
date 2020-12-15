const passport = require("passport");
const router = require("express").Router();

router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      res.write(JSON.stringify({ message: err.message }));
      res.end();
    } else if (!user) {
      res.write(JSON.stringify({ message: "Missing credentials" }));
      res.end();
    } else {
      res.cookie("firstName", user.firstName);
      res.cookie("lastName", user.lastName);

      res.write(JSON.stringify({ message: "Successfully logged in" }));
      res.end();
    }
  })(req, next);
});

module.exports = router;
