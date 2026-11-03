import "server-only";

/** Tiny in-memory limiter for login/sign-up attempts (one server process is enough for a small test). */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(key: string, max = 8, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
