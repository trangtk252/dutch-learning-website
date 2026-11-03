import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { endOfLocalDay, localDay, zonedMidnight } from "@/lib/server/dates";
import { displayLemma, wordInclude } from "@/lib/server/vocabulary";
import { cn } from "@/lib/cn";
import { ReviewSession, type ReviewCard } from "./review-session";
import { getT, pageTitle } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("Review");

const SETS = [["all", "All"], ["own", "My own words"], ["starter", "Starter decks"]] as const;
const LEVELS = ["all", "A2", "B1"] as const;

export default async function ReviewPage({ searchParams }: PageProps<"/vocabulary/review">) {
  const params = await searchParams;
  const t = await getT();
  const set = SETS.find(([k]) => k === params.set)?.[0] ?? "all";
  const level = LEVELS.find((l) => l === params.level) ?? "all";
  // "Own words" are words without a starter-deck topic (added by hand or from texts); only starter decks have a level.
  const newWordFilter = {
    ...(set === "own" ? { topics: { none: {} } } : {}),
    ...(set === "starter" ? { topics: { some: {} } } : {}),
    ...(level !== "all" ? { cefrLevel: level } : {}),
  };
  const { user, profile } = await requireProfile();
  const now = new Date();
  const startOfToday = zonedMidnight(localDay(now, profile.timezone).toISOString().slice(0, 10), profile.timezone);

  const [due, introducedToday] = await Promise.all([
    db.vocabularyCard.findMany({
      where: { userId: user.id, suspended: false, state: { not: "NEW" }, due: { lte: endOfLocalDay(now, profile.timezone) } },
      orderBy: { due: "asc" },
      take: 200,
      include: { word: { include: wordInclude } },
    }),
    db.review.count({ where: { userId: user.id, stateBefore: "NEW", reviewedAt: { gte: startOfToday } } }),
  ]);
  const newLimit = Math.max(0, profile.newCardsPerDay - introducedToday);
  const fresh = newLimit
    ? await db.vocabularyCard.findMany({
        where: { userId: user.id, suspended: false, state: "NEW", word: newWordFilter },
        orderBy: [{ importance: "desc" }, { createdAt: "asc" }],
        take: newLimit,
        include: { word: { include: wordInclude } },
      })
    : [];

  // Interleave new cards among reviews so sessions don't end with a wall of new words.
  const queue = [...due];
  fresh.forEach((c, i) => queue.splice(Math.min(queue.length, (i + 1) * 4), 0, c));

  const cards: ReviewCard[] = queue.map((c) => ({
    id: c.id,
    front: displayLemma(c.word),
    english: c.word.english,
    partOfSpeech: c.word.partOfSpeech,
    ipa: c.word.ipa,
    extra: c.word.verb
      ? `${c.word.verb.pastSingular} – ${c.word.verb.auxiliary === "ZIJN" ? "is" : "heeft"} ${c.word.verb.pastParticiple}`
      : c.word.plural
        ? `${t("plural")}: ${c.word.plural}`
        : null,
    example: c.word.examples[0] ? { dutch: c.word.examples[0].dutch, english: c.word.examples[0].english } : null,
    note: c.personalNote,
    srs: {
      state: c.state, due: c.due.toISOString(), stability: c.stability, difficulty: c.difficulty, elapsedDays: c.elapsedDays,
      scheduledDays: c.scheduledDays, learningSteps: c.learningSteps, reps: c.reps, lapses: c.lapses,
      lastReview: c.lastReview?.toISOString() ?? null,
    },
  }));

  const href = (s: string, l: string) => `/vocabulary/review?set=${s}&level=${l}`;
  const chip = (active: boolean) =>
    cn("rounded-full border px-3 py-1 text-sm", active ? "border-primary bg-primary-soft text-primary-strong" : "border-line text-muted hover:bg-surface-2");

  return (
    <>
      <div className="mx-auto mb-4 grid max-w-2xl gap-2 rounded-2xl border border-line bg-surface p-3 text-sm" aria-label={t("Filter new cards")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 text-muted">{t("New from")}</span>
          {SETS.map(([k, label]) => (
            <Link key={k} href={href(k, level)} className={chip(set === k)}>{t(label)}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 text-muted">{t("Level")}</span>
          {LEVELS.map((l) => (
            <Link key={l} href={href(set, l)} className={chip(level === l)}>{l === "all" ? t("All") : l}</Link>
          ))}
        </div>
        {set === "own" && level !== "all" && <p className="text-xs text-muted">{t("Words you add yourself have no level, so this combination has no new cards.")}</p>}
      </div>
      <ReviewSession key={`${set}-${level}`} cards={cards} newCount={fresh.length} />
    </>
  );
}
