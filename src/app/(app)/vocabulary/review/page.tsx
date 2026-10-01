import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { endOfLocalDay, localDay, zonedMidnight } from "@/lib/server/dates";
import { displayLemma, wordInclude } from "@/lib/server/vocabulary";
import { ReviewSession, type ReviewCard } from "./review-session";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
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
        where: { userId: user.id, suspended: false, state: "NEW" },
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
        ? `plural: ${c.word.plural}`
        : null,
    example: c.word.examples[0] ? { dutch: c.word.examples[0].dutch, english: c.word.examples[0].english } : null,
    note: c.personalNote,
    srs: {
      state: c.state, due: c.due.toISOString(), stability: c.stability, difficulty: c.difficulty, elapsedDays: c.elapsedDays,
      scheduledDays: c.scheduledDays, learningSteps: c.learningSteps, reps: c.reps, lapses: c.lapses,
      lastReview: c.lastReview?.toISOString() ?? null,
    },
  }));

  return <ReviewSession cards={cards} newCount={fresh.length} />;
}
