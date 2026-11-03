/**
 * String/enum lists are stored as JSON arrays (the schema has no scalar lists).
 * Reads a JSON column back as a typed string list (anything else → []).
 */
export function jsonList<T extends string = string>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter((v): v is T => typeof v === "string") : [];
}
