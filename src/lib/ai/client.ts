/**
 * AI Client — Groq OpenAI-compatible chat completions.
 * Uses llama-3.3-70b-versatile as primary with llama-3.1-8b-instant fallback.
 * API key sent via Authorization header.
 */

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AIResponse = {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
};

export class AIError extends Error {
  code: string;
  statusCode: number;
  userMessage: string;

  constructor(code: string, statusCode: number, userMessage: string, detail?: string) {
    super(detail ?? userMessage);
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

export async function callAI(
  messages: Message[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
    _retryCount?: number;
  }
): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIError(
      "CONFIG_ERROR",
      500,
      "Konfigurasi AI (Groq API Key) belum lengkap. Hubungi admin.",
      "GROQ_API_KEY is not set"
    );
  }

  const model = options?.model ?? PRIMARY_MODEL;
  const retryCount = options?._retryCount ?? 0;

  // Convert messages to OpenAI format
  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: model,
    messages: formattedMessages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4000,
    top_p: 0.95,
  };

  if (options?.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const endpoint = GROQ_URL;

  try {
    // FIX L2: AbortController timeout — prevent indefinite hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error (${response.status}):`, errorText);

      // Handle specific status codes
      switch (response.status) {
        case 429: {
          // Rate limit — retry with exponential backoff
          if (retryCount < 2) {
            const backoff = Math.pow(2, retryCount) * 1000;
            console.warn(`Rate limited, retrying in ${backoff}ms...`);
            await delay(backoff);
            return callAI(messages, { ...options, _retryCount: retryCount + 1 });
          }
          // Try fallback model if backoff retries fail
          if (model === PRIMARY_MODEL) {
            console.warn("Rate limited on primary after retries, trying fallback model...");
            return callAI(messages, { ...options, model: FALLBACK_MODEL, _retryCount: 0 });
          }
          throw new AIError(
            "QUOTA_EXCEEDED",
            429,
            "Kuota AI harian telah habis. Coba lagi besok atau upgrade ke premium.",
            errorText
          );
        }
        case 400: {
          // Parse Groq error detail for better user feedback
          let detail = "";
          try {
            const errJson = JSON.parse(errorText);
            detail = errJson.error?.message || "";
          } catch { detail = errorText.substring(0, 100); }
          
          // Handle "failed_generation" — JSON mode failed but text mode may work
          // This happens when Vision-extracted markdown text confuses JSON-constrained generation
          if (detail.includes("failed_generation") && options?.jsonMode && retryCount < 1) {
            console.warn("[AI] JSON mode failed_generation, retrying without jsonMode...");
            return callAI(messages, { 
              ...options, 
              jsonMode: false, 
              _retryCount: retryCount + 1 
            });
          }
          
          // Try fallback model for other 400 errors
          if (model === PRIMARY_MODEL && retryCount < 1) {
            console.warn("[AI] 400 error on primary, trying fallback model...");
            return callAI(messages, { ...options, model: FALLBACK_MODEL, _retryCount: retryCount + 1 });
          }
          
          throw new AIError(
            "BAD_REQUEST",
            400,
            `Data tidak dapat diproses AI. ${detail ? `Detail: ${detail.substring(0, 150)}` : "Coba file lain."}`,
            errorText
          );
        }
        case 401:
        case 403:
          throw new AIError(
            "AUTH_ERROR",
            response.status,
            "API key AI tidak valid. Hubungi admin.",
            errorText
          );
        case 500:
        case 503:
          // Server error — try fallback model
          if (model === PRIMARY_MODEL) {
            console.warn("Groq server error, trying fallback...");
            return callAI(messages, { ...options, model: FALLBACK_MODEL });
          }
          throw new AIError(
            "SERVER_ERROR",
            response.status,
            "Server AI sedang bermasalah. Coba lagi dalam beberapa menit.",
            errorText
          );
        default:
          if (model === PRIMARY_MODEL) {
            return callAI(messages, { ...options, model: FALLBACK_MODEL });
          }
          throw new AIError(
            "UNKNOWN_ERROR",
            response.status,
            "Layanan AI sedang tidak tersedia. Coba lagi nanti.",
            errorText
          );
      }
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason;

    if (finishReason && finishReason !== "stop") {
      console.warn(`[Groq API] Response truncated. finishReason: ${finishReason}`);
    }

    if (!messageContent) {
      throw new AIError(
        "EMPTY_RESPONSE",
        200,
        "AI mengembalikan respons kosong. Coba lagi."
      );
    }

    return {
      content: messageContent,
      model,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens ?? 0,
        completion_tokens: data.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error) {
    // Re-throw AIError as-is
    if (error instanceof AIError) throw error;

    // Network errors
    if (model === PRIMARY_MODEL) {
      console.warn("Network error, trying fallback...", error);
      return callAI(messages, { ...options, model: FALLBACK_MODEL });
    }
    throw new AIError(
      "NETWORK_ERROR",
      0,
      "Gagal terhubung ke server AI. Periksa koneksi internet.",
      String(error)
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
