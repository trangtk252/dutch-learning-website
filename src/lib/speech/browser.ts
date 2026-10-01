"use client";

import type {
  RecognitionCallbacks,
  SpeakOptions,
  SpeechRecognitionProvider,
  TextToSpeechProvider,
  VoiceConfig,
} from "./types";

/** TTS via the Web Speech API (speechSynthesis). Audio never leaves the device. */
class BrowserTextToSpeech implements TextToSpeechProvider {
  get available() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private dutchVoices(): SpeechSynthesisVoice[] {
    const voices = window.speechSynthesis.getVoices();
    const nl = voices.filter((v) => v.lang.toLowerCase().startsWith("nl"));
    // Prefer nl-NL over nl-BE, then local voices.
    return nl.sort(
      (a, b) =>
        Number(b.lang === "nl-NL") - Number(a.lang === "nl-NL") || Number(b.localService) - Number(a.localService),
    );
  }

  speak(text: string, options: SpeakOptions = {}) {
    if (!this.available) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "nl-NL";
    u.rate = options.rate ?? 0.92;
    const voices = this.dutchVoices();
    if (voices.length) u.voice = voices[(options.voiceIndex ?? 0) % voices.length];
    if (options.onEnd) {
      u.onend = options.onEnd;
      u.onerror = options.onEnd;
    }
    synth.speak(u);
  }

  stop() {
    if (this.available) window.speechSynthesis.cancel();
  }
}

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * STT via the Web Speech API. Note: in some browsers (e.g. Chrome) recognition
 * is performed by the browser vendor's service; we never receive or store audio.
 */
class BrowserSpeechRecognition implements SpeechRecognitionProvider {
  private rec: InstanceType<RecognitionCtor> | null = null;

  get available() {
    return getRecognitionCtor() !== null;
  }

  start(cb: RecognitionCallbacks) {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      cb.onError?.("Speech recognition is not supported in this browser. Try Chrome or Edge, or type instead.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "nl-NL";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      cb.onInterim?.((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      const msg =
        e.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings, or type instead."
          : e.error === "no-speech"
            ? "No speech detected. Try again."
            : `Speech recognition error: ${e.error}`;
      cb.onError?.(msg);
    };
    rec.onend = () => {
      if (finalText.trim()) cb.onFinal(finalText.trim());
      cb.onEnd?.();
      this.rec = null;
    };
    this.rec = rec;
    rec.start();
  }

  stop() {
    this.rec?.stop();
  }
}

const noopTts: TextToSpeechProvider = { available: false, speak: () => {}, stop: () => {} };
const noopStt: SpeechRecognitionProvider = {
  available: false,
  start: (cb) => cb.onError?.("Voice input is disabled."),
  stop: () => {},
};

let tts: TextToSpeechProvider | null = null;
let stt: SpeechRecognitionProvider | null = null;

export function getTextToSpeech(config: VoiceConfig): TextToSpeechProvider {
  if (config.tts === "none") return noopTts;
  return (tts ??= new BrowserTextToSpeech());
}

export function getSpeechRecognition(config: VoiceConfig): SpeechRecognitionProvider {
  if (config.stt === "none") return noopStt;
  return (stt ??= new BrowserSpeechRecognition());
}
