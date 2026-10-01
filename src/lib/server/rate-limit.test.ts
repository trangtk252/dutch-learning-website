import { describe, expect, it } from "vitest";
import { AI_LIMITS, checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows up to the limit per window, then resets", () => {
    const { limit, windowMs } = AI_LIMITS.generate;
    const t = 1_000_000;
    for (let i = 0; i < limit; i++) expect(checkRateLimit("u1", "generate", t)).toBe(true);
    expect(checkRateLimit("u1", "generate", t + 1)).toBe(false);
    expect(checkRateLimit("u2", "generate", t + 1)).toBe(true);
    expect(checkRateLimit("u1", "generate", t + windowMs)).toBe(true);
  });
});
