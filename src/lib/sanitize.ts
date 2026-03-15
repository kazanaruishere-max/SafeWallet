/**
 * AI Input Sanitizer — Prevent prompt injection attacks
 * FIX C2: Strip control characters, enforce length limits, block injection patterns
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+a/i,
  /forget\s+(all\s+)?your\s+(rules|instructions)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /\{\{.*?\}\}/,
  /```\s*(system|instruction)/i,
  /act\s+as\s+(if|a)/i,
  /override\s+(your|all|the)/i,
  /disregard\s+(all|previous|your)/i,
];

export function sanitizeAIInput(input: string, maxLength = 5000): {
  sanitized: string;
  warnings: string[];
} {
  const warnings: string[] = [];

  // 1. Strip control characters (keep newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    warnings.push(`Input dipotong ke ${maxLength} karakter.`);
  }

  // 3. Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push("Pola mencurigakan terdeteksi dan dihapus.");
      sanitized = sanitized.replace(pattern, "[FILTERED]");
    }
  }

  // FIX H3: Basic PII (Personally Identifiable Information) Stripping
  // Redact potential Account Numbers, Phone Numbers, and Emails before sending to AI
  const hasPII = /\b\d{10,16}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(sanitized);
  if (hasPII) {
    sanitized = sanitized
      // Mask 10-16 digit numbers (Bank Accounts / NIK / Phone numbers)
      .replace(/\b(\d{3})\d{4,10}(\d{3})\b/g, "$1******$2")
      // Mask 16 digit card numbers specifically
      .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "****-****-****-****")
      // Mask emails
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL REDACTED]")
      // Mask common indonesian names following Mr/Mrs/Bpk/Ibu/Sdr
      .replace(/\b(Bpk|Ibu|Mr|Mrs|Sdr|Sdri)\.?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/g, "$1 [NAME REDACTED]");
      
    warnings.push("Data sensitif (PII) telah disamarkan sebelum dianalisis.");
  }

  // 4. Normalize whitespace (collapse multiple spaces/newlines)
  sanitized = sanitized
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {3,}/g, "  ")
    .trim();

  return { sanitized, warnings };
}

/**
 * Sanitize content for scam check input
 */
export function sanitizeScamInput(content: string): {
  sanitized: string;
  isClean: boolean;
} {
  const { sanitized, warnings } = sanitizeAIInput(content, 3000);
  return {
    sanitized,
    isClean: warnings.length === 0,
  };
}
