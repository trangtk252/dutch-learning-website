/**
 * Adds ONLY the NT2 starter word lists (A2, B1) to the shared dictionary, each
 * tagged with a topic (nt2-a2 / nt2-b1) so they can be added as flashcard decks.
 * Idempotent: words already in the dictionary are kept as they are and just
 * tagged. Creates no cards and no demo user.
 *   npm run db:seed:words
 */
import { PrismaClient } from "@prisma/client";
import { normalizeWord } from "../../src/lib/dutch/text";
import { POS_MAP, STARTER_DECKS } from "./nt2-words";

const db = new PrismaClient();

async function main() {
  for (const deck of STARTER_DECKS) {
    const topic = await db.topic.upsert({
      where: { slug: deck.slug },
      create: { slug: deck.slug, name: deck.name },
      update: { name: deck.name },
    });
    let created = 0;
    for (const [pos, rawLemma, english, nl, en] of deck.words) {
      const partOfSpeech = POS_MAP[pos];
      const normalized = normalizeWord(rawLemma);
      let word = await db.vocabularyWord.findUnique({ where: { normalized_partOfSpeech: { normalized, partOfSpeech } } });
      if (!word) {
        word = await db.vocabularyWord.create({
          data: {
            normalized,
            partOfSpeech,
            lemma: rawLemma.replace(/^(de|het)\s+/i, ""),
            article: partOfSpeech === "NOUN" ? (/^het\s/i.test(rawLemma) ? "HET" : "DE") : null,
            english,
            cefrLevel: deck.level,
            source: "HUMAN",
            examples: { create: [{ dutch: nl, english: en, order: 0 }] },
          },
        });
        created++;
      }
      await db.wordTopic.upsert({
        where: { wordId_topicId: { wordId: word.id, topicId: topic.id } },
        create: { wordId: word.id, topicId: topic.id },
        update: {},
      });
    }
    console.log(`${deck.name}: ${deck.words.length} words (${created} new)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
