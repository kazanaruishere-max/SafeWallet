import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import { SCAM_DETECTION_PROMPT, buildScamPrompt } from "@/lib/ai/prompts";
import { checkQuota, incrementUsage } from "@/lib/rate-limit";
import { checkAndAwardBadges } from "@/lib/gamification";
import { sanitizeScamInput } from "@/lib/sanitize";
import { parseAIResponse, ScamAnalysisSchema } from "@/lib/ai/schemas";
import { encrypt } from "@/lib/encryption";
import { generateIntegrityHash, recordOnBlockchain } from "@/lib/blockchain";
import type { ApiResponse, ApiError, ScamCheckResult } from "@/types/api";
import dns from "node:dns/promises";

const VALID_INPUT_TYPES = ["text", "url", "screenshot"] as const;

/**
 * SSRF Protection: Check if IP is in a private or restricted range
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 Private & Restricted Ranges
  const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, o1, o2] = ipv4Match.map(Number);
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    // 10.0.0.0/8 (Private)
    if (o1 === 10) return true;
    // 172.16.0.0/12 (Private)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (o1 === 192 && o2 === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud Metadata)
    if (o1 === 169 && o2 === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (o1 === 0) return true;
  }

  // IPv6 Private & Restricted Ranges
  if (
    ip === "::1" || 
    ip.startsWith("fe80:") || 
    ip.startsWith("fc00:") || 
    ip.startsWith("fd00:") ||
    ip === "::"
  ) {
    return true;
  }

  return false;
}

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
      console.warn("Quota system failed, allowing scan (Fail-Open):", quotaErr);
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

    // FIX: SSRF Protection for URL inputs (GHSA-g374-rpgq-fphx)
    if (input_type === "url") {
      try {
        const url = new URL(content.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Invalid protocol");
        }
        
        // Resolve host to IP to prevent DNS rebinding & bypasses
        const { address } = await dns.lookup(url.hostname);
        if (isPrivateIP(address)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SSRF_ATTEMPT",
                message: "Akses ke alamat internal atau terlarang tidak diperbolehkan.",
              },
            } satisfies ApiError,
            { status: 403 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "URL tidak valid atau tidak dapat diakses.",
            },
          } satisfies ApiError,
          { status: 400 }
        );
      }
    }

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
    let blockchainTxId: string | undefined;
    const integrityHash: string = generateIntegrityHash(analysisResult);

    // v2 Update: Encrypt sensitive data
    const encryptedContent = encrypt(content.substring(0, 5000));

    // v2 Update: Record integrity proof
    try {
      const blockchainRecord = await recordOnBlockchain(user.id, integrityHash, {
        feature: "scam-check",
        risk_score: analysisResult.risk_score
      });
      blockchainTxId = blockchainRecord.tx_id;
    } catch (bcErr) {
      console.warn("Blockchain recording failed, proceeding with DB save:", bcErr);
    }

    const { data: check, error: insertError } = await supabase
      .from("scam_checks")
      .insert({
        user_id: user.id,
        input_type,
        input_content: "[ENCRYPTED_V2]",
        encrypted_input_content: encryptedContent,
        blockchain_hash: integrityHash,
        blockchain_tx_id: blockchainTxId,
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
