/**
 * Voice pipeline abstractions. The pipeline is deliberately decoupled:
 *
 *   SpeechRecognitionProvider (STT) → LanguageModelProvider (conversation)
 *     → sentence analysis (corrections) → TextToSpeechProvider (TTS)
 *
 * Each stage can be swapped independently via environment variables
 * (SPEECH_TO_TEXT_PROVIDER, TEXT_TO_SPEECH_PROVIDER, AI_PROVIDER).
 */

export type SpeechProviderName = "browser" | "none";

/** Client-safe description of the configured voice providers (no secrets). */
export interface VoiceConfig {
  stt: SpeechProviderName;
  tts: SpeechProviderName;
}

export interface SpeakOptions {
  /** 0.5–1.5; learners often benefit from 0.85–0.9. */
  rate?: number;
  /** Prefer a different voice per speaker in dialogues. */
  voiceIndex?: number;
  onEnd?: () => void;
}

export interface TextToSpeechProvider {
  readonly available: boolean;
  speak(text: string, options?: SpeakOptions): void;
  stop(): void;
}

export interface RecognitionCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionProvider {
  readonly available: boolean;
  start(callbacks: RecognitionCallbacks): void;
  stop(): void;
}

/**
 * Server-side providers (e.g. a cloud STT/TTS API) implement these. Audio is
 * processed in memory and never persisted.
 */
export interface ServerTextToSpeech {
  synthesize(text: string, opts: { language: "nl-NL"; rate?: number }): Promise<{ audio: ArrayBuffer; mimeType: string }>;
}
export interface ServerSpeechToText {
  transcribe(audio: ArrayBuffer, opts: { language: "nl-NL"; mimeType: string }): Promise<{ text: string }>;
}
