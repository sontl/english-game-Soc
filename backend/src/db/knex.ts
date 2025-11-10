import knex, { Knex } from "knex";
import { loadEnv } from "../config/env";

let connection: Knex | null = null;

export const getConnection = (): Knex => {
  if (connection) {
    return connection;
  }

  const env = loadEnv();
  connection = knex({
    client: "pg",
    connection: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    }
  });

  return connection;
};

export const closeConnection = async () => {
  if (!connection) {
    return;
  }
  await connection.destroy();
  connection = null;
};
