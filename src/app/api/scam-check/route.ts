import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import { SCAM_DETECTION_PROMPT, buildScamPrompt } from "@/lib/ai/prompts";
import { checkQuota, incrementUsage } from "@/lib/rate-limit";
import { checkAndAwardBadges } from "@/lib/gamification";
import { sanitizeScamInput } from "@/lib/sanitize";
import { parseAIResponse, ScamAnalysisSchema } from "@/lib/ai/schemas";
import type { ApiResponse, ApiError, ScamCheckResult } from "@/types/api";

const VALID_INPUT_TYPES = ["text", "url", "screenshot"] as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_REQUIRED",
            message: "Login terlebih dahulu.",
          },
        } satisfies ApiError,
        { status: 401 }
      );
    }

    // 2. Quota check
    const quota = await checkQuota(user.id, "scam_check");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Batas 5 cek scam gratis/bulan tercapai. Upgrade ke Premium?",
            details: { current: quota.used, limit: quota.limit },
          },
        } satisfies ApiError,
        { status: 429 }
      );
    }

    // 3. Parse & validate
    const body = await request.json();
    const { input_type, content, company_name } = body;

    if (!input_type || !VALID_INPUT_TYPES.includes(input_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: 'input_type harus "text", "url", atau "screenshot".',
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Konten minimal 10 karakter.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // Sanitize input
    const { sanitized: cleanContent } = sanitizeScamInput(content);

    // 4. AI Analysis
    let analysisResult;
    try {
      const aiResponse = await callAI(
        [
          { role: "system", content: SCAM_DETECTION_PROMPT },
          { role: "user", content: buildScamPrompt(cleanContent, company_name) },
        ],
        { jsonMode: true, temperature: 0.1 }
      );

      analysisResult = parseAIResponse(aiResponse.content, ScamAnalysisSchema, "scam-check");
    } catch (aiError) {
      const message = aiError instanceof AIError
        ? aiError.userMessage
        : "Layanan AI sedang tidak tersedia. Coba lagi.";
      const code = aiError instanceof AIError ? aiError.code : "AI_UNAVAILABLE";
      return NextResponse.json(
        {
          success: false,
          error: {
            code,
            message,
          },
        } satisfies ApiError,
        { status: aiError instanceof AIError ? aiError.statusCode || 503 : 503 }
      );
    }

    // 5. Store in database
    const { data: check, error: insertError } = await supabase
      .from("scam_checks")
      .insert({
        user_id: user.id,
        input_type,
        input_content: content.substring(0, 5000),
        risk_score: analysisResult.risk_score,
        confidence: analysisResult.confidence,
        red_flags: analysisResult.red_flags,
        safe_alternatives: analysisResult.safe_alternatives,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to save scam check:", insertError);
    }

    // FIX M5: Only increment usage if DB save succeeded
    if (!insertError) {
      await incrementUsage(user.id, "scam_check");
    } else {
      console.warn("[Scam] Skipping quota increment — DB save failed");
    }
    const newBadges = await checkAndAwardBadges(user.id);

    // 7. Determine verdict
    const verdict =
      analysisResult.risk_score >= 61
        ? "HIGH_RISK"
        : analysisResult.risk_score >= 31
          ? "CAUTION"
          : "SAFE";

    // 8. Return
    const result: ScamCheckResult = {
      check_id: check?.id ?? "unknown",
      risk_score: analysisResult.risk_score,
      confidence: analysisResult.confidence ?? "medium",
      verdict: analysisResult.verdict ?? verdict,
      ojk_status: {
        registered: false, // TODO: real OJK API check
        checked_at: new Date().toISOString(),
      },
      red_flags: analysisResult.red_flags ?? [],
      safe_alternatives: analysisResult.safe_alternatives ?? [],
    };

    return NextResponse.json({
      success: true,
      data: result,
      meta: { remaining_quota: quota.remaining - 1, new_badges: newBadges },
    } satisfies ApiResponse<ScamCheckResult>);
  } catch (error) {
    console.error("Scam check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal.",
        },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
