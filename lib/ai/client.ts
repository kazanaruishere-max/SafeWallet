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

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-2.0-flash-lite";

export async function callAI(
  messages: Message[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
  }
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const model = options?.model ?? PRIMARY_MODEL;

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
      maxOutputTokens: options?.maxTokens ?? 2000,
      topP: 0.95,
    },
  };

  // Add system instruction
  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  // JSON mode
  if (options?.jsonMode) {
    (body.generationConfig as Record<string, unknown>).responseMimeType =
      "application/json";
  }

  // FIX F1: API key in header instead of URL query string
  const endpoint = `${GEMINI_URL}/${model}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);

      // Fallback to lighter model
      if (model === PRIMARY_MODEL) {
        console.warn("Primary model failed, trying fallback...");
        return callAI(messages, { ...options, model: FALLBACK_MODEL });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
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
    if (model === PRIMARY_MODEL) {
      console.warn("Primary model error, trying fallback...", error);
      return callAI(messages, { ...options, model: FALLBACK_MODEL });
    }
    throw error;
  }
}
