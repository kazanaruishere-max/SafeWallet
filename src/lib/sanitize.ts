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
      sanitized = sanitized.replace(pattern, "___FILTERED___");
    }
  }

  // FIX H3: PII Redaction — balanced for financial data preservation
  // CRITICAL: Only redact patterns that are clearly PII. DO NOT redact patterns
  // that could be transaction descriptions, amounts, or banking keywords.
  const piiPatterns = [
    // 1. Credit Card Numbers (very specific pattern)
    { regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, replacement: "___CARD_REDACTED___" },
    // 2. Emails
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "___EMAIL_REDACTED___" },
    // 3. NIK (exactly 16 digits — Indonesian National ID)
    { regex: /\b\d{16}\b/g, replacement: "___NIK_REDACTED___" },
    // 4. Phone numbers (Indonesian format: 08xx or +62)
    { regex: /\b(?:0|\+62)\d{9,13}\b/g, replacement: "___PHONE_REDACTED___" },
    // 5. Explicit bank account keywords followed by numbers
    { regex: /\b(REK|NO\.?\s*REK|REKENING|ACCOUNT|ACC|NO\.?\s*HP|TELP|PIN|NIK)\s*[:.]?\s*\d{4,}\b/gi, replacement: "$1 ___REDACTED___" },
  ];

  let piiDetected = false;
  for (const { regex, replacement } of piiPatterns) {
    if (regex.test(sanitized)) {
      piiDetected = true;
      sanitized = sanitized.replace(regex, replacement);
    }
  }

  if (piiDetected) {
    warnings.push("Data sensitif (PII) telah disamarkan secara otomatis demi privasi Anda.");
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
