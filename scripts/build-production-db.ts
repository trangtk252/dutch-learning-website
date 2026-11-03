/**
 * Builds prisma/production-seed.db: a copy of the local database with every user
 * (and so all their private data) removed, keeping only the shared content
 * (words, grammar, readings, listening, writing prompts, achievements...).
 *   npm run db:build:production
 * The server copies this file onto its disk the first time it starts.
 */
import { rmSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

const source = path.join(process.cwd(), "prisma", "dev.db");
const target = path.join(process.cwd(), "prisma", "production-seed.db");

async function main() {
  rmSync(target, { force: true });
  // VACUUM INTO gives a consistent copy even while `next dev` has the file open.
  const src = new DatabaseSync(source);
  src.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  src.close();

  const db = new PrismaClient({ datasourceUrl: `file:${target}` });
  try {
    // Cascades to sessions, accounts, profiles, cards, conversations, mistakes, private grammar/listening...
    const removed = await db.user.deleteMany();
    await db.verification.deleteMany();
    console.log(`Removed ${removed.count} user(s).`);
    const counts = {
      users: await db.user.count(),
      cards: await db.vocabularyCard.count(),
      conversations: await db.conversation.count(),
      privateGrammar: await db.grammarTopic.count({ where: { ownerId: { not: null } } }),
      privateListening: await db.listeningExercise.count({ where: { ownerId: { not: null } } }),
      words: await db.vocabularyWord.count(),
      grammar: await db.grammarTopic.count(),
      readings: await db.readingExercise.count(),
      listening: await db.listeningExercise.count(),
      writingPrompts: await db.writingPrompt.count(),
    };
    console.log(counts);
    if (counts.users + counts.cards + counts.conversations + counts.privateGrammar + counts.privateListening > 0) {
      throw new Error("Personal data is still present in the seed database.");
    }
  } finally {
    await db.$disconnect();
  }
  new DatabaseSync(target).exec("VACUUM");
  console.log(`Wrote ${target}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
