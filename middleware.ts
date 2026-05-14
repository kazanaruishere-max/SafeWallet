import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// FIX H2: IP-based Rate Limiting (Free Tier Upstash)
// Menggunakan prefix khusus safewallet_rl agar tidak tabrakan dengan project demo yang lain.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Beda limit tiap endpoint
const rateLimits = {
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
};

export async function middleware(request: NextRequest) {
  // 1. IP Rate Limiting untuk semua /api/ routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Fallback order for IP detection
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
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
        console.warn(`[RateLimit] IP ${ip} exceeded limit for ${request.nextUrl.pathname}`);
        return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    } catch (error) {
      // Jika Upstash error (network issue dll), biarkan request lewat agar app tidak mati
      console.error("[RateLimit] Error connecting to Upstash:", error);
    }
  }

  // 2. Supabase Auth update session
  const response = await updateSession(request);
  
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
