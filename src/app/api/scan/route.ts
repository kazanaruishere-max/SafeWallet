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

    // 4. Validate file type via Magic Bytes (file-type) instead of trusting client MIME
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ];

    // Read the buffer for magic bytes inspection
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic import to handle ESM 'file-type' module safely in Next.js 
    const { fileTypeFromBuffer } = await import("file-type");
    const fileTypeResult = await fileTypeFromBuffer(buffer);

    // If it's a binary file (images, pdf, excel), fileTypeResult will correctly identify it.
    // Text formats like CSV and PLAIN don't have distinct magic bytes and will be undefined.
    let verifiedMime = image.type; 
    
    if (fileTypeResult) {
       verifiedMime = fileTypeResult.mime;
    } else {
       // If undefined, it must only be plain text or CSV. 
       // If client claimed it was an image/pdf but magic bytes are missing, REJECT IT.
       if (!image.type.startsWith("text/") && image.type !== "application/csv") {
           return NextResponse.json(
             {
               success: false,
               error: {
                 code: "VALIDATION_ERROR",
                 message: "Format file rusak atau ekstensi dipalsukan (Malicious MIME Spoofing Detected).",
               },
             } satisfies ApiError,
             { status: 400 }
           );
       }
    }

    if (!allowedMimeTypes.includes(verifiedMime)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Format file tidak didukung secara native oleh sistem keamanan kami.",
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

    // 8. Store scan in database & deduct quota atomically via Node-level flow
    let scanId: string = "fallback-" + crypto.randomUUID();
    let dbSuccess = false;

    try {
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
        
      if (insertError) throw insertError;
      
      scanId = scan.id;
      dbSuccess = true;
    } catch (dbErr) {
      console.warn("Failed to save scan to DB (Dirty State Prevented). Skipping quota deduction:", dbErr);
    }

    // 9. Increment usage ONLY if scan was successfully appended to history
    if (dbSuccess) {
      try {
        const { incrementUsage } = await import("@/lib/rate-limit");
        await incrementUsage(user.id, "scan");
      } catch (incErr) {
        console.warn("Quota increment failed after save.", incErr);
      }
    }

    // 9.5 PINJOL RESCUE: Check Debt Ratio and Lock if > 35%
    let needs_education_lock = false;
    // Note: AI returns percentage as whole number usually (e.g. 40 for 40%) or decimal. Safe interpretation: > 35 (assuming it meant 35%)
    const dtiRatio = analysisResult.debt_to_income_ratio ?? 0;
    if (dbSuccess && dtiRatio > 35) {
      if (user) { 
        try {
          await supabase.from("users").update({
            debt_ratio: dtiRatio,
            needs_education_lock: true
          }).eq("id", user.id);
          needs_education_lock = true;
        } catch (err) {
          console.warn("Failed to apply Pinjol Education Lock", err);
        }
      }
    }

    // 10. Badge check (non-blocking)
    let newBadges: string[] = [];
    try {
      const { checkAndAwardBadges } = await import("@/lib/gamification");
      newBadges = await checkAndAwardBadges(user.id);
    } catch {
      // Badge failure shouldn't block results
    }

    // 10.5 JUDOL TRACKER: Telegram Crisis Coaching Intervention (Asynchronous)
    if (analysisResult.gambling_flags && analysisResult.gambling_flags.length > 0) {
      // Fire and forget (don't await so we don't block the UI return)
      (async () => {
        try {
          const { data: userLink } = await supabase
            .from("users")
            .select("telegram_chat_id")
            .eq("id", user.id)
            .single();

          if (userLink?.telegram_chat_id) {
            const totalGambling = analysisResult.gambling_flags.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
            
            const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
            if (telegramToken && totalGambling > 0) {
              const message = `🚨 *URGENT: CRISIS COACHING* 🚨\n\nSaku perhatikan pada scan terbarumu, kamu terindikasi menghabiskan sekitar *Rp ${totalGambling.toLocaleString("id-ID")}* untuk transaksi berpola judi online (deposit berulang malam hari).\n\nCoba bayangkan, uang itu bisa sangat berarti jika ditabung untuk darurat atau masa depanmu. Yuk, setop sebelum jebol! Saku ada di sini kalau kamu butuh teman ngobrol untuk bangkit. 🙏`;
              
              await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: userLink.telegram_chat_id,
                  text: message,
                  parse_mode: "Markdown",
                }),
              });
            }
          }
        } catch (err) {
          console.error("Failed to process gambling flag intervention", err);
        }
      })();
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
    
    // Add visual indicator to frontend if gambling flags exist
    if (analysisResult.gambling_flags && analysisResult.gambling_flags.length > 0) {
      result.warnings.unshift("🔴 CRITICAL WARNING: Terdeteksi pola transaksi mencurigakan terkait aktivitas Judi Online. Mohon evaluasi pengeluaran Anda.");
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: { 
        remaining_quota: quotaRemaining - 1, 
        new_badges: newBadges,
        needs_education_lock
      },
    } satisfies ApiResponse<ScanResult>);
  } catch (error) {
    console.error("[Scan] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal. Silakan coba lagi.",
          // FIX H6: No error details sent to client — logged server-side only
        },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
