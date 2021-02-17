const passport = require("passport");
const postgresql = require("../postgresql/client");
const bcrypt = require("bcryptjs");

const LocalStrategy = require("passport-local").Strategy;

const setup = function () {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      (usernameField, passwordField, done) => {
        postgresql
          .query(`SELECT * FROM users WHERE username='${usernameField}'`)
          .then((response) => {
            const rows = response.rows;
            if (rows.length === 0) {
              done(new Error("Incorrect username"), null);
            } else {
              bcrypt.compare(passwordField, rows[0].password, (err, result) => {
                if (result) {
                  done(null, {
                    firstName: rows[0].first_name,
                    lastName: rows[0].last_name,
                    companyId: rows[0].company_id,
                  });
                } else {
                  done(new Error("Incorrect password"), null);
                }
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
