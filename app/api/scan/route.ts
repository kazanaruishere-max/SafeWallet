import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import { HEALTH_ANALYSIS_PROMPT, buildHealthPrompt } from "@/lib/ai/prompts";
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

    // 2. Quota check (non-blocking — works even if DB tables missing)
    let quotaRemaining = 2;
    try {
      const { checkQuota } = await import("@/lib/rate-limit");
      const quota = await checkQuota(user.id, "scan");
      quotaRemaining = quota.remaining;
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              message: "Batas scan gratis/bulan tercapai. Upgrade ke Premium?",
            },
          } satisfies ApiError,
          { status: 429 }
        );
      }
    } catch (quotaErr) {
      console.warn("Quota check failed (tables may not exist), allowing scan:", quotaErr);
      // Allow scan to proceed if quota system fails
    }

    // 3. Parse request body
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const monthlyIncome = formData.get("monthly_income")
      ? Number(formData.get("monthly_income"))
      : undefined;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "File harus disertakan.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // 4. Validate file size (20MB for PDFs/Excel)
    if (image.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Ukuran file maksimum 20MB.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // 5. Get OCR text from client
    const ocrText = formData.get("ocr_text") as string | null;

    if (!ocrText || ocrText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OCR_FAILED",
            message: "Teks dari file tidak cukup. Pastikan file berisi data keuangan yang jelas.",
          },
        } satisfies ApiError,
        { status: 422 }
      );
    }

    const { sanitized: cleanOcrText } = sanitizeAIInput(ocrText, 5000);

    // 6. Get user income (non-blocking)
    let income = monthlyIncome;
    if (!income) {
      try {
        const { data: userProfile } = await supabase
          .from("users")
          .select("monthly_income")
          .eq("id", user.id)
          .single();
        income = userProfile?.monthly_income ?? undefined;
      } catch {
        // DB may not have users table — proceed without income
      }
    }

    // 7. AI Analysis — core feature
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
      console.error("AI Analysis failed:", aiError);
      const message = aiError instanceof AIError
        ? aiError.userMessage
        : "Layanan AI sedang tidak tersedia. Coba lagi dalam beberapa saat.";
      const code = aiError instanceof AIError ? aiError.code : "AI_UNAVAILABLE";
      return NextResponse.json(
        {
          success: false,
          error: { code, message },
        } satisfies ApiError,
        { status: aiError instanceof AIError ? aiError.statusCode || 503 : 503 }
      );
    }

    // 8. Store scan in database (non-blocking)
    let scanId = "local";
    try {
      const { data: scan } = await supabase
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
      scanId = scan?.id ?? "local";
    } catch (dbErr) {
      console.warn("Failed to save scan to DB:", dbErr);
      // Still return results even if DB save fails
    }

    // 9. Increment usage (non-blocking)
    try {
      const { incrementUsage } = await import("@/lib/rate-limit");
      await incrementUsage(user.id, "scan");
    } catch {
      // Usage tracking failure shouldn't block results
    }

    // 10. Badge check (non-blocking)
    let newBadges: string[] = [];
    try {
      const { checkAndAwardBadges } = await import("@/lib/gamification");
      newBadges = await checkAndAwardBadges(user.id);
    } catch {
      // Badge failure shouldn't block results
    }

    // 11. Return result
    const result: ScanResult = {
      scan_id: scanId,
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
      meta: { remaining_quota: quotaRemaining - 1, new_badges: newBadges },
    } satisfies ApiResponse<ScanResult>);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal. Silakan coba lagi.",
          details: { hint: String(error) },
        },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
