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

  // FIX H3: Advanced PII (Personally Identifiable Information) Redaction
  // This is a "Zero-Trust" sanitizer to ensure sensitive data never leaves the server to external AI.
  const piiPatterns = [
    // 1. Bank Account / NIK / Phone Numbers (10-16 digits)
    { regex: /\b\d{10,16}\b/g, replacement: "___ID_REDACTED___" },
    // 2. Credit Card Numbers
    { regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, replacement: "___CARD_REDACTED___" },
    // 3. Emails
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "___EMAIL_REDACTED___" },
    // 4. Names with common Indonesian titles & typical capitalized names
    { regex: /\b(Bpk|Ibu|Mr|Mrs|Sdr|Sdri|Tuan|Nyonya|Anak|An)\.?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/g, replacement: "$1 ___NAME_REDACTED___" },
    // 5. Common Bank Keywords often followed by identifiers (REK, NO.REK, etc)
    { regex: /\b(REK|NO\.REK|ACCOUNT|ACC|VA|VIRTUAL ACCOUNT|NO\.HP|TELP|PIN|NIK)\s*[:.]?\s*[A-Z0-9-]{4,}\b/gi, replacement: "$1 ___REDACTED___" },
    // 6. Addresses (Common Indonesian address keywords)
    { regex: /\b(Jl|Jalan|Kec|Kab|Kota|Prov|RT|RW)\.?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/g, replacement: "___ADDRESS_REDACTED___" },
    // 7. SWIFT/BIC/IBAN patterns
    { regex: /\b[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?\b/g, replacement: "___BANK_CODE_REDACTED___" },
    // 8. IP Addresses (for telemetry/log leak prevention)
    { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: "___IP_REDACTED___" },
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
