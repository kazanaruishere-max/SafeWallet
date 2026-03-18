/**
 * AI Client — Google Gemini via Google AI Studio
 * Uses gemini-2.0-flash as primary with structured JSON output.
 * API key sent via header (not URL) for security.
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

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIError(
      "CONFIG_ERROR",
      500,
      "Konfigurasi AI belum lengkap. Hubungi admin.",
      "GEMINI_API_KEY is not set"
    );
  }

  const model = options?.model ?? PRIMARY_MODEL;
  const retryCount = options?._retryCount ?? 0;

  // Convert messages to Gemini format
  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxTokens ?? 4000,
      topP: 0.95,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (options?.jsonMode) {
    (body.generationConfig as Record<string, unknown>).responseMimeType =
      "application/json";
  }

  // FIX C3: API key in header, NOT in URL query string
  const endpoint = `${GEMINI_URL}/${model}:generateContent`;

  try {
    // FIX L2: AbortController timeout — prevent indefinite hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);

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
        case 400:
          throw new AIError(
            "BAD_REQUEST",
            400,
            "Data yang dikirim tidak dapat diproses AI. Coba file lain.",
            errorText
          );
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
            console.warn("Gemini server error, trying fallback...");
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
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    const blockReason = candidate?.finishReason;

    if (blockReason && blockReason !== "STOP") {
      console.warn(`[Gemini API] Response truncated. finishReason: ${blockReason}`);
    }

    if (!text) {
      // Check for safety blocks
      if (blockReason === "SAFETY") {
        throw new AIError(
          "SAFETY_BLOCK",
          200,
          "AI tidak bisa menganalisis konten ini karena alasan keamanan. Coba file lain."
        );
      }
      throw new AIError(
        "EMPTY_RESPONSE",
        200,
        "AI mengembalikan respons kosong. Coba lagi."
      );
    }

    return {
      content: text,
      model,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount ?? 0,
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
