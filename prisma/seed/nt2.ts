/**
 * Adds ONLY the NT2 Staatsexamen-style practice material (reading, listening,
 * writing). Idempotent; does not create the demo learner or other content.
 *   npm run db:seed:nt2
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { countWords, estimateReadingMinutes } from "../../src/lib/dutch/text";
import { NT2_READINGS, NT2_LISTENING, NT2_WRITING } from "./nt2-content";
import type { SeedQuestion } from "./questions";

const db = new PrismaClient();

function questionData(q: SeedQuestion, order: number) {
  return {
    type: q.type,
    focus: q.focus ?? null,
    set: q.set ?? "PRACTICE",
    prompt: q.prompt,
    explanation: q.explanation,
    order,
    errorCategory: (q.errorCategory as Prisma.QuestionCreateInput["errorCategory"]) ?? null,
    options: { create: q.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i })) },
  };
}

async function topicId(slug: string) {
  const t = await db.topic.upsert({ where: { slug }, create: { slug, name: slug.replace(/-/g, " ") }, update: {} });
  return t.id;
}

async function main() {
  for (const r of NT2_READINGS) {
    const wordCount = countWords(r.body);
    const data = {
      title: r.title, level: r.level, genre: r.genre, topicId: await topicId(r.topic), summaryEn: r.summaryEn, body: r.body,
      wordCount, readingMinutes: estimateReadingMinutes(wordCount, r.level), isNt2: true, source: "HUMAN" as const,
    };
    const ex = await db.readingExercise.upsert({ where: { slug: r.slug }, create: { slug: r.slug, ...data }, update: data });
    await db.question.deleteMany({ where: { readingExerciseId: ex.id } });
    for (const [order, q] of r.questions.entries()) {
      await db.question.create({ data: { ...questionData(q, order), readingExerciseId: ex.id } });
    }
  }
  for (const l of NT2_LISTENING) {
    const totalWords = l.segments.reduce((n, [, t]) => n + countWords(t), 0);
    const data = {
      title: l.title, level: l.level, kind: l.kind, topicId: await topicId(l.topic), description: l.description,
      durationSec: Math.round(totalWords / 2.3), isNt2: true, source: "HUMAN" as const,
    };
    const ex = await db.listeningExercise.upsert({ where: { slug: l.slug }, create: { slug: l.slug, ...data }, update: data });
    await db.$transaction([
      db.transcriptSegment.deleteMany({ where: { exerciseId: ex.id } }),
      db.question.deleteMany({ where: { listeningExerciseId: ex.id } }),
    ]);
    await db.transcriptSegment.createMany({ data: l.segments.map(([speaker, text], order) => ({ exerciseId: ex.id, order, speaker, text })) });
    for (const [order, q] of l.questions.entries()) {
      await db.question.create({ data: { ...questionData(q, order), listeningExerciseId: ex.id } });
    }
  }
  for (const w of NT2_WRITING) {
    const { slug, ...rest } = w;
    const data = { ...rest, isNt2: true };
    await db.writingPrompt.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
  console.log(`NT2 material: ${NT2_READINGS.length} readings, ${NT2_LISTENING.length} listening, ${NT2_WRITING.length} writing tasks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
