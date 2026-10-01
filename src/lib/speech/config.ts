import "server-only";
import { env } from "../env";
import type { VoiceConfig } from "./types";

/** Client-safe voice configuration derived from environment variables. */
export function getVoiceConfig(): VoiceConfig {
  return { stt: env.SPEECH_TO_TEXT_PROVIDER, tts: env.TEXT_TO_SPEECH_PROVIDER };
}
