/**
 * Plausible Analytics — Privacy-first, lightweight analytics
 * See: MASTER_PLAN.md § 4.4
 * 
 * Add to root layout: <PlausibleAnalytics />
 * Self-hosted option: set NEXT_PUBLIC_PLAUSIBLE_URL env var
 */

"use client";

import Script from "next/script";

const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "safewallet.app";
const PLAUSIBLE_URL =
  process.env.NEXT_PUBLIC_PLAUSIBLE_URL ?? "https://plausible.io";

export function PlausibleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src={`${PLAUSIBLE_URL}/js/script.js`}
      strategy="afterInteractive"
    />
  );
}

// Custom event tracking helper
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && "plausible" in window) {
    (window as unknown as { plausible: (name: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible(eventName, props ? { props } : undefined);
  }
}
