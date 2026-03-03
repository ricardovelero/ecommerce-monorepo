import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public"),
  FRONTEND_DIST_PATH: z.string().default("../public"),
  ADMIN_EMAIL: z.string().email().optional(),
  CLERK_JWKS_URL: z.string().url().optional(),
  CLERK_ISSUER: z.string().min(1).optional(),
  CLERK_AUDIENCE: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:4000"),
});

export const env = envSchema.parse(process.env);
