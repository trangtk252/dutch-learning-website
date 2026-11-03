import type { z } from "zod";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type Effort = "low" | "medium" | "high";

export interface StructuredRequest<S extends z.ZodType> {
  /** Stable system prompt (cache-friendly: no timestamps or per-user ids). */
  system: string;
  messages: ChatTurn[];
  schema: S;
  /** Short identifier used in logs and by the mock provider. */
  task: string;
  effort?: Effort;
  maxTokens?: number;
  /**
   * Deterministic offline result. Used by the mock provider so that the app is
   * fully usable in development without an API key.
   */
  mock: () => z.infer<S>;
}

/**
 * A language model that returns schema-validated structured output.
 * Implementations: AnthropicProvider (Claude), MockProvider (offline).
 */
export interface LanguageModelProvider {
  readonly name: string;
  readonly isMock: boolean;
  generateStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>>;
}

export class AIError extends Error {
  constructor(
    message: string,
    readonly code: "refused" | "invalid_output" | "unavailable" | "rate_limited",
  ) {
    super(message);
    this.name = "AIError";
  }
}
