import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { AIError, type LanguageModelProvider, type StructuredRequest } from "../types";

/**
 * Claude via the official Anthropic SDK, using structured outputs so every
 * response is parsed and validated against a Zod schema.
 *
 * Server-side refusal fallbacks are enabled ("default" routing) so a request
 * declined by a safety classifier is retried on a suitable model in-call.
 */
export class AnthropicProvider implements LanguageModelProvider {
  readonly name = "anthropic";
  readonly isMock = false;
  private client: Anthropic;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new Anthropic({ apiKey, maxRetries: 2, timeout: 90_000 });
  }

  async generateStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    try {
      const response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: req.maxTokens ?? 8000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        output_config: { format: betaZodOutputFormat(req.schema), effort: req.effort ?? "low" },
      });

      if (response.stop_reason === "refusal") {
        throw new AIError("The AI declined this request.", "refused");
      }
      if (response.parsed_output == null) {
        throw new AIError(`AI output for ${req.task} could not be parsed`, "invalid_output");
      }
      // Validate again with the full schema (the API schema drops some constraints).
      const checked = req.schema.safeParse(response.parsed_output);
      if (!checked.success) {
        throw new AIError(`AI output for ${req.task} failed validation`, "invalid_output");
      }
      return checked.data;
    } catch (err) {
      if (err instanceof AIError) throw err;
      if (err instanceof Anthropic.RateLimitError) {
        throw new AIError("The AI service is busy. Please try again in a moment.", "rate_limited");
      }
      if (err instanceof Anthropic.APIError) {
        console.error(`[ai] ${req.task} failed: ${err.status} ${err.message}`);
        throw new AIError("The AI service is unavailable right now.", "unavailable");
      }
      throw err;
    }
  }
}
