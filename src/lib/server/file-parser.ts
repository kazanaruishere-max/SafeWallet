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
  fileName: string
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
          return { text: await parseImageServer(buffer), format: "pdf" as const }; 
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
 */
async function parseImageServer(buffer: Buffer): Promise<string> {
  const worker = await Tesseract.createWorker("ind+eng");
  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();
  return text;
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
