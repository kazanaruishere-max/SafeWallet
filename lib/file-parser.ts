/**
 * Multi-format file parser for Health Scanner
 * Supports: Images (OCR), PDF, Excel (.xlsx/.xls), CSV, Text
 */

export type ParsedFile = {
  text: string;
  format: "image" | "pdf" | "excel" | "csv" | "text";
  pages?: number;
};

const SUPPORTED_TYPES: Record<string, ParsedFile["format"]> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
  "application/vnd.ms-excel": "excel",
  "text/csv": "csv",
  "text/plain": "text",
};

export function getFileFormat(file: File): ParsedFile["format"] | null {
  // Check MIME type first
  if (SUPPORTED_TYPES[file.type]) return SUPPORTED_TYPES[file.type];

  // Fallback to extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      return "image";
    case "pdf":
      return "pdf";
    case "xlsx":
    case "xls":
      return "excel";
    case "csv":
      return "csv";
    case "txt":
      return "text";
    default:
      return null;
  }
}

export function getSupportedExtensions(): string {
  return "image/jpeg,image/png,image/webp,application/pdf,.xlsx,.xls,.csv,.txt";
}

export function getFormatLabel(format: ParsedFile["format"]): string {
  switch (format) {
    case "image":
      return "Gambar (OCR)";
    case "pdf":
      return "PDF";
    case "excel":
      return "Excel";
    case "csv":
      return "CSV";
    case "text":
      return "Text";
  }
}

/**
 * Extract text from any supported file format
 */
export async function parseFile(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedFile> {
  const format = getFileFormat(file);
  if (!format) {
    throw new Error(
      `Format file tidak didukung. Gunakan: JPEG, PNG, PDF, Excel, CSV, atau TXT.`
    );
  }

  switch (format) {
    case "image":
      return parseImage(file, onProgress);
    case "pdf":
      return parsePDF(file, onProgress);
    case "excel":
      return parseExcel(file, onProgress);
    case "csv":
      return parseCSV(file, onProgress);
    case "text":
      return parseText(file, onProgress);
  }
}

/**
 * Image → OCR using Tesseract.js
 */
async function parseImage(
  file: File,
  onProgress?: (p: number, s: string) => void
): Promise<ParsedFile> {
  onProgress?.(10, "Memuat Tesseract.js...");
  const Tesseract = await import("tesseract.js");

  onProgress?.(20, "Membaca teks dari gambar...");
  const worker = await Tesseract.createWorker("ind+eng", undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.(20 + Math.round(m.progress * 70), "Membaca teks (OCR)...");
      }
    },
  });

  const { data } = await worker.recognize(file);
  await worker.terminate();

  if (!data.text || data.text.trim().length < 20) {
    throw new Error(
      "Tidak dapat membaca teks dari gambar. Pastikan foto jelas dan berisi data keuangan."
    );
  }

  onProgress?.(100, "Selesai!");
  return { text: data.text, format: "image" };
}

/**
 * PDF → Text using pdf.js
 */
async function parsePDF(
  file: File,
  onProgress?: (p: number, s: string) => void
): Promise<ParsedFile> {
  onProgress?.(10, "Memuat PDF reader...");

  const pdfjsLib = await import("pdfjs-dist");

  // Set worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  onProgress?.(20, "Membaca PDF...");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const totalPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(
      20 + Math.round((i / totalPages) * 70),
      `Membaca halaman ${i}/${totalPages}...`
    );
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  const fullText = textParts.join("\n\n");

  if (fullText.trim().length < 10) {
    throw new Error(
      "PDF tidak berisi teks yang dapat dibaca. Gunakan PDF mutasi bank dari internet/mobile banking (bukan scan gambar)."
    );
  }

  onProgress?.(100, "Selesai!");
  return { text: fullText, format: "pdf", pages: totalPages };
}

/**
 * Excel → Text using SheetJS (xlsx)
 */
async function parseExcel(
  file: File,
  onProgress?: (p: number, s: string) => void
): Promise<ParsedFile> {
  onProgress?.(10, "Memuat Excel reader...");
  const XLSX = await import("xlsx");

  onProgress?.(30, "Membaca spreadsheet...");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  onProgress?.(60, "Mengekstrak data...");
  const textParts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert to CSV-like text for AI analysis
    const csv = XLSX.utils.sheet_to_csv(sheet);
    textParts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
  }

  const fullText = textParts.join("\n\n");

  if (fullText.trim().length < 10) {
    throw new Error("Spreadsheet kosong atau tidak berisi data.");
  }

  onProgress?.(100, "Selesai!");
  return { text: fullText, format: "excel" };
}

/**
 * CSV → Text (direct read)
 */
async function parseCSV(
  file: File,
  onProgress?: (p: number, s: string) => void
): Promise<ParsedFile> {
  onProgress?.(30, "Membaca CSV...");
  const text = await file.text();

  if (text.trim().length < 10) {
    throw new Error("File CSV kosong atau tidak berisi data.");
  }

  onProgress?.(100, "Selesai!");
  return { text, format: "csv" };
}

/**
 * Text → Direct read
 */
async function parseText(
  file: File,
  onProgress?: (p: number, s: string) => void
): Promise<ParsedFile> {
  onProgress?.(30, "Membaca teks...");
  const text = await file.text();

  if (text.trim().length < 10) {
    throw new Error("File teks kosong.");
  }

  onProgress?.(100, "Selesai!");
  return { text, format: "text" };
}
