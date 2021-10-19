import os
import psycopg2
import psycopg2.extras

# Get connection to PSQL database
def get_connection():
    conn = psycopg2.connect(
        os.environ["DATABASE_URL"],
        connection_factory=psycopg2.extras.RealDictConnection,
    )
    conn.autocommit = True
    return conn
