import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at startup.
 * Never import this module from client components: it contains secrets.
 */
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),

  /** Language model provider: "anthropic" or "mock" (offline, deterministic). */
  AI_PROVIDER: z.enum(["anthropic", "mock"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("claude-opus-5-5"),

  /** Speech-to-text: "browser" uses the Web Speech API on the client; "none" disables voice input. */
  SPEECH_TO_TEXT_PROVIDER: z.enum(["browser", "none"]).default("browser"),
  SPEECH_TO_TEXT_API_KEY: z.string().optional(),
  /**
   * Text-to-speech: "browser" uses speechSynthesis on the client; "openai" and
   * "elevenlabs" synthesize natural voices on the server (need TEXT_TO_SPEECH_API_KEY);
   * "none" disables audio.
   */
  TEXT_TO_SPEECH_PROVIDER: z.enum(["browser", "openai", "elevenlabs", "none"]).default("browser"),
  TEXT_TO_SPEECH_API_KEY: z.string().optional(),
  /** Optional voice override: an OpenAI voice name (e.g. "nova") or an ElevenLabs voice id. */
  TEXT_TO_SPEECH_VOICE: z.string().optional(),

  /**
   * Speech-to-text for podcast audio the learner adds from a link: "openai" (Whisper, needs
   * TRANSCRIPTION_API_KEY) or "none" (the learner pastes a transcript instead). YouTube captions
   * and podcast-provided transcripts need no key.
   */
  TRANSCRIPTION_PROVIDER: z.enum(["openai", "none"]).default("none"),
  TRANSCRIPTION_API_KEY: z.string().optional(),

  /** Sign-up needs this code. Required in production; if unset in development anyone can sign up. */
  INVITE_CODE: z.string().min(6).optional(),
  /** This email gets the ADMIN role when it signs up (or is created by `npm run user:create`). */
  ADMIN_EMAIL: z.string().email().optional(),

  /** Email delivery: "console" logs emails (development). */
  EMAIL_PROVIDER: z.enum(["console"]).default("console"),
  EMAIL_FROM: z.string().default("BijNederlands <no-reply@example.com>"),
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
  const tts = parsed.data.TEXT_TO_SPEECH_PROVIDER;
  if ((tts === "openai" || tts === "elevenlabs") && !parsed.data.TEXT_TO_SPEECH_API_KEY) {
    throw new Error(`TEXT_TO_SPEECH_PROVIDER=${tts} requires TEXT_TO_SPEECH_API_KEY`);
  }
  if (parsed.data.TRANSCRIPTION_PROVIDER === "openai" && !parsed.data.TRANSCRIPTION_API_KEY) {
    throw new Error("TRANSCRIPTION_PROVIDER=openai requires TRANSCRIPTION_API_KEY");
  }
  return parsed.data;
}

export const env = load();
