/** Learner-local calendar dates, stored as UTC-midnight `Date`s (Postgres DATE). */

export function localDateKey(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function localDay(date: Date, timeZone: string): Date {
  return new Date(`${localDateKey(date, timeZone)}T00:00:00.000Z`);
}

export function addDays(day: Date, n: number): Date {
  return new Date(day.getTime() + n * 86_400_000);
}

/** The instant of local midnight (in `timeZone`) at the start of the given YYYY-MM-DD. */
export function zonedMidnight(dateKey: string, timeZone: string): Date {
  const guess = new Date(`${dateKey}T00:00:00.000Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
      .formatToParts(guess)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return new Date(guess.getTime() - (asUtc - guess.getTime()));
}

/** End of the learner's local "today" — cards due before this count as due today. */
export function endOfLocalDay(now: Date, timeZone: string): Date {
  const tomorrow = addDays(localDay(now, timeZone), 1).toISOString().slice(0, 10);
  return zonedMidnight(tomorrow, timeZone);
}

/** Consecutive active days ending today (or yesterday, so a streak isn't lost before you study). */
export function computeStreak(activeDays: Date[], today: Date): number {
  const set = new Set(activeDays.map((d) => d.toISOString().slice(0, 10)));
  let cursor = set.has(today.toISOString().slice(0, 10)) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function relativeDays(date: Date, now = new Date()): string {
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}
