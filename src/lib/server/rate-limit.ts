import "server-only";

/**
 * Simple fixed-window rate limiter for AI-backed actions (cost & abuse control).
 * In-memory, so limits are per server instance — swap for Redis/Upstash or a
 * DB table when running several instances.
 */
const windows = new Map<string, { start: number; count: number }>();

export const AI_LIMITS = {
  conversation: { limit: 40, windowMs: 10 * 60_000 },
  writing: { limit: 10, windowMs: 10 * 60_000 },
  vocabulary: { limit: 60, windowMs: 10 * 60_000 },
  generate: { limit: 5, windowMs: 10 * 60_000 },
  analysis: { limit: 5, windowMs: 10 * 60_000 },
} as const;

export function checkRateLimit(userId: string, bucket: keyof typeof AI_LIMITS, now = Date.now()): boolean {
  const { limit, windowMs } = AI_LIMITS[bucket];
  const key = `${bucket}:${userId}`;
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  if (w.count >= limit) return false;
  w.count += 1;
  return true;
}

export const RATE_LIMIT_MESSAGE = "You're going a bit fast — please wait a few minutes and try again.";
