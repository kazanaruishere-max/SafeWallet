import * as Tesseract from "tesseract.js";
import * as xlsx from "xlsx";
import { Buffer } from "buffer";

/**
 * Server-Side File Parser for SafeWallet v2
 * Moves processing from client to server for security and trust.
 * Guardrails added for production scalability.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for server processing
const OCR_TIMEOUT = 25000; // 25s timeout to prevent serverless hanging

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
          return { text: await parseImageServer(buffer), format: "image" as const };
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
      setTimeout(() => reject(new Error("Pemrosesan file timeout (Server Busy).")), OCR_TIMEOUT)
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
 * Server-side OCR using Tesseract.js (Node version)
 * BUG-3 FIX: Wrap in resilient try-catch for Vercel cold-start issues
 */
async function parseImageServer(buffer: Buffer): Promise<string> {
  let worker;
  try {
    worker = await Tesseract.createWorker("ind+eng");
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    if (!text || text.trim().length < 10) {
      throw new Error("OCR tidak dapat membaca teks dari gambar. Pastikan gambar jelas dan berisi data keuangan.");
    }
    
    return text;
  } catch (err) {
    // Ensure worker cleanup even on failure
    try { if (worker) await worker.terminate(); } catch { /* ignore */ }
    
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("OCR tidak dapat")) throw err; // Re-throw our own descriptive error
    
    // Tesseract cold-start / language data download failure
    console.error("[OCR] Tesseract.js failure:", msg);
    throw new Error("Gagal memuat engine OCR (cold-start). Coba upload ulang dalam 10 detik.");
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
 * Reverted to pdf-parse v1 API to fix Webpack pdf.js worker crash in Next.js Serverless.
 * Enhanced: password support, text quality check, OCR fallback for scanned PDFs.
 */
async function parsePdfServer(buffer: Buffer, pdfPassword?: string): Promise<string> {
  // @ts-ignore - pdf-parse/lib/pdf-parse.js doesn't have type definitions
  const pdfParseMod = await import("pdf-parse/lib/pdf-parse.js");
  // ESM interop fallback for CJS
  const pdfParse = pdfParseMod.default || pdfParseMod;
  
  // Build options — pass password if provided
  const options: Record<string, unknown> = { max: 50 };
  if (pdfPassword) {
    options.password = pdfPassword;
  }

  let text = "";
  try {
    const result = await pdfParse(buffer, options);
    text = result.text?.trim() || "";
    console.log(`[PDF] Extracted ${text.length} chars, ${result.numpages} pages`);
  } catch (pdfErr) {
    const errMsg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
    console.error("[PDF] pdf-parse error:", errMsg);
    
    if (errMsg.includes("password") || errMsg.includes("encrypted")) {
      throw new Error("PDF terproteksi password. Masukkan password yang benar di kolom yang tersedia.");
    }
    throw new Error(`Gagal membaca PDF: ${errMsg.substring(0, 100)}`);
  }

  // Quality check: does the extracted text contain financial data?
  // Count digits in text — financial data always has numbers (amounts, dates, etc.)
  const digitCount = (text.match(/\d/g) || []).length;
  const hasFinancialKeywords = /(?:debit|kredit|transfer|saldo|mutasi|transaksi|pembayaran|setoran|penarikan|total|rp|idr)/i.test(text);
  
  console.log(`[PDF] Quality check: ${digitCount} digits, financial keywords: ${hasFinancialKeywords}`);

  // If text is too short or has no financial signals, this is likely a scanned PDF
  if (text.length < 50 || (digitCount < 5 && !hasFinancialKeywords)) {
    console.warn("[PDF] Insufficient text from pdf-parse, attempting OCR fallback...");
    
    // Try OCR as fallback — Tesseract.js can sometimes read text from PDF buffers
    try {
      const ocrText = await parseImageServer(buffer);
      if (ocrText && ocrText.trim().length > text.length) {
        console.log(`[PDF] OCR fallback produced ${ocrText.length} chars (vs ${text.length} from pdf-parse)`);
        return ocrText;
      }
    } catch (ocrErr) {
      console.warn("[PDF] OCR fallback failed:", ocrErr);
    }

    // If both methods produce little text, return what we have with a warning
    if (text.length < 20) {
      throw new Error(
        "PDF ini tampaknya berupa scan gambar dan tidak mengandung teks digital. " +
        "Coba screenshot halaman yang berisi data transaksi dan upload sebagai gambar (JPG/PNG)."
      );
    }
  }

  return text;
}
