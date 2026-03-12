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
 * Safely parse AI response with Zod validation.
 * Returns parsed data or throws descriptive error.
 */
export function parseAIResponse<T>(
  rawJson: string,
  schema: z.ZodSchema<T>,
  context: string
): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error(`AI response bukan JSON valid (${context})`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`AI response validation failed (${context}):`, result.error.format());
    throw new Error(`AI response format tidak sesuai (${context})`);
  }

  return result.data;
}
