import * as xlsx from "xlsx";
import { Buffer } from "buffer";

/**
 * Server-Side File Parser for SafeWallet v2
 * Moves processing from client to server for security and trust.
 * 
 * IMAGE STRATEGY: Uses Groq Vision AI (Llama 4 Scout) instead of Tesseract.js
 * Reason: Tesseract.js produces garbage text from bank statement images and
 * causes cold-start timeouts on Vercel serverless (language data download).
 * Groq Vision reads all transaction data accurately in ~2.5s with no cold-start.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for server processing
const PARSE_TIMEOUT = 55000; // 55s timeout (maxDuration=60 on Vercel)

export type ParsedFileServer = {
  text: string;
  format: "image" | "pdf" | "excel" | "csv" | "text";
};

/**
 * Extract text from a Buffer on the server
 */
export async function parseFileServer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  pdfPassword?: string
): Promise<ParsedFileServer> {
  // Guardrail: Size check
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File terlalu besar untuk diproses di server keamanan.");
  }

  const format = getFormatFromMime(mimeType, fileName);
  
  // Guardrail: Timeout protection for CPU-bound tasks
  return Promise.race([
    (async () => {
      switch (format) {
        case "image":
          return { text: await parseImageWithVision(buffer, mimeType), format: "image" as const };
        case "excel":
          return { text: await parseExcelServer(buffer), format: "excel" as const };
        case "csv":
          return { text: await parseCSVServer(buffer), format: "csv" as const };
        case "text":
          return { text: buffer.toString("utf-8"), format: "text" as const };
        case "pdf":
          return { text: await parsePdfServer(buffer, pdfPassword), format: "pdf" as const }; 
        default:
          throw new Error(`Format file ${mimeType} tidak didukung di server.`);
      }
    })(),
    new Promise<ParsedFileServer>((_, reject) => 
      setTimeout(() => reject(new Error("Pemrosesan file timeout (Server Busy).")), PARSE_TIMEOUT)
    )
  ]);
}

function getFormatFromMime(mime: string, fileName: string): ParsedFileServer["format"] {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("sheet") || mime.includes("excel") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) return "excel";
  if (mime === "text/csv" || fileName.endsWith(".csv")) return "csv";
  return "text";
}

/**
 * Server-side image parsing using Groq Vision AI (Llama 4 Scout)
 * 
 * Replaces Tesseract.js OCR which was unreliable:
 * - Tesseract produced garbage text from bank statement images
 * - Cold-start downloads (~7-15MB language data) caused timeouts on Vercel
 * - Tesseract CANNOT process PDF buffers ("Pdf reading is not supported")
 * 
 * Groq Vision advantages:
 * - Reads bank statements accurately (19 transactions in 2.5s test)
 * - No cold-start downloads
 * - Works with any image format
 * - Free tier: sufficient for SafeWallet usage
 */
async function parseImageWithVision(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY tidak dikonfigurasi di server.");
  }

  // Convert buffer to base64 for API
  const base64Image = buffer.toString("base64");
  const mediaType = mimeType || "image/png";
  
  const start = Date.now();
  console.log(`[Vision] Starting Groq Vision extraction (${(buffer.length / 1024).toFixed(1)} KB)...`);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: 
              "Kamu adalah ekstraktor data keuangan profesional. " +
              "Tugas: Ekstrak SEMUA data transaksi dari gambar mutasi/laporan bank. " +
              "Tulis SETIAP baris transaksi yang terlihat dengan format: tanggal | deskripsi | debit | kredit | saldo. " +
              "Jika ada informasi lain seperti nama pemilik rekening, periode, total saldo awal/akhir, sertakan juga. " +
              "JANGAN tambahkan informasi yang tidak ada di gambar. " +
              "Tulis SEMUA baris yang terlihat, jangan ringkas. Output dalam bahasa Indonesia."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Ekstrak semua data transaksi keuangan dari gambar ini:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for accurate extraction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Vision] Groq API error (${response.status}):`, errorText.substring(0, 300));
      
      if (response.status === 429) {
        throw new Error("Batas penggunaan AI tercapai. Coba lagi dalam beberapa menit.");
      }
      if (response.status === 413) {
        throw new Error("Gambar terlalu besar untuk diproses AI. Coba kompres atau crop bagian transaksi.");
      }
      throw new Error(`Gagal menganalisis gambar (HTTP ${response.status}). Coba lagi.`);
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content?.trim() || "";
    
    console.log(`[Vision] Extracted ${text.length} chars in ${Date.now() - start}ms`);

    if (!text || text.length < 20) {
      throw new Error(
        "AI tidak dapat membaca data keuangan dari gambar. " +
        "Pastikan gambar berisi mutasi bank/data transaksi yang jelas dan tidak terpotong."
      );
    }

    return text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Re-throw our descriptive errors
    if (msg.includes("AI tidak") || msg.includes("Batas penggunaan") || 
        msg.includes("terlalu besar") || msg.includes("Gagal menganalisis") ||
        msg.includes("GROQ_API_KEY")) {
      throw err;
    }
    console.error("[Vision] Unexpected error:", msg);
    throw new Error("Gagal memproses gambar. Pastikan gambar valid dan coba lagi.");
  }
}

/**
 * Server-side Excel parsing using xlsx
 */
async function parseExcelServer(buffer: Buffer): Promise<string> {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  let fullText = "";
  
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    fullText += xlsx.utils.sheet_to_txt(worksheet) + "\n";
  });
  
  return fullText;
}

/**
 * Server-side CSV parsing
 */
async function parseCSVServer(buffer: Buffer): Promise<string> {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_txt(firstSheet);
}

/**
 * Server-side Native PDF parsing
 * Uses pdf-parse v1 to avoid Webpack worker crash in Next.js Serverless.
 * Includes text quality validation for scanned PDFs (image-embedded text).
 */
async function parsePdfServer(buffer: Buffer, pdfPassword?: string): Promise<string> {
  // @ts-expect-error - pdf-parse/lib/pdf-parse.js doesn't have type definitions
  const pdfParseMod = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = pdfParseMod.default || pdfParseMod;
  
  const options: Record<string, unknown> = { max: 50 };
  if (pdfPassword) {
    options.password = pdfPassword;
  }

  let text = "";
  let numpages = 0;
  try {
    const result = await pdfParse(buffer, options);
    text = result.text?.trim() || "";
    numpages = result.numpages || 0;
    console.log(`[PDF] Extracted ${text.length} chars from ${numpages} pages`);
  } catch (pdfErr) {
    const errMsg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
    console.error("[PDF] pdf-parse error:", errMsg);
    
    if (errMsg.includes("password") || errMsg.includes("encrypted")) {
      throw new Error("PDF terproteksi password. Masukkan password yang benar di kolom yang tersedia.");
    }
    throw new Error(`Gagal membaca PDF: ${errMsg.substring(0, 100)}`);
  }

  // Quality check: does the extracted text actually contain financial data?
  const digitCount = (text.match(/\d/g) || []).length;
  const hasFinancialKeywords = /(?:debit|kredit|credit|transfer|saldo|balance|mutasi|transaksi|pembayaran|setoran|penarikan|total|rp\s|idr)/i.test(text);
  
  console.log(`[PDF] Quality: ${digitCount} digits, financial keywords: ${hasFinancialKeywords}, length: ${text.length}`);

  // If text has no financial value, this is a scanned/image-based PDF
  // Use Groq Vision as fallback for scanned PDFs
  if (digitCount < 5 && !hasFinancialKeywords) {
    console.warn("[PDF] Scanned PDF detected, falling back to Groq Vision...");
    try {
      // Send PDF buffer as image to Groq Vision (it can read embedded images)
      const visionText = await parseImageWithVision(buffer, "application/pdf");
      if (visionText && visionText.length > text.length) {
        console.log(`[PDF] Vision fallback produced ${visionText.length} chars`);
        return visionText;
      }
    } catch (visionErr) {
      console.warn("[PDF] Vision fallback failed:", visionErr);
    }
    
    throw new Error(
      "PDF ini berupa hasil scan/gambar dan tidak mengandung teks transaksi digital. " +
      "Solusi: Screenshot halaman yang berisi data transaksi, lalu upload sebagai gambar (JPG/PNG)."
    );
  }

  if (text.length < 30) {
    throw new Error(
      "Teks yang diekstrak dari PDF terlalu sedikit. " +
      "Coba screenshot halaman transaksi dan upload sebagai gambar."
    );
  }

  return text;
}
