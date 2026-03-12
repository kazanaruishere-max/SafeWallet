import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import { HEALTH_ANALYSIS_PROMPT, buildHealthPrompt } from "@/lib/ai/prompts";
import { checkQuota, incrementUsage } from "@/lib/rate-limit";
import { checkAndAwardBadges } from "@/lib/gamification";
import { sanitizeAIInput } from "@/lib/sanitize";
import { parseAIResponse, HealthAnalysisSchema } from "@/lib/ai/schemas";
import type { ApiResponse, ApiError, ScanResult } from "@/types/api";

export async function POST(request: Request) {
  const startTime = Date.now();

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
            message: "Login terlebih dahulu untuk menggunakan fitur ini.",
          },
        } satisfies ApiError,
        { status: 401 }
      );
    }

    // 2. Quota check
    const quota = await checkQuota(user.id, "scan");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Batas 3 scan gratis/bulan tercapai. Upgrade ke Premium?",
            details: {
              current: quota.used,
              limit: quota.limit,
              resets_at: getNextMonthReset(),
            },
          },
        } satisfies ApiError,
        { status: 429 }
      );
    }

    // 3. Parse request body
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const bankHint = formData.get("bank_hint") as string | null;
    const monthlyIncome = formData.get("monthly_income")
      ? Number(formData.get("monthly_income"))
      : undefined;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "File gambar mutasi bank harus disertakan.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // 4. Validate file
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Ukuran file maksimum 5MB.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // 5. Sanitize OCR text
    const ocrText = formData.get("ocr_text") as string | null;

    if (!ocrText) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OCR_FAILED",
            message: "Teks OCR diperlukan. Pastikan browser melakukan OCR terlebih dahulu.",
          },
        } satisfies ApiError,
        { status: 422 }
      );
    }

    const { sanitized: cleanOcrText } = sanitizeAIInput(ocrText, 5000);

    // 6. Get user income for analysis
    const { data: userProfile } = await supabase
      .from("users")
      .select("monthly_income")
      .eq("id", user.id)
      .single();

    const income = monthlyIncome ?? userProfile?.monthly_income ?? undefined;

    // 7. AI Analysis
    let analysisResult;
    try {
      const aiResponse = await callAI(
        [
          { role: "system", content: HEALTH_ANALYSIS_PROMPT },
          { role: "user", content: buildHealthPrompt(cleanOcrText, income) },
        ],
        { jsonMode: true, temperature: 0.2 }
      );

      analysisResult = parseAIResponse(aiResponse.content, HealthAnalysisSchema, "health-scan");
    } catch (aiError) {
      const message = aiError instanceof AIError
        ? aiError.userMessage
        : "Layanan AI sedang tidak tersedia. Coba lagi dalam beberapa saat.";
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

    // 8. Store scan in database
    const { data: scan, error: insertError } = await supabase
      .from("scans")
      .insert({
        user_id: user.id,
        image_url: "client-side-only",
        ocr_raw_text: ocrText.substring(0, 5000),
        health_score: analysisResult.health_score,
        categories: analysisResult.categories,
        recommendations: analysisResult.recommendations,
        processing_time_ms: Date.now() - startTime,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to save scan:", insertError);
    }

    // 9. Increment usage + check badges
    await incrementUsage(user.id, "scan");
    const newBadges = await checkAndAwardBadges(user.id);

    // 10. Return result
    const result: ScanResult = {
      scan_id: scan?.id ?? "unknown",
      health_score: analysisResult.health_score,
      categories: analysisResult.categories,
      debt_to_income_ratio: analysisResult.debt_to_income_ratio ?? 0,
      savings_rate: analysisResult.savings_rate ?? 0,
      recommendations: analysisResult.recommendations ?? [],
      warnings: analysisResult.warnings ?? [],
      processing_time_ms: Date.now() - startTime,
    };

    return NextResponse.json({
      success: true,
      data: result,
      meta: { remaining_quota: quota.remaining - 1, new_badges: newBadges },
    } satisfies ApiResponse<ScanResult>);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal. Silakan coba lagi.",
        },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}

function getNextMonthReset(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString();
}
