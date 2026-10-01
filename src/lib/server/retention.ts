import "server-only";
import { db } from "../db";

/** Deletes transcripts past their retention date (keeps the feedback report). */
export async function purgeExpiredTranscripts(userId: string) {
  await db.conversationMessage.deleteMany({
    where: { conversation: { userId, retainUntil: { lt: new Date() } } },
  });
}
