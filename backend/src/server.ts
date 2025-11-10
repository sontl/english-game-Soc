import { createServer } from "http";
import app from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

const server = createServer(app);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${env.PORT}`);
});
