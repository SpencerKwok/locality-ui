import Pg from "pg";

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
  select: <T extends {}>(
    params: Select
  ) => Promise<FixedLengthArray<[T, null] | [null, Error]>>;
} = {
  select: async <T extends {}>(params: Select) => {
    const { conditions, table, orderBy, values } = params;
    let response: T | null = null;
    let error: Error | null = null;
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
        error = err;
      });
    if (error) {
      return [null, error];
    } else if (response) {
      return [response, null];
    }

    SumoLogic.log({
      level: "error",
      message: `Failed to SELECT from Heroku PSQL: Reached code that shouldn't be reachable`,
      params,
    });

    return [null, new Error("Reached code that shouldn't be reachable")];
  },
};

export interface Select {
  table: "businesses" | "products" | "tokens" | "users";
  values: Array<string>;
  conditions?: string;
  orderBy?: string;
}

export default psql;
