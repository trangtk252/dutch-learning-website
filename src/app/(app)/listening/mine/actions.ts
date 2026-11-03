"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AIError } from "@/lib/ai";
import { generateMediaStudyPack } from "@/lib/ai/services/content";
import { cuesFromPlainText, groupCues, slugify } from "@/lib/dutch/text";
import { ImportError, importFromUrl, parseSubtitles, parseMediaUrl, type Cue } from "@/lib/server/media-import";
import { validQuestion } from "@/lib/server/questions";
import { findWordByForm } from "@/lib/server/vocabulary";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/server/rate-limit";

type State = { error?: string } | null;

const AddInput = z.object({
  mediaType: z.enum(["PODCAST", "VIDEO", "FILM_TV"]),
  url: z.string().trim().min(1, "Paste a link."),
  title: z.string().trim().max(160).optional(),
  transcript: z.string().trim().max(400_000).optional(),
});

/** Pasted text may be SRT/WebVTT subtitles or plain text. */
function cuesFromPasted(text: string): Cue[] {
  return text.includes("-->") ? parseSubtitles(text) : cuesFromPlainText(text);
}

/**
 * Replaces an item's transcript and (re)builds its summary, quiz and key words.
 * The transcript is saved even when the AI step fails, so the learner can retry.
 */
async function saveTranscriptAndStudyPack(opts: { id: string; title: string; fallbackLevel: string; cues: Cue[] }) {
  const segments = groupCues(opts.cues);
  const transcript = segments.map((s) => s.text).join("\n");
  let pack: Awaited<ReturnType<typeof generateMediaStudyPack>> | null = null;
  let aiError: string | null = null;
  if (segments.length > 0) {
    try {
      pack = await generateMediaStudyPack({ transcript, title: opts.title, fallbackLevel: opts.fallbackLevel });
    } catch (e) {
      aiError = e instanceof AIError ? e.message : "Could not create the summary and quiz.";
      if (!(e instanceof AIError)) console.error(e);
    }
  }
  const keyWords = pack ? (await Promise.all(pack.keyWords.slice(0, 10).map((w) => findWordByForm(w)))).filter(Boolean) : [];
  const lastEnd = [...segments].reverse().find((s) => s.endMs ?? s.startMs)?.endMs;
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  await db.$transaction([
    db.transcriptSegment.deleteMany({ where: { exerciseId: opts.id } }),
    db.question.deleteMany({ where: { listeningExerciseId: opts.id } }),
    db.listeningWord.deleteMany({ where: { exerciseId: opts.id } }),
    db.listeningExercise.update({
      where: { id: opts.id },
      data: {
        needsTranscript: segments.length === 0,
        summary: pack?.summaryEn || null,
        ...(pack ? { level: pack.level } : {}),
        ...(segments.length > 0 ? { description: aiError } : {}),
        ...(segments.length > 0 ? { durationSec: lastEnd ? Math.round(lastEnd / 1000) : Math.round(wordCount / 2.4) } : {}),
        segments: { create: segments.map((s, order) => ({ order, text: s.text, startMs: s.startMs, endMs: s.endMs })) },
        questions: {
          create: (pack?.questions ?? []).filter(validQuestion).map((q, i) => ({
            type: q.type,
            focus: q.focus,
            prompt: q.prompt,
            explanation: q.explanation,
            order: i,
            options: { create: q.options.map((o, j) => ({ text: o.text, isCorrect: o.isCorrect, order: j })) },
          })),
        },
        words: { create: [...new Set(keyWords.map((w) => w!.id))].map((wordId) => ({ wordId })) },
      },
    }),
  ]);
}

export async function addMediaAction(_prev: State, formData: FormData): Promise<State> {
  const user = await requireUser();
  const parsed = AddInput.safeParse({
    mediaType: formData.get("mediaType"),
    url: formData.get("url"),
    title: formData.get("title") || undefined,
    transcript: formData.get("transcript") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { mediaType, url, title, transcript } = parsed.data;
  if (!checkRateLimit(user.id, "generate")) return { error: RATE_LIMIT_MESSAGE };

  let slug: string;
  try {
    const link = parseMediaUrl(url).toString();
    const existing = await db.listeningExercise.findFirst({ where: { ownerId: user.id, sourceUrl: link }, select: { slug: true } });
    if (existing) redirect(`/listening/${existing.slug}`);

    const pasted = transcript ? cuesFromPasted(transcript) : [];
    if (transcript && pasted.length === 0) return { error: "Couldn't find any text in that transcript." };
    const imported = await importFromUrl(link, { transcribe: pasted.length === 0 });
    const cues = pasted.length > 0 ? pasted : imported.cues;
    const profile = await db.userProfile.findUnique({ where: { userId: user.id }, select: { currentLevel: true } });
    const finalTitle = title || imported.title || new URL(link).hostname.replace(/^www\./, "");

    slug = `${slugify(finalTitle) || "media"}-${Date.now().toString(36)}`;
    const created = await db.listeningExercise.create({
      data: {
        slug,
        title: finalTitle,
        level: profile?.currentLevel ?? "B1",
        kind: "MONOLOGUE",
        durationSec: imported.durationSec ?? 0,
        description: cues.length === 0 ? (imported.note ?? null) : null,
        audioUrl: imported.audioUrl ?? null,
        source: "IMPORTED",
        ownerId: user.id,
        mediaType,
        sourceUrl: link,
        youtubeId: imported.youtubeId ?? null,
        needsTranscript: cues.length === 0,
      },
    });
    if (cues.length > 0) {
      await saveTranscriptAndStudyPack({ id: created.id, title: finalTitle, fallbackLevel: created.level, cues });
    }
  } catch (e) {
    if (e instanceof ImportError) return { error: e.message };
    // redirect() throws a control-flow error that must propagate.
    if (e && typeof e === "object" && "digest" in e) throw e;
    console.error(e);
    return { error: "Could not add that link right now." };
  }
  revalidatePath("/listening/mine");
  redirect(`/listening/${slug}`);
}

async function ownedItem(id: string) {
  const user = await requireUser();
  const item = await db.listeningExercise.findFirst({ where: { id, ownerId: user.id } });
  if (!item) throw new Error("Not found");
  return { user, item };
}

/** For items without an automatic transcript: the learner pastes one (or subtitles). */
export async function addTranscriptAction(id: string, _prev: State, formData: FormData): Promise<State> {
  const { user, item } = await ownedItem(id);
  if (!checkRateLimit(user.id, "generate")) return { error: RATE_LIMIT_MESSAGE };
  const text = String(formData.get("transcript") ?? "").trim().slice(0, 400_000);
  const cues = text ? cuesFromPasted(text) : [];
  if (cues.length === 0) return { error: "Paste the transcript or subtitles first." };
  await saveTranscriptAndStudyPack({ id, title: item.title, fallbackLevel: item.level, cues });
  revalidatePath(`/listening/${item.slug}`);
  return null;
}

/** Re-runs the summary and quiz from the saved transcript (e.g. after an AI error). */
export async function retryStudyPackAction(id: string): Promise<void> {
  const { user, item } = await ownedItem(id);
  if (!checkRateLimit(user.id, "generate")) return;
  const segs = await db.transcriptSegment.findMany({ where: { exerciseId: id }, orderBy: { order: "asc" } });
  await saveTranscriptAndStudyPack({ id, title: item.title, fallbackLevel: item.level, cues: segs.map((s) => ({ text: s.text, startMs: s.startMs, endMs: s.endMs })) });
  revalidatePath(`/listening/${item.slug}`);
}

export async function deleteMediaAction(id: string): Promise<void> {
  const { item } = await ownedItem(id);
  await db.listeningExercise.delete({ where: { id: item.id } });
  revalidatePath("/listening/mine");
  redirect("/listening/mine");
}

/** The learner's own summary (used when no AI is connected, or to correct one). */
export async function saveSummaryAction(id: string, _prev: State, formData: FormData): Promise<State> {
  const { item } = await ownedItem(id);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 4000);
  await db.listeningExercise.update({ where: { id }, data: { summary: summary || null } });
  revalidatePath(`/listening/${item.slug}`);
  return null;
}
