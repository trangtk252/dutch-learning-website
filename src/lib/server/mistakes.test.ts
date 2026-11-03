import { describe, expect, it } from "vitest";
import { masteryFor } from "./mistakes";

describe("masteryFor", () => {
  it("flags frequent recent mistakes", () => expect(masteryFor(3, 3, null)).toBe("needs-practice"));
  it("flags a recent mistake with weak practice", () => expect(masteryFor(1, 1, 0.4)).toBe("needs-practice"));
  it("treats a single recent mistake as improving", () => expect(masteryFor(1, 1, null)).toBe("improving"));
  it("is good when old mistakes were practised", () => expect(masteryFor(0, 6, 0.9)).toBe("good"));
  it("stays improving with many old mistakes and no practice", () => expect(masteryFor(0, 6, null)).toBe("improving"));
});
