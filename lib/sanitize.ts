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
