"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const NoteSchema = z.object({ topicId: z.string().max(40), body: z.string().max(10000) });

/** Saves (or clears, when empty) the learner's own note on a grammar topic. */
export async function saveGrammarNoteAction(input: z.input<typeof NoteSchema>) {
  const user = await requireUser();
  const { topicId, body } = NoteSchema.parse(input);
  const topic = await db.grammarTopic.findUnique({ where: { id: topicId }, select: { slug: true } });
  if (!topic) return { ok: false as const };
  const key = { userId_topicId: { userId: user.id, topicId } };
  if (body.trim()) {
    await db.grammarNote.upsert({ where: key, create: { userId: user.id, topicId, body }, update: { body } });
  } else {
    await db.grammarNote.deleteMany({ where: { userId: user.id, topicId } });
  }
  revalidatePath("/grammar");
  revalidatePath(`/grammar/${topic.slug}`);
  return { ok: true as const };
}

const MyTopicSchema = z.object({
  id: z.string().max(40).optional(),
  title: z.string().trim().min(1).max(120),
  level: z.enum(["A2", "B1", "B2", "C1"]),
  summary: z.string().trim().max(300),
  explanation: z.string().trim().min(1).max(20000),
  /** One example per line: "Dutch sentence = English translation". */
  examples: z.string().max(5000),
});

function parseExamples(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((line, order) => {
      const [dutch, ...rest] = line.split("=");
      return { dutch: dutch.trim(), english: rest.join("=").trim(), order };
    })
    .filter((e) => e.dutch);
}

/** Creates or updates a grammar topic the learner wrote themselves. */
export async function saveMyGrammarTopicAction(input: z.input<typeof MyTopicSchema>) {
  const user = await requireUser();
  const parsed = MyTopicSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Please add a title and an explanation." };
  const { id, title, level, summary, explanation, examples } = parsed.data;
  const exampleRows = parseExamples(examples);
  const data = { title, level, summary: summary || title, explanation };

  let slug: string;
  if (id) {
    const existing = await db.grammarTopic.findFirst({ where: { id, ownerId: user.id }, select: { slug: true } });
    if (!existing) return { ok: false as const, error: "Topic not found." };
    slug = existing.slug;
    await db.$transaction([
      db.grammarExample.deleteMany({ where: { topicId: id } }),
      db.grammarTopic.update({ where: { id }, data: { ...data, examples: { create: exampleRows } } }),
    ]);
  } else {
    slug = `my-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await db.grammarTopic.create({
      data: { ...data, slug, area: "OTHER", ownerId: user.id, examples: { create: exampleRows } },
    });
  }
  revalidatePath("/grammar");
  revalidatePath(`/grammar/${slug}`);
  return { ok: true as const, slug };
}

export async function deleteMyGrammarTopicAction(id: string) {
  const user = await requireUser();
  await db.grammarTopic.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/grammar");
  return { ok: true as const };
}
