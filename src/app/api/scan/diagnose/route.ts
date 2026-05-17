import { NextResponse } from "next/server";

/**
 * Health Scanner Pipeline Diagnostic Endpoint
 * Tests each component individually to identify failures.
 * GET /api/scan/diagnose
 */
export async function GET() {
  const results: Record<string, { ok: boolean; detail: string; ms: number }> = {};

  // 1. Test Supabase connection
  const t1 = Date.now();
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    results["1_supabase"] = { ok: true, detail: `Session: ${data.session ? "active" : "none"}`, ms: Date.now() - t1 };
  } catch (e) {
    results["1_supabase"] = { ok: false, detail: String(e), ms: Date.now() - t1 };
  }

  // 2. Test file-type import (ESM module)
  const t2 = Date.now();
  try {
    const { fileTypeFromBuffer } = await import("file-type");
    const pdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
    const result = await fileTypeFromBuffer(pdfBytes);
    results["2_filetype"] = { ok: true, detail: `Detected: ${result?.mime ?? "too small to detect"}`, ms: Date.now() - t2 };
  } catch (e) {
    results["2_filetype"] = { ok: false, detail: String(e), ms: Date.now() - t2 };
  }

  // 3. Test pdf-parse import
  const t3 = Date.now();
  try {
    // @ts-ignore
    const pdfParseMod = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = pdfParseMod.default || pdfParseMod;
    results["3_pdfparse"] = { ok: typeof pdfParse === "function", detail: `Type: ${typeof pdfParse}`, ms: Date.now() - t3 };
  } catch (e) {
    results["3_pdfparse"] = { ok: false, detail: String(e), ms: Date.now() - t3 };
  }

  // 4. Test xlsx import
  const t4 = Date.now();
  try {
    const xlsx = await import("xlsx");
    const wb = xlsx.read(Buffer.from("Name,Amount\nTest,1000"), { type: "buffer" });
    const text = xlsx.utils.sheet_to_txt(wb.Sheets[wb.SheetNames[0]]);
    results["4_xlsx"] = { ok: text.length > 0, detail: `Parsed ${text.length} chars`, ms: Date.now() - t4 };
  } catch (e) {
    results["4_xlsx"] = { ok: false, detail: String(e), ms: Date.now() - t4 };
  }

  // 5. Test Groq AI connection
  const t5 = Date.now();
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      results["5_groq_ai"] = { ok: false, detail: "GROQ_API_KEY env var is NOT SET", ms: Date.now() - t5 };
    } else {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      results["5_groq_ai"] = { ok: res.ok, detail: `Status: ${res.status} (key: ${apiKey.substring(0, 8)}...)`, ms: Date.now() - t5 };
    }
  } catch (e) {
    results["5_groq_ai"] = { ok: false, detail: String(e), ms: Date.now() - t5 };
  }

  // 6. Test encryption key
  const t6 = Date.now();
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      results["6_encryption"] = { ok: false, detail: `ENCRYPTION_KEY ${key ? `too short (${key.length} chars)` : "NOT SET"}`, ms: Date.now() - t6 };
    } else {
      const { encrypt, decrypt } = await import("@/lib/encryption");
      const test = encrypt("diagnostic_test");
      const back = decrypt(test);
      results["6_encryption"] = { ok: back === "diagnostic_test", detail: "Encrypt/decrypt roundtrip OK", ms: Date.now() - t6 };
    }
  } catch (e) {
    results["6_encryption"] = { ok: false, detail: String(e), ms: Date.now() - t6 };
  }

  // 7. Test Tesseract.js availability (don't actually run OCR, just check import)
  const t7 = Date.now();
  try {
    const Tesseract = await import("tesseract.js");
    results["7_tesseract"] = { ok: typeof Tesseract.createWorker === "function", detail: "Module loaded OK", ms: Date.now() - t7 };
  } catch (e) {
    results["7_tesseract"] = { ok: false, detail: String(e), ms: Date.now() - t7 };
  }

  // Summary
  const allOk = Object.values(results).every((r) => r.ok);
  
  return NextResponse.json({
    status: allOk ? "ALL_PASS" : "HAS_FAILURES",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    results,
  });
}
