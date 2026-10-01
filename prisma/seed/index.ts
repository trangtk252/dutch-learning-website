/**
 * Development seed. Idempotent: re-running updates curated content in place.
 *   npm run db:seed
 * Creates a demo learner: demo@example.com / leerdutch123
 * Uses only pure modules from src/lib (no "server-only" imports).
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { normalizeWord, countWords, estimateReadingMinutes } from "../../src/lib/dutch/text";
import { reviewCard, type SrsFields } from "../../src/lib/srs/fsrs";
import { WORDS } from "./words";
import { GRAMMAR } from "./grammar";
import { READINGS } from "./reading";
import { LISTENING } from "./listening";
import { PODCASTS, MEDIA } from "./media";
import { WRITING_PROMPTS, MOCK_EXAMS, BLOG_CATEGORIES, ACHIEVEMENTS } from "./misc";
import { POSTS } from "./blog";
import type { SeedQuestion } from "./questions";

const db = new PrismaClient();

const lemmaOf = (l: string) => normalizeWord(l);
const articleOf = (l: string) => (/^het\s/i.test(l) ? "HET" : /^de\s/i.test(l) ? "DE" : null);

async function seedTopics(slugs: string[]) {
  const map = new Map<string, string>();
  for (const slug of new Set(slugs)) {
    const t = await db.topic.upsert({
      where: { slug },
      create: { slug, name: slug.replace(/-/g, " ") },
      update: {},
    });
    map.set(slug, t.id);
  }
  return map;
}

async function seedWords() {
  const topics = await seedTopics(WORDS.flatMap((w) => w.topics));
  const ids = new Map<string, string>();
  for (const w of WORDS) {
    const normalized = lemmaOf(w.lemma);
    const lemma = w.lemma.replace(/^(de|het)\s+/i, "");
    const data = {
      lemma,
      english: w.english,
      article: w.pos === "NOUN" ? (w.article ?? articleOf(w.lemma)) : null,
      plural: w.plural ?? null,
      diminutive: w.diminutive ?? null,
      cefrLevel: w.level,
      ipa: w.ipa ?? null,
      notes: w.notes ?? null,
      source: "HUMAN" as const,
      verified: true,
    };
    const word = await db.vocabularyWord.upsert({
      where: { normalized_partOfSpeech: { normalized, partOfSpeech: w.pos } },
      create: { normalized, partOfSpeech: w.pos, ...data },
      update: data,
    });
    ids.set(normalized, word.id);

    // Replace child rows so edits to the seed files are reflected.
    await db.$transaction([
      db.wordExample.deleteMany({ where: { wordId: word.id } }),
      db.wordCollocation.deleteMany({ where: { wordId: word.id } }),
      db.wordRelation.deleteMany({ where: { wordId: word.id } }),
      db.wordTopic.deleteMany({ where: { wordId: word.id } }),
      db.verbForms.deleteMany({ where: { wordId: word.id } }),
      db.adjectiveForms.deleteMany({ where: { wordId: word.id } }),
    ]);
    await db.wordExample.createMany({
      data: w.examples.map(([dutch, english], order) => ({ wordId: word.id, dutch, english, order })),
    });
    if (w.collocations?.length) {
      await db.wordCollocation.createMany({
        data: w.collocations.map(([phrase, english]) => ({ wordId: word.id, phrase, english })),
      });
    }
    const relations = [
      ...(w.synonyms ?? []).map((text) => ({ wordId: word.id, type: "SYNONYM" as const, text })),
      ...(w.antonyms ?? []).map((text) => ({ wordId: word.id, type: "ANTONYM" as const, text })),
    ];
    if (relations.length) await db.wordRelation.createMany({ data: relations });
    await db.wordTopic.createMany({ data: w.topics.map((t) => ({ wordId: word.id, topicId: topics.get(t)! })) });
    if (w.verb) {
      const v = w.verb;
      await db.verbForms.create({
        data: {
          wordId: word.id,
          presentIk: v.present[0], presentJij: v.present[1], presentHij: v.present[2], presentWij: v.present[3],
          pastSingular: v.past[0], pastPlural: v.past[1], pastParticiple: v.participle,
          auxiliary: v.aux, separable: !!v.separable, separablePrefix: v.separable ?? null,
          irregular: !!v.irregular, reflexive: !!v.reflexive,
        },
      });
    }
    if (w.adjective) {
      await db.adjectiveForms.create({
        data: { wordId: word.id, inflected: w.adjective.inflected, comparative: w.adjective.comparative ?? null, superlative: w.adjective.superlative ?? null },
      });
    }
  }
  console.log(`  words: ${WORDS.length}`);
  return ids;
}

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

async function seedGrammar(words: Map<string, string>) {
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
      db.grammarTopicWord.deleteMany({ where: { topicId: topic.id } }),
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
    const wordIds = (g.words ?? []).map((l) => words.get(lemmaOf(l))).filter(Boolean) as string[];
    if (wordIds.length) await db.grammarTopicWord.createMany({ data: wordIds.map((wordId) => ({ topicId: topic.id, wordId })) });
  }
  console.log(`  grammar topics: ${GRAMMAR.length}`);
}

async function seedReading(words: Map<string, string>) {
  const topics = await seedTopics(READINGS.map((r) => r.topic));
  const ids = new Map<string, string>();
  for (const r of READINGS) {
    const wordCount = countWords(r.body);
    const data = {
      title: r.title,
      level: r.level,
      genre: r.genre,
      topicId: topics.get(r.topic)!,
      summaryEn: r.summaryEn,
      body: r.body,
      wordCount,
      readingMinutes: estimateReadingMinutes(wordCount, r.level),
      isNt2: !!r.isNt2,
      source: "HUMAN" as const,
    };
    const ex = await db.readingExercise.upsert({ where: { slug: r.slug }, create: { slug: r.slug, ...data }, update: data });
    ids.set(r.slug, ex.id);
    await db.question.deleteMany({ where: { readingExerciseId: ex.id } });
    await db.readingWord.deleteMany({ where: { readingId: ex.id } });
    for (const [order, q] of r.questions.entries()) {
      await db.question.create({ data: { ...questionData(q, order), readingExerciseId: ex.id } });
    }
    const wordIds = [...new Set(r.words.map((l) => words.get(lemmaOf(l))).filter(Boolean) as string[])];
    if (wordIds.length) await db.readingWord.createMany({ data: wordIds.map((wordId) => ({ readingId: ex.id, wordId })) });
  }
  console.log(`  readings: ${READINGS.length}`);
  return ids;
}

async function seedListening(words: Map<string, string>) {
  const topics = await seedTopics(LISTENING.map((l) => l.topic));
  const ids = new Map<string, string>();
  for (const l of LISTENING) {
    // ~2.3 words per second for TTS at normal rate.
    const totalWords = l.segments.reduce((n, [, t]) => n + countWords(t), 0);
    const data = {
      title: l.title,
      level: l.level,
      kind: l.kind,
      topicId: topics.get(l.topic)!,
      description: l.description,
      durationSec: Math.round(totalWords / 2.3),
      isNt2: !!l.isNt2,
      source: "HUMAN" as const,
    };
    const ex = await db.listeningExercise.upsert({ where: { slug: l.slug }, create: { slug: l.slug, ...data }, update: data });
    ids.set(l.slug, ex.id);
    await db.$transaction([
      db.transcriptSegment.deleteMany({ where: { exerciseId: ex.id } }),
      db.question.deleteMany({ where: { listeningExerciseId: ex.id } }),
      db.listeningWord.deleteMany({ where: { exerciseId: ex.id } }),
    ]);
    await db.transcriptSegment.createMany({
      data: l.segments.map(([speaker, text], order) => ({ exerciseId: ex.id, order, speaker, text })),
    });
    for (const [order, q] of l.questions.entries()) {
      await db.question.create({ data: { ...questionData(q, order), listeningExerciseId: ex.id } });
    }
    const wordIds = [...new Set(l.words.map((w) => words.get(lemmaOf(w))).filter(Boolean) as string[])];
    if (wordIds.length) await db.listeningWord.createMany({ data: wordIds.map((wordId) => ({ exerciseId: ex.id, wordId })) });
  }
  console.log(`  listening exercises: ${LISTENING.length}`);
  return ids;
}

async function seedMedia() {
  for (const p of PODCASTS) {
    const { slug, ...data } = p;
    await db.podcast.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
  for (const m of MEDIA) {
    const { slug, providers, ...data } = m;
    const media = await db.mediaRecommendation.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    await db.watchProvider.deleteMany({ where: { mediaId: media.id } });
    await db.watchProvider.createMany({ data: providers.map((p) => ({ mediaId: media.id, name: p.name, url: p.url, access: p.access ?? null })) });
  }
  console.log(`  podcasts: ${PODCASTS.length}, films/series: ${MEDIA.length}`);
}

async function seedWritingAndExams(readings: Map<string, string>, listenings: Map<string, string>) {
  for (const w of WRITING_PROMPTS) {
    const { slug, ...data } = w;
    await db.writingPrompt.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
  for (const e of MOCK_EXAMS) {
    const { slug, parts, ...data } = e;
    const exam = await db.mockExam.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    await db.mockExamPart.deleteMany({ where: { examId: exam.id } });
    for (const [order, p] of parts.entries()) {
      const part = await db.mockExamPart.create({
        data: {
          examId: exam.id,
          order,
          instructions: p.instructions,
          readingExerciseId: p.reading ? readings.get(p.reading) : null,
          listeningExerciseId: p.listening ? listenings.get(p.listening) : null,
        },
      });
      for (const [qi, q] of p.questions.entries()) {
        await db.question.create({ data: { ...questionData(q, qi), mockExamPartId: part.id } });
      }
    }
  }
  console.log(`  writing prompts: ${WRITING_PROMPTS.length}, mock exams: ${MOCK_EXAMS.length}`);
}

async function seedBlog() {
  for (const [order, [slug, name, description]] of BLOG_CATEGORIES.entries()) {
    await db.blogCategory.upsert({ where: { slug }, create: { slug, name, description, order }, update: { name, description, order } });
  }
  const now = Date.now();
  for (const [i, p] of POSTS.entries()) {
    const category = await db.blogCategory.findUniqueOrThrow({ where: { slug: p.category } });
    const data = {
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      categoryId: category.id,
      level: p.level ?? null,
      status: "PUBLISHED" as const,
      readingMinutes: p.readingMinutes,
      seoTitle: p.title,
      seoDescription: p.excerpt,
    };
    const post = await db.blogPost.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data, publishedAt: new Date(now - (i + 1) * 3 * 86_400_000) },
      update: data,
    });
    await db.blogPostTag.deleteMany({ where: { postId: post.id } });
    for (const tagSlug of p.tags) {
      const tag = await db.blogTag.upsert({ where: { slug: tagSlug }, create: { slug: tagSlug, name: tagSlug.replace(/-/g, " ") }, update: {} });
      await db.blogPostTag.create({ data: { postId: post.id, tagId: tag.id } });
    }
  }
  for (const [code, title, description] of ACHIEVEMENTS) {
    await db.achievement.upsert({ where: { code }, create: { code, title, description }, update: { title, description } });
  }
  console.log(`  blog posts: ${POSTS.length}`);
}

/** A demo learner with some history so dashboards aren't empty. */
async function seedDemoUser(words: Map<string, string>) {
  const email = "demo@example.com";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("  demo user exists (skipped)");
    return;
  }
  const userId = "demo-user";
  await db.user.create({ data: { id: userId, name: "Alex", email, emailVerified: true } });
  await db.account.create({
    data: { id: "demo-account", accountId: userId, providerId: "credential", userId, password: await hashPassword("leerdutch123") },
  });
  const examDate = new Date(Date.now() + 75 * 86_400_000);
  await db.userProfile.create({
    data: {
      userId, currentLevel: "A2", targetLevel: "B1", motivation: "I work in Utrecht and want to talk with my colleagues in Dutch.",
      preparingNt2: true, nt2Program: "PROGRAMMA_I", examDate, dailyMinutes: 30,
      preferredActivities: ["SPEAKING", "VOCABULARY", "LISTENING"], strengths: ["READING"], weaknesses: ["SPEAKING", "GRAMMAR"],
      onboardedAt: new Date(),
    },
  });

  // Cards: simulate some review history with the real scheduler.
  const deck = ["gezellig", "afspreken", "afspraak", "huisarts", "vergadering", "collega", "huur", "verhuurder", "omdat", "want", "daarom",
    "overstappen", "vertraging", "pinnen", "lekker", "begrijpen", "uitleggen", "oefenen", "slagen", "voordeel", "nadeel", "ervaring", "solliciteren", "gemeente", "invullen"];
  const now = Date.now();
  for (const [i, lemma] of deck.entries()) {
    const wordId = words.get(lemma);
    if (!wordId) continue;
    let srs: SrsFields = { state: "NEW", due: new Date(now - 20 * 86_400_000), stability: 0, difficulty: 0, elapsedDays: 0, scheduledDays: 0, learningSteps: 0, reps: 0, lapses: 0, lastReview: null };
    const createdAt = new Date(now - (20 - (i % 10)) * 86_400_000);
    const card = await db.vocabularyCard.create({ data: { userId, wordId, createdAt, context: i % 3 === 0 ? "READING" : "MANUAL", importance: (i % 3) + 1 } });
    if (i >= 18) continue; // leave a few as new
    const ratings = (["GOOD", "GOOD", i % 4 === 0 ? "AGAIN" : "GOOD", i % 5 === 0 ? "HARD" : "EASY"] as const).slice(0, 2 + (i % 3));
    let t = createdAt.getTime() + 3_600_000;
    let correct = 0;
    let incorrect = 0;
    for (const r of ratings) {
      const before = srs.state;
      srs = reviewCard(srs, r, new Date(t));
      if (r === "AGAIN") incorrect++;
      else correct++;
      await db.review.create({
        data: { cardId: card.id, userId, rating: r, stateBefore: before, stabilityAfter: srs.stability, difficultyAfter: srs.difficulty, elapsedDays: srs.elapsedDays, scheduledDays: srs.scheduledDays, dueAfter: srs.due, reviewedAt: new Date(t) },
      });
      t = Math.min(srs.due.getTime() + 3_600_000, now - 3_600_000);
    }
    await db.vocabularyCard.update({
      where: { id: card.id },
      data: { ...srs, correctCount: correct, incorrectCount: incorrect, lastFailedAt: incorrect ? new Date(t) : null },
    });
  }

  // Mistakes from earlier practice.
  const mistakes: Prisma.UserMistakeCreateManyInput[] = [
    { userId, source: "SPEAKING", category: "SUBORDINATE_CLAUSES", original: "Ik leer Nederlands omdat ik woon in Utrecht.", corrected: "Ik leer Nederlands omdat ik in Utrecht woon.", explanation: "After 'omdat' the conjugated verb goes to the end." },
    { userId, source: "WRITING", category: "SUBORDINATE_CLAUSES", original: "Ik denk dat het is een goed idee.", corrected: "Ik denk dat het een goed idee is.", explanation: "After 'dat' the verb goes to the end." },
    { userId, source: "SPEAKING", category: "SUBORDINATE_CLAUSES", original: "Als ik heb tijd, ik kom.", corrected: "Als ik tijd heb, kom ik.", explanation: "Verb to the end in the als-clause; inversion in the main clause." },
    { userId, source: "SPEAKING", category: "PERFECT_TENSE", original: "Ik ben gisteren naar Amsterdam gaan.", corrected: "Ik ben gisteren naar Amsterdam gegaan.", explanation: "Use the participle 'gegaan'." },
    { userId, source: "WRITING", category: "PERFECT_TENSE", original: "Ik heb verhuisd naar Utrecht.", corrected: "Ik ben verhuisd naar Utrecht.", explanation: "'Verhuizen' takes 'zijn'." },
    { userId, source: "QUIZ", category: "DE_HET", original: "de huis", corrected: "het huis", explanation: "'Huis' is a het-word." },
    { userId, source: "WRITING", category: "ADJECTIVE_ENDINGS", original: "een grote appartement", corrected: "een groot appartement", explanation: "Indefinite het-word → no -e." },
    { userId, source: "SPEAKING", category: "WORD_ORDER", original: "Morgen ik werk thuis.", corrected: "Morgen werk ik thuis.", explanation: "Verb second after a time expression." },
  ];
  await db.userMistake.createMany({
    data: mistakes.map((m, i) => ({ ...m, level: "A2" as const, createdAt: new Date(now - (i * 2 + 1) * 86_400_000) })),
  });

  // Recent activity for a streak.
  for (let d = 0; d < 5; d++) {
    const date = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - d - 1);
    await db.dailyActivity.create({ data: { userId, date, minutes: 15 + d * 3, xp: 30 + d * 5, reviews: 12, exercises: 1 } });
  }
  console.log("  demo user: demo@example.com / leerdutch123");
}

async function main() {
  console.log("Seeding…");
  const words = await seedWords();
  await seedGrammar(words);
  const readings = await seedReading(words);
  const listenings = await seedListening(words);
  await seedMedia();
  await seedWritingAndExams(readings, listenings);
  await seedBlog();
  await seedDemoUser(words);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
