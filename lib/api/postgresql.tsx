import Pg from "pg";
import SqlString from "sqlstring";

import { DATABASE_URL } from "../env";
import SumoLogic from "./sumologic";

const client = new Pg.Client({
  // Must use SSL for Heroku Postgresql.
  // See: https://help.heroku.com/DR0TTWWD/seeing-fatal-no-pg_hba-conf-entry-errors-in-postgres
  // and https://stackoverflow.com/questions/61097695/self-signed-certificate-error-during-query-the-heroku-hosted-postgres-database
  ssl: { rejectUnauthorized: false },
  connectionString: DATABASE_URL,
});

client.connect().catch((err) => {
  SumoLogic.log({
    level: "error",
    message: `Failed to connect to Heroku PSQL: ${err.message}`,
    params: {
      database_url: DATABASE_URL,
    },
  });
});

const psql: {
  select: <T extends {} = never>(params: Select) => Promise<T | null>;
  update: (params: Update) => Promise<Error | null>;
} = {
  select: async <T extends {} = never>(params: Select) => {
    const { conditions, table, orderBy, values } = params;
    let response: T | null = null;
    await client
      .query(
        `SELECT ${values.join(", ")} FROM ${table} ${
          conditions ? `WHERE ${conditions}` : ""
        } ${orderBy ? `ORDER BY ${orderBy}` : ""}`
      )
      .then((res: any) => (response = res))
      .catch((err: Error) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to SELECT from Heroku PSQL: ${err.message}`,
          params,
        });
      });
    return response;
  },
  update: async (params: Update) => {
    const { conditions, table, values } = params;
    let error: Error | null = null;

    const setValues = values
      .map(({ key, value }) => {
        switch (typeof value) {
          case "string":
            return SqlString.format(`${key}=E?`, [value]);
          case "number":
            return SqlString.format(`${key}=?`, [value]);
          default:
            SumoLogic.log({
              level: "error",
              message:
                "Failed to UPDATE from Heroku PSQL: Unhandled value type",
              params,
            });
            return "";
        }
      })
      .join(", ");

    await client
      .query(
        `UPDATE ${table} SET ${setValues} ${
          conditions ? `WHERE ${conditions}` : ""
        }`
      )
      .catch((err: Error) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to UPDATE from Heroku PSQL: ${err.message}`,
          params,
        });
        error = err;
      });

    return error;
  },
};

export interface Select {
  table: "businesses" | "products" | "tokens" | "users";
  values: Array<string>;
  conditions?: string;
  orderBy?: string;
}

export interface Update {
  table: "businesses" | "products" | "tokens" | "users";
  values: NonEmptyArray<{ key: string; value: string | number }>;
  conditions?: string;
}

export default psql;
