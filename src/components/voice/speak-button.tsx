"use client";

import { Volume2 } from "lucide-react";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/cn";
import { useVoice } from "./voice-context";

/** Plays Dutch pronunciation with the configured TTS provider. */
export function SpeakButton({
  text,
  label,
  className,
  rate,
}: {
  text: string;
  label?: string;
  className?: string;
  rate?: number;
}) {
  const { tts } = useVoice();
  const isClient = useIsClient();
  if (!isClient || !tts.available) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        tts.speak(text, { rate });
      }}
      className={cn("inline-grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary-soft", className)}
      aria-label={label ?? `Listen: ${text}`}
      title="Listen"
    >
      <Volume2 aria-hidden className="size-4" />
    </button>
  );
}
