"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/components/words/clickable-text";
import { useVoice } from "@/components/voice/voice-context";
import { cn } from "@/lib/cn";

export interface Segment {
  id: string;
  speaker: string | null;
  text: string;
}

/**
 * Plays a listening exercise. With a recorded `audioUrl` it uses <audio>;
 * otherwise the transcript is voiced segment by segment by the TTS provider,
 * with a different voice per speaker where the device has several Dutch voices.
 * The transcript doubles as captions: the current segment is highlighted.
 */
export function ListeningPlayer({
  segments,
  audioUrl,
  maxPlays,
  showTranscriptInitially = false,
  knownForms = [],
}: {
  segments: Segment[];
  audioUrl?: string | null;
  /** NT2-style exam limit (e.g. 2). Undefined = unlimited. */
  maxPlays?: number;
  showTranscriptInitially?: boolean;
  knownForms?: string[];
}) {
  const { tts } = useVoice();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(0.9);
  const [showTranscript, setShowTranscript] = useState(showTranscriptInitially);
  const [ttsReady, setTtsReady] = useState(true);
  const stopRef = useRef(false);
  const speakers = [...new Set(segments.map((s) => s.speaker ?? ""))];

  useEffect(() => setTtsReady(Boolean(audioUrl) || tts.available), [audioUrl, tts]);
  useEffect(() => () => tts.stop(), [tts]);

  const playFrom = useCallback(
    (index: number, single = false) => {
      if (index >= segments.length) {
        setPlaying(false);
        setCurrent(null);
        return;
      }
      const seg = segments[index];
      setCurrent(index);
      tts.speak(seg.text, {
        rate,
        voiceIndex: speakers.indexOf(seg.speaker ?? ""),
        onEnd: () => {
          if (stopRef.current || single) {
            setPlaying(false);
            if (single) setCurrent(null);
            return;
          }
          setTimeout(() => !stopRef.current && playFrom(index + 1), 350);
        },
      });
    },
    [segments, rate, speakers, tts],
  );

  const limitReached = maxPlays !== undefined && plays >= maxPlays;

  function toggle() {
    if (playing) {
      stopRef.current = true;
      tts.stop();
      setPlaying(false);
      return;
    }
    if (limitReached) return;
    stopRef.current = false;
    setPlaying(true);
    setPlays((p) => p + 1);
    playFrom(0);
  }

  if (!ttsReady) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
        Audio playback isn&apos;t available in this browser (no Dutch text-to-speech). The transcript is shown below.
        <Transcript segments={segments} current={null} knownForms={knownForms} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={toggle} disabled={!playing && limitReached} aria-pressed={playing}>
            {playing ? <Pause aria-hidden className="size-5" /> : plays ? <RotateCcw aria-hidden className="size-5" /> : <Play aria-hidden className="size-5" />}
            {playing ? "Stop" : plays ? "Play again" : "Play"}
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted">
            Speed
            <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="rounded-lg border border-line bg-surface px-2 py-1 text-ink">
              <option value={0.75}>0.75×</option>
              <option value={0.9}>0.9×</option>
              <option value={1}>1×</option>
              <option value={1.1}>1.1×</option>
            </select>
          </label>
          {maxPlays !== undefined && (
            <span className="text-sm text-muted">Plays: {plays} / {maxPlays}</span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowTranscript((s) => !s)} aria-expanded={showTranscript} className="ml-auto">
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </Button>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">
        {audioUrl ? "Recorded audio." : "Voiced by your device's Dutch text-to-speech. Voices vary by browser and device."}
      </p>
      {(showTranscript || audioUrl) && <Transcript segments={segments} current={current} knownForms={knownForms} onReplay={(i) => { stopRef.current = true; playFrom(i, true); }} />}
    </div>
  );
}

function Transcript({
  segments,
  current,
  knownForms,
  onReplay,
}: {
  segments: Segment[];
  current: number | null;
  knownForms: string[];
  onReplay?: (i: number) => void;
}) {
  return (
    <ol className="mt-4 space-y-2 border-t border-line pt-4" aria-label="Transcript">
      {segments.map((s, i) => (
        <li key={s.id} className={cn("flex gap-2 rounded-xl px-2 py-1.5 transition-colors", current === i && "bg-primary-soft")} aria-current={current === i ? "true" : undefined}>
          {onReplay && (
            <button type="button" onClick={() => onReplay(i)} className="mt-0.5 shrink-0 rounded p-1 text-primary hover:bg-primary-soft" aria-label={`Replay line ${i + 1}`}>
              <Play aria-hidden className="size-3.5" />
            </button>
          )}
          <div>
            {s.speaker && <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">{s.speaker}:</span>}
            <ClickableText as="span" text={s.text} context="LISTENING" knownForms={knownForms} />
          </div>
        </li>
      ))}
    </ol>
  );
}
