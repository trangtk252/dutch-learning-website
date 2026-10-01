import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at startup.
 * Never import this module from client components: it contains secrets.
 */
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  /** Language model provider: "anthropic" or "mock" (offline, deterministic). */
  AI_PROVIDER: z.enum(["anthropic", "mock"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("claude-opus-5-5"),

  /** Speech-to-text: "browser" uses the Web Speech API on the client; "none" disables voice input. */
  SPEECH_TO_TEXT_PROVIDER: z.enum(["browser", "none"]).default("browser"),
  SPEECH_TO_TEXT_API_KEY: z.string().optional(),
  /** Text-to-speech: "browser" uses speechSynthesis on the client; "none" disables audio. */
  TEXT_TO_SPEECH_PROVIDER: z.enum(["browser", "none"]).default("browser"),
  TEXT_TO_SPEECH_API_KEY: z.string().optional(),

  /** Email delivery: "console" logs emails (development). */
  EMAIL_PROVIDER: z.enum(["console"]).default("console"),
  EMAIL_FROM: z.string().default("Leer Nederlands <no-reply@example.com>"),

  /** Comma-separated emails that become ADMIN on sign-up. */
  ADMIN_EMAILS: z.string().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

function load(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  if (parsed.data.AI_PROVIDER === "anthropic" && !parsed.data.AI_API_KEY) {
    throw new Error("AI_PROVIDER=anthropic requires AI_API_KEY");
  }
  return parsed.data;
}

export const env = load();

export const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
);
