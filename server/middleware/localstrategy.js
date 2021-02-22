const passport = require("passport");
const psql = require("../postgresql/client");
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
        psql
          .query(
            `SELECT first_name, last_name, companies.company_id AS company_id, companies.name AS company_name, password FROM users INNER JOIN companies ON users.company_id=companies.company_id WHERE username='${usernameField}'`
          )
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
                    username: usernameField,
                    companyId: rows[0].company_id,
                    companyName: rows[0].company_name,
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
