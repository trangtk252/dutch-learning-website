export type Dictionary = Record<string, string>;
export type Vars = Record<string, string | number>;
export type TFunction = (text: string, vars?: Vars) => string;

/** Replaces `{name}` placeholders. */
function fill(text: string, vars?: Vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;
}

/** Looks `text` up in `dict` (falling back to the English text itself) and fills in `{placeholders}`. */
export function makeT(dict: Dictionary | null): TFunction {
  return (text, vars) => fill(dict?.[text] ?? text, vars);
}

/**
 * Notes of the offline speaking report are stored in English with numbers filled in
 * ("... 6 words per turn across 1 turns."), so translate them by pattern at display time.
 * Anything else (e.g. a real AI's notes, already in the right language) is returned unchanged.
 */
export function translateOfflineNote(note: string, t: TFunction): string {
  let m = note.match(/^You averaged about (\d+) words per turn across (\d+) turns?\.$/);
  if (m) return t("You averaged about {words} words per turn across {turns} turns.", { words: m[1], turns: m[2] });
  m = note.match(/^(\d+) issue\(s\) found by the offline rule checker\.$/);
  if (m) return t("{n} issue(s) found by the offline rule checker.", { n: m[1] });
  return t(note);
}
