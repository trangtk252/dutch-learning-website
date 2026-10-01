import Papa from "papaparse";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { POS_LABELS } from "@/lib/constants";
import { displayLemma } from "@/lib/server/vocabulary";

/** CSV export of the learner's vocabulary (same columns as the import). */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const cards = await db.vocabularyCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { word: { include: { examples: { orderBy: { order: "asc" }, take: 1 } } } },
  });
  const csv = Papa.unparse(
    cards.map((c) => ({
      Dutch: displayLemma(c.word),
      English: c.word.english,
      "Part of Speech": POS_LABELS[c.word.partOfSpeech],
      CEFR: c.word.cefrLevel ?? "",
      Example: c.word.examples[0]?.dutch ?? "",
      Notes: c.personalNote ?? "",
      Added: c.createdAt.toISOString().slice(0, 10),
      "Next review": c.state === "NEW" ? "" : c.due.toISOString().slice(0, 10),
    })),
    { escapeFormulae: true },
  );
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dutch-vocabulary-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
