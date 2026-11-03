"use client";

import { useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { ClickableText } from "@/components/words/clickable-text";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

export interface MediaSegment {
  id: string;
  text: string;
  startMs: number | null;
}

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

/**
 * Player + transcript for media the learner added from a link: an embedded YouTube player,
 * an <audio> element, or just a link to the original. Clicking a line jumps to that moment.
 */
export function MediaPlayer({
  youtubeId,
  audioUrl,
  sourceUrl,
  segments,
  knownForms,
}: {
  youtubeId: string | null;
  audioUrl: string | null;
  sourceUrl: string | null;
  segments: MediaSegment[];
  knownForms: string[];
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const t = useT();
  const [current, setCurrent] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  function seek(ms: number) {
    const s = ms / 1000;
    if (audioRef.current) {
      audioRef.current.currentTime = s;
      void audioRef.current.play();
    } else {
      frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [s, true] }), "https://www.youtube.com");
      frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "https://www.youtube.com");
    }
  }

  function onTimeUpdate() {
    const t = (audioRef.current?.currentTime ?? 0) * 1000;
    let idx: number | null = null;
    segments.forEach((s, i) => { if (s.startMs != null && s.startMs <= t) idx = i; });
    setCurrent(idx);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-5">
        {youtubeId ? (
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              ref={frameRef}
              title={t("Video player")}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&rel=0&hl=nl`}
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : audioUrl ? (
          <audio ref={audioRef} controls src={audioUrl} onTimeUpdate={onTimeUpdate} className="w-full">
            <track kind="captions" />
          </audio>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary-strong hover:underline">
              {t("Open original")} <ExternalLink aria-hidden className="size-3.5" /><span className="sr-only">{t("(opens in a new tab)")}</span>
            </a>
          )}
          {segments.length > 0 && (
            <button type="button" onClick={() => setShowTranscript((s) => !s)} aria-expanded={showTranscript} className="ml-auto rounded-lg px-3 py-1.5 hover:bg-surface-2">
              {showTranscript ? t("Hide transcript") : t("Show transcript")}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{t("Tip: listen first and try the quiz, then read the transcript. Tap a word in the transcript for its meaning.")}</p>
        {showTranscript && (
          <ol className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto border-t border-line pt-4" aria-label={t("Transcript")}>
            {segments.map((s, i) => (
              <li key={s.id} className={cn("flex gap-2 rounded-xl px-2 py-1.5", current === i && "bg-primary-soft")}>
                {s.startMs != null && (youtubeId || audioUrl) ? (
                  <button type="button" onClick={() => seek(s.startMs!)} className="mt-0.5 flex shrink-0 items-center gap-1 rounded px-1 text-xs tabular-nums text-primary-strong hover:bg-primary-soft" aria-label={`Play from ${fmt(s.startMs)}`}>
                    <Play aria-hidden className="size-3" />{fmt(s.startMs)}
                  </button>
                ) : null}
                <ClickableText as="span" text={s.text} context="LISTENING" knownForms={knownForms} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
