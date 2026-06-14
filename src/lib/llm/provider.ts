import Groq, { APIError, AuthenticationError, RateLimitError } from "groq-sdk";

/**
 * Thin wrapper around the Groq free API (OpenAI-compatible).
 * Groq hosts open-source models (Llama, Qwen) on a free, no-credit-card tier.
 * The provider is deliberately small so it can be swapped for any
 * OpenAI-compatible endpoint (OpenRouter, a local Ollama, ...) by changing
 * the base URL / key without touching callers.
 */

export const MODELS = {
  /** Strong reasoning model — onboarding extraction, job parsing, tailoring. */
  reasoning: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  /** Fast/cheap model — lightweight structuring + health checks. */
  fast: process.env.GROQ_MODEL_FAST ?? "llama-3.1-8b-instant",
} as const;

export class LlmConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmConfigError";
  }
}

export function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new LlmConfigError(
      "GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to .env.local",
    );
  }
  return new Groq({ apiKey });
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface ChatOpts {
  system?: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

function buildMessages(opts: ChatOpts): Groq.Chat.ChatCompletionMessageParam[] {
  const msgs = opts.system
    ? [{ role: "system" as const, content: opts.system }, ...opts.messages]
    : opts.messages;
  return msgs as Groq.Chat.ChatCompletionMessageParam[];
}

/** JSON-mode completion. The caller is responsible for validating the shape. */
export async function chatJSON<T = unknown>(opts: ChatOpts): Promise<T> {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: opts.model ?? MODELS.reasoning,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens,
    response_format: { type: "json_object" },
    messages: buildMessages(opts),
  });
  const content = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

/** Map any LLM error to a user-safe { status, message }. */
export function llmErrorMessage(err: unknown): { status: number; message: string } {
  if (err instanceof LlmConfigError) return { status: 500, message: err.message };
  if (err instanceof AuthenticationError)
    return { status: 401, message: "Invalid Groq API key. Check GROQ_API_KEY in .env.local." };
  if (err instanceof RateLimitError)
    return {
      status: 429,
      message: "The free LLM tier is rate-limited right now. Wait a few seconds and try again.",
    };
  if (err instanceof APIError)
    return { status: err.status ?? 502, message: `AI service error: ${err.message}` };
  return { status: 500, message: err instanceof Error ? err.message : "Unknown AI error." };
}
