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
            "SELECT first_name, last_name, password, id FROM users WHERE username=E?",
            [usernameField]
          )
        );

        if (error) {
          done(error, null);
          return;
        }

        if (users.rows.length === 0) {
          done(new Error("Incorrect username"), null);
          return;
        }

        bcrypt.compare(
          passwordField,
          users.rows[0].password,
          async (bcryptError, result) => {
            if (bcryptError) {
              console.log(bcryptError);
              done(bcryptError, null);
            } else if (result) {
              const [company, error] = await psql.query(
                sqlString.format("SELECT id FROM companies WHERE id=?", [
                  users.rows[0].id,
                ])
              );

              if (error) {
                console.log(error);
                done(null, {
                  username: usernameField,
                });
              } else if (company.rows.length === 0) {
                done(null, {
                  username: usernameField,
                });
              } else {
                done(null, {
                  firstName: users.rows[0].first_name,
                  lastName: users.rows[0].last_name,
                  username: usernameField,
                  companyId: company.rows[0].id,
                });
              }
            } else {
              done(new Error("Incorrect password"), null);
            }
          }
        );
      }
    )
  );
  return passport;
}
