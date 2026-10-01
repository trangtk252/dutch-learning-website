import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/** GDPR-style export of everything we store about the learner, as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;
  const [user, profile, cards, reviews, conversations, writing, mistakes, attempts, sessions, daily, achievements] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } }),
    db.userProfile.findUnique({ where: { userId } }),
    db.vocabularyCard.findMany({ where: { userId }, include: { word: { select: { lemma: true, english: true, partOfSpeech: true, article: true } } } }),
    db.review.findMany({ where: { userId } }),
    db.conversation.findMany({ where: { userId }, include: { messages: { include: { corrections: true } }, feedback: true } }),
    db.writingSubmission.findMany({ where: { userId }, include: { feedback: true, corrections: true, prompt: { select: { title: true } } } }),
    db.userMistake.findMany({ where: { userId } }),
    db.attempt.findMany({ where: { userId }, include: { responses: true } }),
    db.studySession.findMany({ where: { userId } }),
    db.dailyActivity.findMany({ where: { userId } }),
    db.userAchievement.findMany({ where: { userId }, include: { achievement: { select: { code: true, title: true } } } }),
  ]);
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), user, profile, vocabulary: cards, reviews, conversations, writing, mistakes, attempts, studySessions: sessions, dailyActivity: daily, achievements },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="leer-nederlands-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
