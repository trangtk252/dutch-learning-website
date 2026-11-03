"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getSpeechRecognition, getTextToSpeech } from "@/lib/speech/browser";
import type { SpeechRecognitionProvider, TextToSpeechProvider, VoiceConfig } from "@/lib/speech/types";

const VoiceContext = createContext<{ tts: TextToSpeechProvider; stt: SpeechRecognitionProvider } | null>(null);

export function VoiceProvider({ config, children }: { config: VoiceConfig; children: ReactNode }) {
  const value = useMemo(() => ({ tts: getTextToSpeech(config), stt: getSpeechRecognition(config) }), [config]);
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used inside <VoiceProvider>");
  return ctx;
}
