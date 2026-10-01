import { describe, expect, it } from "vitest";
import { computeStreak, endOfLocalDay, localDay } from "./dates";

describe("dates", () => {
  it("computes the local day in a time zone", () => {
    // 23:30 UTC on 1 March is already 2 March in Amsterdam (UTC+1).
    expect(localDay(new Date("2026-03-01T23:30:00Z"), "Europe/Amsterdam").toISOString().slice(0, 10)).toBe("2026-03-02");
  });
  it("finds the end of the local day", () => {
    expect(endOfLocalDay(new Date("2026-03-01T10:00:00Z"), "Europe/Amsterdam").toISOString()).toBe("2026-03-01T23:00:00.000Z");
    expect(endOfLocalDay(new Date("2026-07-01T10:00:00Z"), "Europe/Amsterdam").toISOString()).toBe("2026-07-01T22:00:00.000Z");
  });
  it("counts streaks including yesterday", () => {
    const d = (s: string) => new Date(`${s}T00:00:00Z`);
    const today = d("2026-03-10");
    expect(computeStreak([d("2026-03-08"), d("2026-03-09"), d("2026-03-10")], today)).toBe(3);
    expect(computeStreak([d("2026-03-08"), d("2026-03-09")], today)).toBe(2);
    expect(computeStreak([d("2026-03-07")], today)).toBe(0);
  });
});
