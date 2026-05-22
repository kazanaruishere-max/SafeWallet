const SECRET_PATTERNS = [
  /\b(gsk_[A-Za-z0-9_-]{16,})\b/g,
  /\b(AIza[0-9A-Za-z_-]{16,})\b/g,
  /\b([A-Za-z0-9_-]*\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})\b/g,
  /\b(\d{6,}:[A-Za-z0-9_-]{20,})\b/g,
  /\b(Bearer\s+)[A-Za-z0-9._-]{12,}\b/gi,
  /\b((?:api[_-]?key|token|secret|password|service[_-]?role|authorization)\s*[:=]\s*)[^\s"',}]+/gi,
];

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:0|\+62)\d{9,13}\b/g,
  /\b\d{13,19}\b/g,
];

export function redactForLog(value: unknown): string {
  let text: string;

  if (value instanceof Error) {
    text = `${value.name}: ${value.message}`;
  } else if (typeof value === "string") {
    text = value;
  } else {
    try {
      text = JSON.stringify(value);
    } catch {
      text = String(value);
    }
  }

  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, (_match, prefix?: string) => {
      return prefix && /bearer|key|token|secret|password|service|authorization/i.test(prefix)
        ? `${prefix}___REDACTED___`
        : "___SECRET_REDACTED___";
    });
  }

  for (const pattern of PII_PATTERNS) {
    text = text.replace(pattern, "___PII_REDACTED___");
  }

  return text.slice(0, 1000);
}

export function maskIdentifier(value: string | null | undefined): string {
  if (!value) return "unknown";
  if (value.length <= 8) return "masked";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
