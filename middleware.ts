import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { maskIdentifier, redactForLog } from "@/lib/security/logging";

// FIX H2: IP-based Rate Limiting (Free Tier Upstash)
// Menggunakan prefix khusus safewallet_rl agar tidak tabrakan dengan project demo yang lain.
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Beda limit tiap endpoint
const rateLimits = redis ? {
  // Webhooks: Lebih ketat karena public (10 req / 10 sec)
  webhooks: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "safewallet_rl_webhooks",
  }),
  // Scan / Scam-Check (AI endpoints): Terbatas untuk cegah spam API (5 req / 1 min)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "safewallet_rl_ai",
  }),
  // Data Export: Sangat ketat (1 req / 60 sec) — cegah data harvesting
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
    analytics: true,
    prefix: "safewallet_rl_export",
  }),
  // Account Delete: Dibatasi (3 req / 1 jam) — cegah brute-force password confirmation
  delete: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "safewallet_rl_delete",
  }),
  // Main API (General): 50 req / 1 min
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 m"),
    analytics: true,
    prefix: "safewallet_rl_general",
  }),
} : null;

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function middleware(request: NextRequest) {
  // 1. IP Rate Limiting untuk semua /api/ routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (!rateLimits) {
      // Allow requests to pass through even if Upstash is not configured,
      // to prevent the entire app from breaking if env vars are missing.
      console.warn("[RateLimit] Upstash is not configured. Rate limiting is disabled.");
    } else {
    // Fallback order for IP detection
    const ip = getClientIp(request);
    let ratelimiter = rateLimits.general;

    if (request.nextUrl.pathname.includes("/webhooks/")) {
      ratelimiter = rateLimits.webhooks;
    } else if (
      request.nextUrl.pathname.includes("/scan") ||
      request.nextUrl.pathname.includes("/scam-check")
    ) {
      ratelimiter = rateLimits.ai;
    } else if (request.nextUrl.pathname === "/api/user/export") {
      // SECURITY MED-2: Strict rate limit for data export to prevent harvesting
      ratelimiter = rateLimits.export;
    } else if (request.nextUrl.pathname === "/api/user/delete") {
      // SECURITY: Limit delete attempts to prevent brute-force password confirmation
      ratelimiter = rateLimits.delete;
    }

    try {
      const { success, limit, reset, remaining } = await ratelimiter.limit(ip);

      if (!success) {
        console.warn(`[RateLimit] IP ${maskIdentifier(ip)} exceeded limit for ${request.nextUrl.pathname}`);
        return applySecurityHeaders(
          NextResponse.json(
            { error: "Too Many Requests" },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              },
            }
          )
        );
      }
    } catch (error) {
      // Jika Upstash error (network issue dll), biarkan request lewat agar app tidak mati
      console.error("[RateLimit] Error connecting to Upstash:", redactForLog(error));
    }
    }
  }

  // 2. Supabase Auth update session
  const response = await updateSession(request);
  
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
