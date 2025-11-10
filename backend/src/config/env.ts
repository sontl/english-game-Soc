import { config } from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().default("postgres://postgres:postgres@localhost:5432/english_game"),
  CLOUD_FLARE_ACCOUNT_ID: z.string().optional(),
  CLOUD_FLARE_API_TOKEN: z.string().optional(),
  CLOUD_FLARE_IMAGES_ACCOUNT_HASH: z.string().optional(),
  CLOUD_FLARE_R2_BUCKET: z.string().optional(),
  PARENT_AUTH_SECRET: z.string().optional()
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const loadEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  config();
  const parsed = envSchema.parse(process.env);
  cachedEnv = parsed;
  return parsed;
};
