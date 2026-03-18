/**
 * Zod schemas for validating AI responses
 * FIX C3: Prevent crashes from unexpected AI output shapes
 */

import { z } from "zod";
import { jsonrepair } from "jsonrepair";

export const HealthAnalysisSchema = z.object({
  health_score: z.coerce.number().min(0).max(100).catch(0),
  categories: z.record(z.string(), z.coerce.number().catch(0)).default({}),
  debt_to_income_ratio: z.coerce.number().catch(0),
  savings_rate: z.coerce.number().catch(0),
  recommendations: z.array(z.string()).catch([]).default([]),
  warnings: z.array(z.string()).catch([]).default([]),
  gambling_flags: z.array(z.object({
    pattern_type: z.enum(["suspicious_ewallet_topup", "suspicious_night_transfer", "va_deposit"]).catch("suspicious_ewallet_topup"),
    amount: z.coerce.number().catch(0),
    description: z.string().default("")
  })).catch([]).default([]),
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
  // First try to extract the main JSON block if there's text surrounding it
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    } else if (jsonStart !== -1) {
      // Missing closing brace - will try to repair below
      cleaned = cleaned.substring(jsonStart);
    }
  }

  return cleaned;
}

/**
 * Attempts to repair slightly cut-off JSON (e.g. missing closing braces)
 */
function repairJSON(jsonString: string): string {
  try {
    return jsonrepair(jsonString.trim());
  } catch (err) {
    console.warn("jsonrepair failed, returning original string", err);
    return jsonString; // Fallback to raw if even jsonrepair fails
  }
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
  let cleaned = extractJSON(rawJson);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e1) {
    console.warn(`[${context}] JSON parse failed, attempting repair...`);
    try {
      cleaned = repairJSON(cleaned);
      parsed = JSON.parse(cleaned);
    } catch {
      console.error(`[${context}] Raw AI response (failed to parse):`, rawJson.substring(0, 500));
      throw new Error(`AI response bukan JSON valid (${context})`);
    }
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`[${context}] Zod validation failed:`, result.error.format());
    console.error(`[${context}] Parsed data:`, JSON.stringify(parsed).substring(0, 500));
    throw new Error(`AI response format tidak sesuai (${context})`);
  }

  return result.data;
}
