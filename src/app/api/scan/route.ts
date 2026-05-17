import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import { HEALTH_ANALYSIS_PROMPT, buildHealthPrompt } from "@/lib/ai/prompts";
import { sanitizeAIInput } from "@/lib/sanitize";
import { parseAIResponse, HealthAnalysisSchema } from "@/lib/ai/schemas";
import { encrypt } from "@/lib/encryption";
import { generateIntegrityHash, recordOnBlockchain } from "@/lib/blockchain";
import { parseFileServer } from "@/lib/server/file-parser";
import type { ApiResponse, ApiError, ScanResult } from "@/types/api";

// Vercel Serverless config: extend timeout for OCR/AI processing
export const maxDuration = 60;

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

    // 2. Atomic Quota Management (V2 Update for Security & Stability)
    let quotaInfo;
    try {
      const { incrementQuotaAtomic } = await import("@/lib/rate-limit");
      quotaInfo = await incrementQuotaAtomic(user.id, "scan");
      if (!quotaInfo.allowed) {
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
      console.warn("Quota system failed, allowing scan (Fail-Open for UX):", quotaErr);
    }

    // 3. Parse request body
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const monthlyIncome = formData.get("monthly_income")
      ? Number(formData.get("monthly_income"))
      : undefined;
    const pdfPassword = formData.get("pdf_password") as string | undefined;

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

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Ukuran file maksimum 10MB.",
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

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // BUG-1 FIX: file-type is ESM-only, may crash in Turbopack serverless.
    // Wrap in try-catch so a failed magic-bytes check doesn't kill the entire request.
    let fileTypeResult: { mime: string; ext: string } | undefined;
    try {
      const { fileTypeFromBuffer } = await import("file-type");
      fileTypeResult = await fileTypeFromBuffer(buffer) ?? undefined;
    } catch (ftError) {
      console.warn("[Scan] file-type import failed, falling back to client MIME:", ftError);
      // Fallback: trust client MIME (less secure but won't crash)
    }

    let verifiedMime = image.type; 
    
    if (fileTypeResult) {
       // ZIP files can be .xlsx, CFB can be .xls
       if (fileTypeResult.mime === "application/zip" && (image.type.includes("spreadsheetml") || image.name.endsWith(".xlsx"))) {
         verifiedMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
       } else if (fileTypeResult.mime === "application/x-cfb" && (image.type.includes("ms-excel") || image.name.endsWith(".xls"))) {
         verifiedMime = "application/vnd.ms-excel";
       } else {
         verifiedMime = fileTypeResult.mime;
       }
    } else {
       // No magic bytes. Could be CSV or TXT.
       // Windows often sends CSVs as application/vnd.ms-excel, so we allow that if name ends in .csv
       const isCsvOrTxt = 
         image.type.startsWith("text/") || 
         image.type === "application/csv" || 
         (image.type === "application/vnd.ms-excel" && image.name.endsWith(".csv"));
         
       if (!isCsvOrTxt) {
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
       // Normalize CSV MIME so the next check passes
       if (image.name.endsWith(".csv")) verifiedMime = "text/csv";
       else if (image.name.endsWith(".txt")) verifiedMime = "text/plain";
    }

    if (!allowedMimeTypes.includes(verifiedMime)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Format file tidak didukung secara native oleh sistem keamanan kami. (Terdeteksi: ${verifiedMime})`,
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // 5. Server-Side Parsing (V2 Update for Security)
    let ocrText: string;
    try {
      const parsedFile = await parseFileServer(buffer, verifiedMime, image.name, pdfPassword);
      ocrText = parsedFile.text;
    } catch (parseErr) {
      const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.error("Server-side parsing failed:", errMsg);
      
      // BUG-7 FIX: Return specific error messages per failure type
      let userMessage = "Gagal memproses file. ";
      if (errMsg.includes("timeout") || errMsg.includes("Timeout")) {
        userMessage += "Server terlalu sibuk. Coba lagi dalam beberapa saat.";
      } else if (errMsg.includes("PDF") || errMsg.includes("pdf")) {
        userMessage += "File PDF rusak atau terproteksi password. Masukkan password di kolom yang tersedia.";
      } else if (errMsg.includes("terlalu besar")) {
        userMessage += "File terlalu besar. Maksimal 10MB.";
      } else if (verifiedMime.startsWith("image/")) {
        userMessage += "Gagal membaca teks dari gambar (OCR). Pastikan gambar jelas dan tidak blur.";
      } else {
        userMessage += "Format file mungkin rusak. Coba export ulang dari aplikasi sumber.";
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OCR_FAILED",
            message: userMessage,
          },
        } satisfies ApiError,
        { status: 422 }
      );
    }

    if (!ocrText || ocrText.trim().length < 30) {
      const formatHint = verifiedMime === "application/pdf"
        ? "PDF mungkin berupa scan gambar. Coba screenshot halaman transaksi dan upload sebagai gambar (JPG/PNG)."
        : "Pastikan file berisi data keuangan yang jelas (transaksi, nominal, tanggal).";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OCR_FAILED",
            message: `Teks dari file tidak cukup untuk dianalisis. ${formatHint}`,
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
    let blockchainTxId: string | undefined;
    const integrityHash: string = generateIntegrityHash(analysisResult);

    try {
      // Use admin client (service role) for DB writes to bypass RLS policies
      const adminSupabase = createAdminClient();
      
      // Non-blocking: Encrypt sensitive data before storage
      let encryptedOcrText: string | undefined;
      try {
        encryptedOcrText = encrypt(ocrText.substring(0, 5000));
      } catch (encErr) {
        console.warn("[Scan] Encryption skipped (ENCRYPTION_KEY may not be set):", encErr);
      }
      
      // Non-blocking: Record integrity proof on "Blockchain"
      try {
        const blockchainRecord = await recordOnBlockchain(user.id, integrityHash, {
          feature: "health-scan",
          score: analysisResult.health_score
        });
        blockchainTxId = blockchainRecord.tx_id;
      } catch (bcErr) {
        console.warn("[Scan] Blockchain recording skipped:", bcErr);
      }

      // Build insert payload — only include columns that have values
      // Core fields (guaranteed to exist in DB schema)
      const insertPayload: Record<string, unknown> = {
        user_id: user.id,
        image_url: "server-processed",
        ocr_raw_text: encryptedOcrText ? "[ENCRYPTED_V2]" : ocrText.substring(0, 5000),
        health_score: analysisResult.health_score,
        categories: analysisResult.categories,
        recommendations: analysisResult.recommendations,
        processing_time_ms: Date.now() - startTime,
      };

      // Optional fields — only add if they have values
      if (encryptedOcrText) insertPayload.encrypted_ocr_text = encryptedOcrText;
      if (integrityHash) insertPayload.blockchain_hash = integrityHash;
      if (blockchainTxId) insertPayload.blockchain_tx_id = blockchainTxId;

      // Try insert with all columns first
      let scan: { id: string } | null = null;
      let insertError: unknown = null;

      const result1 = await adminSupabase
        .from("scans")
        .insert(insertPayload)
        .select("id")
        .single();
      
      if (result1.error) {
        console.warn("[Scan DB] Full insert failed, trying core-only:", JSON.stringify(result1.error));
        
        // Retry with ONLY core columns (no optional columns that might not exist)
        const corePayload = {
          user_id: user.id,
          image_url: "server-processed",
          ocr_raw_text: ocrText.substring(0, 5000),
          health_score: analysisResult.health_score,
          categories: analysisResult.categories,
          recommendations: analysisResult.recommendations,
          processing_time_ms: Date.now() - startTime,
        };

        const result2 = await adminSupabase
          .from("scans")
          .insert(corePayload)
          .select("id")
          .single();

        if (result2.error) {
          console.error("[Scan DB] Core insert also failed:", JSON.stringify(result2.error));
          insertError = result2.error;
        } else {
          scan = result2.data;
        }
      } else {
        scan = result1.data;
      }
        
      if (insertError || !scan) {
        throw new Error("All insert attempts failed");
      }
      
      scanId = scan.id;
      dbSuccess = true;
      console.log(`[Scan DB] ✅ Saved scan ${scanId} for user ${user.id}`);
    } catch (dbErr) {
      console.error("[Scan DB] ❌ Failed to save scan:", dbErr);
      // Don't block the result — user still gets their analysis
    }

    // 9. Badges & Intervention (Non-blocking)
    let newBadges: string[] = [];
    try {
      const { checkAndAwardBadges } = await import("@/lib/gamification");
      newBadges = await checkAndAwardBadges(user.id);
    } catch {
      // Badge failure shouldn't block results
    }

    // 9.5 PINJOL RESCUE: Check Debt Ratio and Lock if > 35%
    let needs_education_lock = false;
    const dtiRatio = analysisResult.debt_to_income_ratio ?? 0;
    if (dbSuccess && dtiRatio > 35) {
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
      recurring_charges: analysisResult.recurring_charges ?? [],
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
        remaining_quota: quotaInfo?.remaining ?? 0, 
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
