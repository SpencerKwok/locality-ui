import pg from "pg";
const client = new pg.Client({
  // Must use SSL for Heroku Postgresql.
  // See: https://help.heroku.com/DR0TTWWD/seeing-fatal-no-pg_hba-conf-entry-errors-in-postgres
  // and https://stackoverflow.com/questions/61097695/self-signed-certificate-error-during-query-the-heroku-hosted-postgres-database
  ssl: { rejectUnauthorized: false },
  connectionString: process.env.DATABASE_URL,
});

client
  .connect()
  .then(() => console.log("Connected to postgresql admin"))
  .catch((err) => console.error(err));

const psql = {};
psql.query = async (query) => {
  let response,
    error = null;
  await client
    .query(query)
    .then((res) => (response = res))
    .catch((err) => {
      console.error(err);
      error = {
        code: 500,
        message: err.message,
      };
    });
  return [response, error];
};

export default psql;
