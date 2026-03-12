import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});
dotenv.config({
  path: path.resolve(__dirname, "../../../backend/.env"),
  override: true,
});
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  STRIPE_SECRET_KEY: z.string().min(1),
  POSTMARK_SERVER_TOKEN: z.string().optional(),
  POSTMARK_FROM_EMAIL: z.string().email().optional(),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
});

export const env = envSchema.parse(process.env);
