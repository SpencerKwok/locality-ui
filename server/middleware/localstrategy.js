import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import psql from "../postgresql/client.js";
import sqlString from "sqlstring";

export function passportSetup() {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (usernameField, passwordField, done) => {
        const [users, error] = await psql.query(
          sqlString.format(
            "SELECT first_name, last_name, companies.id AS id, companies.name AS company_name, password, logo FROM users INNER JOIN companies ON users.id=companies.id WHERE username=E?",
            [usernameField]
          )
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
}
