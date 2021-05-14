import Pg from "pg";
const client = new Pg.Client({
  // Must use SSL for Heroku Postgresql.
  // See: https://help.heroku.com/DR0TTWWD/seeing-fatal-no-pg_hba-conf-entry-errors-in-postgres
  // and https://stackoverflow.com/questions/61097695/self-signed-certificate-error-during-query-the-heroku-hosted-postgres-database
  ssl: { rejectUnauthorized: false },
  connectionString: process.env.HEROKU_POSTGRESQL_IVORY,
});

client.connect().catch((err) => console.error(err));

const psql: { [key: string]: any } = {};
psql.query = async (query: any) => {
  let response,
    error = null;
  await client
    .query(query)
    .then((res: any) => (response = res))
    .catch((err: Error) => {
      console.error(err);
      error = err.message;
    });
  return [response, error];
};

export default psql;
