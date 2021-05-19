import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Bcrypt from "bcryptjs";

import Psql from "../../../lib/api/postgresql";
import SqlString from "sqlstring";

export default NextAuth({
  callbacks: {
    signIn: async (user) => {
      let email = user.email || "";
      const [userData, error] = await Psql.query(
        SqlString.format("SELECT id FROM users WHERE email=E?", [email])
      );
      if (error) {
        console.log(error);
        return Promise.resolve(false);
      } else if (userData.rows.length !== 1) {
        console.log("User does not exist");
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    },
    jwt: async (token, user) => {
      const createUser = async (email) => {
        const [userData, userDataError] = await Psql.query(
          SqlString.format(
            "SELECT first_name, last_name, id FROM users WHERE email=E?",
            [email]
          )
        );
        if (userDataError) {
          console.log(userDataError);
          return {};
        }
        if (userData.rows.length !== 1) {
          console.log("JWT not associated with a valid user");
          return {};
        }

        const [businessData, businessDataError] = await Psql.query(
          SqlString.format("SELECT id FROM businesses WHERE id=?", [
            userData.rows[0].id,
          ])
        );
        if (businessDataError) {
          console.log(businessDataError);
          return {};
        }

        if (businessData.rows.length === 1) {
          return {
            id: userData.rows[0].id,
            email: email,
            isBusiness: true,
            firstName: userData.rows[0].first_name,
            lastName: userData.rows[0].last_name,
          };
        } else {
          return {
            id: userData.rows[0].id,
            isBusiness: false,
          };
        }
      };

      if (user) {
        token = { user: await createUser(user.email) };
        return Promise.resolve(token);
      }

      return Promise.resolve(token);
    },
    session: async (session, user) => {
      session.user = user.user;
      return Promise.resolve(session);
    },
  },
  providers: [
    Providers.Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async ({ email, password }) => {
        const [users, error] = await Psql.query(
          SqlString.format("SELECT email, password FROM users WHERE email=E?", [
            email,
          ])
        );
        if (error) {
          console.log(error);
          return Promise.resolve(null);
        }
        if (users.rows.length !== 1) {
          console.log("User does not exist");
          return Promise.resolve(null);
        }

        let passwordMatch = await Bcrypt.compare(
          password,
          users.rows[0].password
        ).catch((err) => console.log(err));
        if (!passwordMatch) {
          console.log("Incorrect password");
          return Promise.resolve(null);
        }

        return Promise.resolve({ email });
      },
    }),
    Providers.Facebook({
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // We don't encrypt the JWT as there isn't
  // much private information and isn't worth
  // the performance trade off
  jwt: {
    //encryption: true,
    //secret: process.env.JWT_SECRET,
    signingKey: process.env.JWT_SIGNING_KEY,
  },
  secret: process.env.SESSION_SECRET,
  session: {
    jwt: true,
    maxAge: 24 * 60 * 60, // 24 hrs
  },
});
