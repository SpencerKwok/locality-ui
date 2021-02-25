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
      async (usernameField, passwordField, done) => {
        const [users, error] = await psql.query(
          `SELECT first_name, last_name, companies.id AS id, companies.name AS company_name, password FROM users INNER JOIN companies ON users.id=companies.id WHERE username='${usernameField}'`
        );

        if (error) {
          done(error, null);
        } else {
          if (users.rows.length === 0) {
            done(new Error("Incorrect username"), null);
          } else {
            bcrypt.compare(
              passwordField,
              users.rows[0].password,
              (bcryptError, result) => {
                if (bcryptError) {
                  console.log(bcryptError);
                  done(bcryptError, null);
                } else if (result) {
                  done(null, {
                    firstName: users.rows[0].first_name,
                    lastName: users.rows[0].last_name,
                    username: usernameField,
                    companyId: users.rows[0].id,
                    companyName: users.rows[0].company_name,
                  });
                } else {
                  done(new Error("Incorrect password"), null);
                }
              }
            );
          }
        }
      }
    )
  );
  return passport;
};

module.exports = setup;
