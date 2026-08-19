import { z } from "zod";

const DEFAULT_PORT = 3001;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  DATABASE_URL: z.string().min(1, "required"),
  JWT_SECRET: z.string().min(1, "required"),
  CORS_ORIGINS: z.string().optional(),
  CLIENT_DIST_PATH: z.string().optional(),
  REDIS_URL: z.string().optional(),
  DEMO_RESEED_HOURS: z.coerce.number().positive().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Environment is not usable:\n${details}`);
}

const env = parsed.data;

const allowedOrigins =
  env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const servesCrossSite = allowedOrigins.length > 0;
const isProduction = env.NODE_ENV === "production";

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  redisUrl: env.REDIS_URL ?? null,
  clientDistPath: env.CLIENT_DIST_PATH ?? null,
  demoReseedHours: env.DEMO_RESEED_HOURS ?? null,
  allowedOrigins,
  cookie: {
    secure: servesCrossSite || isProduction,
    sameSite: servesCrossSite ? ("none" as const) : ("lax" as const),
  },
} as const;
