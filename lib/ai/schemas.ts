/**
 * Zod schemas for validating AI responses
 * FIX C3: Prevent crashes from unexpected AI output shapes
 */

import { z } from "zod";

export const HealthAnalysisSchema = z.object({
  health_score: z.number().min(0).max(100),
  categories: z.record(z.string(), z.number()).default({}),
  debt_to_income_ratio: z.number().min(0).max(10).default(0),
  savings_rate: z.number().min(-1).max(1).default(0),
  recommendations: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const ScamAnalysisSchema = z.object({
  risk_score: z.number().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  verdict: z.enum(["SAFE", "CAUTION", "HIGH_RISK"]).optional(),
  red_flags: z
    .array(
      z.object({
        type: z.string(),
        detail: z.string().default(""),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      })
    )
    .default([]),
  safe_alternatives: z
    .array(
      z.object({
        name: z.string(),
        return: z.string().default(""),
        risk: z.string().default(""),
      })
    )
    .default([]),
});

export type HealthAnalysis = z.infer<typeof HealthAnalysisSchema>;
export type ScamAnalysis = z.infer<typeof ScamAnalysisSchema>;

/**
 * Extract JSON from AI response that may be wrapped in markdown code blocks,
 * contain extra text, or have other formatting issues.
 */
function extractJSON(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code blocks: ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // If still not starting with { or [, try to find JSON object in the text
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
  }

  return cleaned;
}

/**
 * Safely parse AI response with Zod validation.
 * Handles markdown-wrapped JSON, extra text, and other formatting quirks.
 */
export function parseAIResponse<T>(
  rawJson: string,
  schema: z.ZodSchema<T>,
  context: string
): T {
  const cleaned = extractJSON(rawJson);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(`[${context}] Raw AI response (failed to parse):`, rawJson.substring(0, 500));
    throw new Error(`AI response bukan JSON valid (${context})`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`[${context}] Zod validation failed:`, result.error.format());
    console.error(`[${context}] Parsed data:`, JSON.stringify(parsed).substring(0, 500));
    throw new Error(`AI response format tidak sesuai (${context})`);
  }

  return result.data;
}
