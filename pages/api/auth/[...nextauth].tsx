import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Bcrypt from "bcryptjs";

import SumoLogic from "lib/api/sumologic";

import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  //JWT_SECRET,
  JWT_SIGNING_KEY,
  SESSION_SECRET,
} from "lib/env";
import Psql from "lib/api/postgresql";
import SqlString from "sqlstring";

import type { JWT } from "next-auth/jwt";

export default NextAuth({
  callbacks: {
    signIn: async (user) => {
      const email = user.email ?? "";
      const userData = await Psql.select<{ rowCount: number }>({
        table: "users",
        values: ["id"],
        conditions: SqlString.format("email=E?", [email]),
      });
      if (!userData) {
        SumoLogic.log({
          level: "error",
          method: "signin (signIn) ",
          message: "Failed to SELECT from Heroku PSQL: Missing response",
          params: user,
        });
        return Promise.resolve(false);
      } else if (userData.rowCount !== 1) {
        SumoLogic.log({
          level: "info",
          method: "signin (signIn) ",
          message: "Attempted signin from a non-existent user",
          params: user,
        });
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    },
    jwt: async (token, user) => {
      const createUser = async (email: string): Promise<JWT> => {
        const userData = await Psql.select<{
          first_name: string;
          last_name: string;
          id: number;
        }>({
          table: "users",
          values: ["first_name", "last_name", "id"],
          conditions: SqlString.format("email=E?", [email]),
        });
        if (!userData) {
          SumoLogic.log({
            level: "error",
            method: "signin (jwt)",
            message: "Failed to SELECT from Heroku PSQL: Missing response",
            params: user,
          });
          return {};
        }
        if (userData.rowCount !== 1) {
          SumoLogic.log({
            level: "info",
            method: "signin (jwt) ",
            message: "Attempted JWT request for a non-existent user",
            params: user,
          });
          return {};
        }

        const businessData = await Psql.select<{
          id: number;
        }>({
          table: "businesses",
          values: ["id"],
          conditions: SqlString.format("id=?", [userData.rows[0].id]),
        });
        if (!businessData) {
          SumoLogic.log({
            level: "error",
            method: "signin (jwt)",
            message: "Failed to SELECT from Heroku PSQL: Missing response",
            params: user,
          });
          return {};
        }

        return {
          id: userData.rows[0].id,
          email: email,
          isBusiness: businessData.rowCount === 1,
          firstName: userData.rows[0].first_name,
          lastName: userData.rows[0].last_name,
        };
      };

      if (typeof user?.email === "string" && user.email) {
        token = { user: await createUser(user.email) };
      }

      return Promise.resolve(token);
    },
    session: async (session, user: { user: any }) => {
      session.user = user.user;
      return Promise.resolve(session);
    },
  },
  pages: {
    error: "/signin",
  },
  providers: [
    Providers.Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        const users = await Psql.select<{
          email: string;
          password: string;
        }>({
          table: "users",
          values: ["email", "password"],
          conditions: SqlString.format("email=E?", [email]),
        });
        if (!users) {
          SumoLogic.log({
            level: "error",
            method: "signin (authorize)",
            message: "Failed to SELECT from Heroku PSQL: Missing response",
            params: { email },
          });
          return Promise.resolve(null);
        }
        if (users.rowCount !== 1) {
          SumoLogic.log({
            level: "info",
            method: "signin (authorize)",
            message: "Attempted credentials signin for a non-existent user",
            params: { email },
          });
          return Promise.resolve(null);
        }

        const passwordMatch = await Bcrypt.compare(
          password,
          users.rows[0].password
        ).catch((err) => {
          console.log(err);
        });
        if (passwordMatch !== true) {
          console.log("Incorrect password");
          return Promise.resolve(null);
        }

        return Promise.resolve({ email });
      },
    }),
    Providers.Facebook({
      clientId: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
    }),
    Providers.Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],

  // We don't encrypt the JWT as there isn't
  // much private information and isn't worth
  // the performance trade off
  jwt: {
    //encryption: true,
    //secret: JWT_SECRET,
    signingKey: JWT_SIGNING_KEY,
  },
  secret: SESSION_SECRET,
  session: {
    jwt: true,
    maxAge: 24 * 60 * 60, // 24 hrs
  },
});
