import { config } from "dotenv";
import { z, type ZodIssue } from "zod";

config();

const envSchema = z.object({
  PORT: z
    .string()
    .transform((value: string) => Number.parseInt(value, 10))
    .pipe(z.number().positive().default(4000)),
  VORLD_APP_ID: z.string().min(1, "VORLD_APP_ID is required"),
  CLIENT_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value: string) =>
      value
        .split(",")
        .map((origin: string) => origin.trim())
        .filter(Boolean),
    ),
  LOG_LEVEL: z.string().default("dev"),
  // Arena Game Service Configuration
  ARENA_SERVER_URL: z
    .string()
    .url()
    .default("wss://airdrop-arcade.onrender.com"),
  GAME_API_URL: z.string().url().default("https://arena.vorld.com/api"),
  ARENA_GAME_ID: z.string().optional(),
});

const parsed = envSchema.safeParse({
  PORT: process.env.PORT ?? "4000",
  VORLD_APP_ID: process.env.VORLD_APP_ID,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ARENA_SERVER_URL: process.env.ARENA_SERVER_URL,
  GAME_API_URL: process.env.GAME_API_URL,
  ARENA_GAME_ID: process.env.ARENA_GAME_ID,
});

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  parsed.error.issues.forEach((issue: ZodIssue) => {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = {
  ...parsed.data,
  CLIENT_ORIGINS: parsed.data.CLIENT_ORIGIN,
};
