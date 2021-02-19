const { Client } = require("pg");
const client = new Client({
  // Must use SSL for Heroku Postgresql.
  // See: https://help.heroku.com/DR0TTWWD/seeing-fatal-no-pg_hba-conf-entry-errors-in-postgres
  // and https://stackoverflow.com/questions/61097695/self-signed-certificate-error-during-query-the-heroku-hosted-postgres-database
  ssl: { rejectUnauthorized: false },
  connectionString: process.env.DATABASE_URL,
  client_encoding: "UTF8",
  server_encoding: "UTF8",
});

client
  .connect()
  .then(() => console.log("Connected to postgresql admin"))
  .catch((err) => console.error(err));

exports.query = async (query) => {
  let response = null;
  await client
    .query(query)
    .then((res) => (response = res))
    .catch((err) => console.error(err));
  return response;
};
