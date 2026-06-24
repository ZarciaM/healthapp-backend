import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGODB_URI: z
    .string()
    .trim()
    .min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .trim()
    .min(1, "JWT_ACCESS_SECRET is required"),

  JWT_REFRESH_SECRET: z
    .string()
    .trim()
    .min(1, "JWT_REFRESH_SECRET is required"),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .trim()
    .default("15m"),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .trim()
    .default("7d"),

  CLIENT_URL: z
    .string()
    .url("CLIENT_URL must be a valid URL")
    .default("http://localhost:5173"),

  GOOGLE_CLIENT_ID: z
    .string()
    .trim()
    .min(1, "GOOGLE_CLIENT_ID is required"),

  GOOGLE_CLIENT_SECRET: z
    .string()
    .trim()
    .min(1, "GOOGLE_CLIENT_SECRET is required"),

  GOOGLE_CALLBACK_URL: z
    .string()
    .url("GOOGLE_CALLBACK_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n Environment validation failed:\n");

  parsed.error.issues.forEach((issue) => {
    const field = issue.path.join(".");

    console.error(`• ${field}: ${issue.message}`);
  });

  console.error("\nPlease check your .env file.\n");

  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export type Env = typeof env;