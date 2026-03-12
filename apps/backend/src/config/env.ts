import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  FRONTEND_DIST_PATH: z.string().default("../public"),
  ADMIN_EMAIL: z.string().email().optional(),
  CLERK_JWKS_URL: z.string().url().optional(),
  CLERK_ISSUER: z.string().min(1).optional(),
  CLERK_AUDIENCE: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  POSTMARK_SERVER_TOKEN: z.string().optional(),
  POSTMARK_FROM_EMAIL: z.string().email().optional(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:4000"),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
