import { en } from "@/i18n/locales/en";
import { id } from "@/i18n/locales/id";

export const messages = {
  id,
  en,
} as const;

export type Locale = keyof typeof messages;
export type Messages = (typeof messages)[Locale];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === "id" || value === "en";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "id";
  }

  const candidates = [...(navigator.languages ?? []), navigator.language].filter(
    Boolean
  ) as string[];

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("id")) return "id";
  }

  return "id";
}
