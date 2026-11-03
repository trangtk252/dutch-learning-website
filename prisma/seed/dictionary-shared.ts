/** Helpers shared by the Dutch and Vietnamese dictionary builders. */

export interface GlossSense {
  glosses?: string[];
  links?: [string, string][];
}

export const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** English lookup keys for a sense: whole clauses ("to run" -> "run"), short comma parts, and Wiktionary's own links. */
export function englishTerms(s: GlossSense): { term: string; rank: number }[] {
  const out = new Map<string, number>();
  const add = (raw: string, rank: number) => {
    const t = raw
      .replace(/\([^)]*\)/g, " ")
      .replace(/^(?:to|a|an|the|one's|someone's|someone|something|somebody)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (t.length < 2 || t.length > 40 || /[<>{}]/.test(t)) return;
    if (!out.has(t) || out.get(t)! > rank) out.set(t, rank);
  };
  for (const g of s.glosses ?? []) {
    for (const clause of g.split(";")) {
      add(clause, 1);
      const parts = clause.split(",").map((p) => p.trim());
      if (parts.length > 1) parts.forEach((p, i) => { if (p.split(" ").length <= 3) add(p, i === 0 ? 1 : 2); });
    }
  }
  for (const [text] of s.links ?? []) if (!text.includes("#")) add(text, 3);
  return [...out].map(([term, rank]) => ({ term, rank }));
}
