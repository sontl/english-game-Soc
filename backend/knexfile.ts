import type { Knex } from "knex";
import { loadEnv } from "./src/config/env.js";

const env = loadEnv();

const config: Knex.Config = {
  client: "pg",
  connection: env.DATABASE_URL,
  searchPath: ["public"],
  migrations: {
    directory: "./migrations",
    extension: "ts"
  }
};

export default config;
