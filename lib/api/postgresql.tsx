import Pg from "pg";
import { decode, encode } from "html-entities";
import SqlString from "sqlstring";

import { DATABASE_URL } from "lib/env";
import SumoLogic from "lib/api/sumologic";

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
  delete: (params: Delete) => Promise<Error | null>;
  insert: (params: Insert) => Promise<Error | null>;
  select: <T extends {} = never>(
    params: Select
  ) => Promise<Pg.QueryResult<T> | null>;
  update: (params: Update) => Promise<Error | null>;
} = {
  delete: async (params) => {
    const { conditions, table } = params;
    let error: Error | null = null;

    await client
      .query(`DELETE FROM ${table} WHERE ${conditions}`)
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
  insert: async (params) => {
    const { table, values } = params;
    let error: Error | null = null;
    await client
      .query(
        `INSERT INTO ${table} (${values
          .map(({ key }) => key)
          .join(", ")}) VALUES (${SqlString.format(
          `${values
            .map(({ value }) => {
              switch (typeof value) {
                case "string":
                  return "E?";
                case "number":
                  return "?";
                default:
                  SumoLogic.log({
                    level: "error",
                    message:
                      "Failed to UPDATE from Heroku PSQL: Unhandled value type",
                    params,
                  });
                  return "E?";
              }
            })
            .join(", ")}`,
          values.map(({ value }) => {
            switch (typeof value) {
              case "string":
                return encode(value);
              case "number":
                return value;
              default:
                SumoLogic.log({
                  level: "error",
                  message:
                    "Failed to UPDATE from Heroku PSQL: Unhandled value type",
                  params,
                });
                return value;
            }
          })
        )})`
      )
      .catch((err: Error) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to SELECT from Heroku PSQL: ${err.message}`,
          params,
        });
        error = err;
      });
    return error;
  },
  select: async <T extends {} = never>(params: Select) => {
    const { conditions, limit, table, orderBy, values } = params;
    let response: Pg.QueryResult<T> | null = null;
    await client
      .query(
        `SELECT ${values.join(", ")} FROM ${table} ${
          conditions ? `WHERE ${conditions}` : ""
        } ${orderBy ? `ORDER BY ${orderBy}` : ""} ${
          limit ? `LIMIT ${limit}` : ""
        }`
      )
      .then((res: Pg.QueryResult<T>) => {
        response = {
          ...res,
          rows: res.rows.map((row) => {
            for (const key in row) {
              if (!row.hasOwnProperty(key)) {
                continue;
              }
              const value = row[key];
              if (typeof value === "string") {
                //@ts-ignore
                row[key] = decode(value);
              }
            }
            return row;
          }),
        };
      })
      .catch((err: Error) => {
        console.log(err);
        SumoLogic.log({
          level: "error",
          message: `Failed to SELECT from Heroku PSQL: ${err.message}`,
          params,
        });
      });
    return response;
  },
  update: async (params) => {
    const { conditions, table, values } = params;
    let error: Error | null = null;

    const setValues = values
      .map(({ key, value }) => {
        switch (typeof value) {
          case "string":
            return SqlString.format(`${key}=E?`, [encode(value)]);
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

export type Tables = "businesses" | "products" | "tokens" | "users";

export interface Delete {
  table: Tables;
  conditions: string;
}

export interface Insert {
  table: Tables;
  values: NonEmptyArray<{ key: string; value: string | number }>;
}

export interface Select {
  table: Tables;
  values: Array<string>;
  conditions?: string;
  orderBy?: string;
  limit?: number;
}

export interface Update {
  table: Tables;
  values: NonEmptyArray<{ key: string; value: string | number }>;
  conditions: string;
}

export default psql;
