import type { z } from "zod";
import type { LanguageModelProvider, StructuredRequest } from "../types";

/**
 * Offline provider for development and tests. Each AI service supplies a
 * deterministic `mock` implementation (dictionary lookups, simple rules), so the
 * whole app works without network access or API keys. The UI shows a banner
 * when this provider is active so nobody mistakes it for real AI feedback.
 */
export class MockProvider implements LanguageModelProvider {
  readonly name = "mock";
  readonly isMock = true;

  async generateStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    return req.schema.parse(req.mock());
  }
}
