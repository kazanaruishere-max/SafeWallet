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
  if (SUPPORTED_TYPES[file.type]) return SUPPORTED_TYPES[file.type];

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
    case "image": return "Gambar (OCR)";
    case "pdf": return "PDF";
    case "excel": return "Excel";
    case "csv": return "CSV";
    case "text": return "Text";
  }
}

// Client-side parsing has been migrated to server-side for security and reliability.
// This file now only contains shared types and utilities.
