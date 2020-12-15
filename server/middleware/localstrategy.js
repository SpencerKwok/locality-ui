const passport = require("passport");
const postgresql = require("../postgresql/client");
const sha512 = require("js-sha512");

const LocalStrategy = require("passport-local").Strategy;

const setup = function () {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "usernameField",
        passwordField: "passwordField",
      },
      async (usernameField, passwordField, done) => {
        postgresql
          .query(`SELECT * FROM admin WHERE email='${usernameField}'`)
          .then((response) => {
            const rows = response.rows;
            if (!rows || rows.length === 0) {
              done(new Error("Incorrect username"), null);
            } else if (rows[0].password !== sha512(passwordField)) {
              done(new Error("Incorrect password"), null);
            } else {
              done(null, {
                firstName: rows[0].first_name,
                lastName: rows[0].last_name,
              });
            }
          })
          .catch((err) => {
            console.error(err);
            done(err, null);
          });
      }
    )
  );

  return passport;
};

module.exports = setup;
