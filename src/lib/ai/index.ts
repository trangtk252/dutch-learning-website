import "server-only";
import { env } from "../env";
import { AnthropicProvider } from "./providers/anthropic";
import { MockProvider } from "./providers/mock";
import type { LanguageModelProvider } from "./types";

let provider: LanguageModelProvider | undefined;

/** The configured language model (AI_PROVIDER / AI_API_KEY / AI_MODEL). */
export function getLanguageModel(): LanguageModelProvider {
  if (!provider) {
    provider =
      env.AI_PROVIDER === "anthropic"
        ? new AnthropicProvider(env.AI_API_KEY!, env.AI_MODEL)
        : new MockProvider();
  }
  return provider;
}

export function isAiMock(): boolean {
  return getLanguageModel().isMock;
}

export { AIError } from "./types";
