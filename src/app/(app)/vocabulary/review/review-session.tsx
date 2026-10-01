"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { previewIntervals, reviewCard, formatInterval, type Rating, type SrsFields, type CardState } from "@/lib/srs/fsrs";
import { POS_LABELS, type Pos } from "@/lib/constants";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { SpeakButton } from "@/components/voice/speak-button";
import { useVoice } from "@/components/voice/voice-context";
import { cn } from "@/lib/cn";
import { finishReviewSessionAction, rateCardAction } from "../actions";

export interface ReviewCard {
  id: string;
  front: string;
  english: string;
  partOfSpeech: string;
  ipa: string | null;
  extra: string | null;
  example: { dutch: string; english: string } | null;
  note: string | null;
  srs: Omit<SrsFields, "due" | "lastReview" | "state"> & { state: CardState; due: string; lastReview: string | null };
}

const RATINGS: { rating: Rating; label: string; key: string; className: string }[] = [
  { rating: "AGAIN", label: "Again", key: "1", className: "bg-danger-soft text-danger hover:brightness-95" },
  { rating: "HARD", label: "Hard", key: "2", className: "bg-warning-soft text-warning hover:brightness-95" },
  { rating: "GOOD", label: "Good", key: "3", className: "bg-success-soft text-success hover:brightness-95" },
  { rating: "EASY", label: "Easy", key: "4", className: "bg-primary-soft text-primary hover:brightness-95" },
];

/** Re-show a card in this session if it's due again within this window. */
const REQUEUE_MS = 20 * 60_000;

function toSrs(c: ReviewCard["srs"]): SrsFields {
  return { ...c, due: new Date(c.due), lastReview: c.lastReview ? new Date(c.lastReview) : null };
}

export function ReviewSession({ cards, newCount }: { cards: ReviewCard[]; newCount: number }) {
  const { tts } = useVoice();
  const [queue, setQueue] = useState(cards);
  const [revealed, setRevealed] = useState(false);
  const [direction, setDirection] = useState<"nl-en" | "en-nl">("nl-en");
  const [done, setDone] = useState(0);
  const [again, setAgain] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const finished = useRef(false);

  const card = queue[0];
  const intervals = useMemo(() => (card ? previewIntervals(toSrs(card.srs)) : null), [card]);

  const finish = useCallback((reviews: number) => {
    if (finished.current || reviews === 0) return;
    finished.current = true;
    void finishReviewSessionAction(reviews, (Date.now() - startedAt.current) / 1000);
  }, []);

  useEffect(() => {
    shownAt.current = Date.now();
    if (!startedAt.current) startedAt.current = Date.now();
  }, [card?.id, card?.srs.reps]);

  useEffect(() => {
    if (!card) finish(done);
  }, [card, done, finish]);

  const rate = useCallback(
    async (rating: Rating) => {
      if (!card) return;
      const duration = Date.now() - shownAt.current;
      const next = reviewCard(toSrs(card.srs), rating);
      setRevealed(false);
      setDone((d) => d + 1);
      if (rating === "AGAIN") setAgain((n) => n + 1);
      setQueue((q) => {
        const rest = q.slice(1);
        if (next.due.getTime() - Date.now() < REQUEUE_MS) {
          const updated: ReviewCard = {
            ...card,
            srs: { ...next, due: next.due.toISOString(), lastReview: next.lastReview?.toISOString() ?? null },
          };
          // Put it a few cards back (or at the end) so it isn't immediately repeated.
          rest.splice(Math.min(rest.length, 3), 0, updated);
        }
        return rest;
      });
      const res = await rateCardAction(card.id, rating, duration);
      if (!res.ok) setError("Couldn't save that review. Check your connection.");
    },
    [card],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card || (e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const r = RATINGS.find((x) => x.key === e.key);
        if (r) {
          e.preventDefault();
          void rate(r.rating);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, rate]);

  // Speak the Dutch side automatically when it's shown.
  useEffect(() => {
    if (!card) return;
    if ((direction === "nl-en" && !revealed) || (direction === "en-nl" && revealed)) tts.speak(card.front);
  }, [card, revealed, direction, tts]);

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-semibold">All caught up 🎉</h1>
        <p className="mt-2 text-muted">No cards are due right now. Add new words, or read a text and save words you don&apos;t know.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/vocabulary">Add words</ButtonLink>
          <ButtonLink href="/reading" variant="secondary">Read something</ButtonLink>
        </div>
      </div>
    );
  }

  if (!card) {
    const accuracy = done ? Math.round(((done - again) / done) * 100) : 0;
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-semibold">Goed gedaan!</h1>
        <p className="mt-2 text-muted">
          You completed {done} review{done === 1 ? "" : "s"} · {accuracy}% remembered on the first try.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/dashboard">Back to today</ButtonLink>
          <ButtonLink href="/vocabulary?status=failed" variant="secondary">See difficult words</ButtonLink>
        </div>
      </div>
    );
  }

  const total = done + queue.length;
  const isNew = card.srs.state === "NEW";
  const prompt = direction === "nl-en" ? card.front : card.english;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/vocabulary" className="text-sm text-primary hover:underline">← Exit</Link>
        <div className="flex rounded-xl border border-line p-0.5 text-xs" role="group" aria-label="Card direction">
          {(["nl-en", "en-nl"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={direction === d}
              onClick={() => setDirection(d)}
              className={cn("rounded-lg px-2.5 py-1", direction === d ? "bg-primary text-primary-ink" : "text-muted")}
            >
              {d === "nl-en" ? "Dutch → English" : "English → Dutch"}
            </button>
          ))}
        </div>
      </div>
      <ProgressBar value={done} max={total} label="Session progress" />
      <p className="mt-1 text-right text-xs text-muted">
        {done} / {total}{newCount ? ` · ${newCount} new today` : ""}
      </p>

      <section aria-live="polite" className="mt-6 rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
        <p className="text-xs uppercase tracking-wide text-muted">
          {isNew ? "New word" : POS_LABELS[card.partOfSpeech as Pos]}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <p className="text-3xl font-semibold" lang={direction === "nl-en" ? "nl" : "en"}>{prompt}</p>
          {direction === "nl-en" && <SpeakButton text={card.front} />}
        </div>

        {revealed ? (
          <div className="mt-6 space-y-3 border-t border-line pt-6">
            {direction === "nl-en" ? (
              <p className="text-xl">{card.english}</p>
            ) : (
              <p className="flex items-center justify-center gap-2 text-2xl font-semibold" lang="nl">
                {card.front} <SpeakButton text={card.front} />
              </p>
            )}
            {card.ipa && <p className="text-sm text-muted" lang="nl">/{card.ipa}/</p>}
            {card.extra && <p className="text-sm text-muted" lang="nl">{card.extra}</p>}
            {card.example && (
              <div className="rounded-xl bg-surface-2 p-3 text-left text-sm">
                <p lang="nl">{card.example.dutch}</p>
                {card.example.english && <p className="text-muted">{card.example.english}</p>}
              </div>
            )}
            {card.note && <p className="text-sm italic text-muted">Note: {card.note}</p>}
          </div>
        ) : (
          <Button className="mt-8" size="lg" onClick={() => setRevealed(true)}>
            Show answer <kbd className="ml-1 hidden rounded bg-white/20 px-1 text-xs sm:inline">space</kbd>
          </Button>
        )}
      </section>

      {revealed && intervals && (
        <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label="How well did you remember?">
          {RATINGS.map((r) => (
            <button
              key={r.rating}
              type="button"
              onClick={() => void rate(r.rating)}
              className={cn("rounded-2xl px-2 py-3 text-sm font-medium transition", r.className)}
            >
              {r.label}
              <span className="block text-xs font-normal opacity-80">{formatInterval(new Date(), intervals[r.rating])}</span>
              <span className="sr-only"> (key {r.key})</span>
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-center text-sm text-danger">{error}</p>}
      <p className="mt-4 hidden text-center text-xs text-muted sm:block">Keyboard: space to reveal · 1–4 to rate</p>
    </div>
  );
}
