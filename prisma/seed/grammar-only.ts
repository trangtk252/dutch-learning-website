/**
 * Adds ONLY the grammar library (topics, examples, common mistakes, practice and
 * quiz questions). Idempotent; does not create the demo learner or other content.
 * Your own notes (GrammarNote) are never touched.
 *   npm run db:seed:grammar
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { GRAMMAR } from "./grammar";
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

async function main() {
  for (const [i, g] of GRAMMAR.entries()) {
    const data = {
      title: g.title,
      area: g.area as Prisma.GrammarTopicCreateInput["area"],
      level: g.level,
      summary: g.summary,
      explanation: g.explanation,
      order: i,
      remedies: g.remedies as Prisma.GrammarTopicCreateInput["remedies"],
      source: "HUMAN" as const,
    };
    const topic = await db.grammarTopic.upsert({ where: { slug: g.slug }, create: { slug: g.slug, ...data }, update: data });
    await db.$transaction([
      db.grammarExample.deleteMany({ where: { topicId: topic.id } }),
      db.grammarCommonMistake.deleteMany({ where: { topicId: topic.id } }),
      db.question.deleteMany({ where: { grammarTopicId: topic.id } }),
    ]);
    await db.grammarExample.createMany({
      data: g.examples.map(([dutch, english, note], order) => ({ topicId: topic.id, dutch, english, note: note ?? null, order })),
    });
    await db.grammarCommonMistake.createMany({
      data: g.mistakes.map(([wrong, correct, explanation]) => ({ topicId: topic.id, wrong, correct, explanation })),
    });
    for (const [order, q] of [...g.practice, ...g.quiz].entries()) {
      await db.question.create({ data: { ...questionData(q, order), grammarTopicId: topic.id } });
    }
  }
  console.log(`Grammar library: ${GRAMMAR.length} topics`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
