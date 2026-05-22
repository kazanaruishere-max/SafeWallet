import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { SCAM_DETECTION_PROMPT, buildScamPrompt } from "@/lib/ai/prompts";
import { routeAndExecuteAI } from "@/lib/ai/router";
import { checkQuota, incrementUsage } from "@/lib/rate-limit";
import { checkAndAwardBadges } from "@/lib/gamification";
import { sanitizeScamInput } from "@/lib/sanitize";
import { parseAIResponse, ScamAnalysisSchema } from "@/lib/ai/schemas";
import { encrypt } from "@/lib/encryption";
import { generateIntegrityHash, recordOnBlockchain } from "@/lib/blockchain";
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

    // 2. Atomic Quota Management (V2 Update)
    let quotaInfo;
    try {
      const { incrementQuotaAtomic } = await import("@/lib/rate-limit");
      quotaInfo = await incrementQuotaAtomic(user.id, "scam_check");
      if (!quotaInfo.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              message: "Batas 5 cek scam gratis/bulan tercapai. Upgrade ke Premium?",
              details: { current: quotaInfo.used, limit: quotaInfo.limit },
            },
          } satisfies ApiError,
          { status: 429 }
        );
      }
    } catch (quotaErr) {
      console.error("[ScamCheck] Quota system unavailable:", quotaErr);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUOTA_SYSTEM_UNAVAILABLE",
            message: "Sistem kuota sedang tidak tersedia. Coba lagi dalam beberapa saat.",
          },
        } satisfies ApiError,
        { status: 503 }
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

    // Fetch user profile to get birth_year for Demographics AI Routing
    const { data: profile } = await supabase
      .from("users")
      .select("birth_year")
      .eq("id", user.id)
      .single();
    
    let userAge: number | undefined;
    if (profile?.birth_year) {
      userAge = new Date().getFullYear() - profile.birth_year;
    }

    // 4. AI Analysis (Intelligent Routing + RAG + Persona)
    let analysisResult;
    try {
      // Menggunakan Router baru yang otomatis mencari data di OJK Knowledge Base dan menyesuaikan bahasa
      const aiResponse = await routeAndExecuteAI(cleanContent, company_name, userAge);
      
      analysisResult = parseAIResponse(aiResponse.content, ScamAnalysisSchema, "scam-check");
    } catch (aiError) {
      const aiFailure = aiError as {
        userMessage?: string;
        code?: string;
        statusCode?: number;
      };
      const message = aiFailure.userMessage || "Layanan AI sedang tidak tersedia. Coba lagi.";
      const code = aiFailure.code || "AI_UNAVAILABLE";
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code,
            message,
          },
        } satisfies ApiError,
        { status: aiFailure.statusCode || 503 }
      );
    }

    // 5. Store in database using ONLY original schema columns
    const adminSupabase = createAdminClient();

    let check: { id: string } | null = null;

    const { data: insertData, error: insertError } = await adminSupabase
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
      console.error("[ScamCheck DB] ❌ Insert error:", JSON.stringify(insertError));
    } else {
      check = insertData;
      console.log(`[ScamCheck DB] ✅ Saved ${check.id} for user ${user.id}`);
    }

    // FIX SC-4: Badge failure must not crash the whole request
    let newBadges: string[] = [];
    try {
      newBadges = await checkAndAwardBadges(user.id);
    } catch {
      // Badge system failure should never block results
    }

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
      meta: { remaining_quota: quotaInfo?.remaining ?? 0, new_badges: newBadges },
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
