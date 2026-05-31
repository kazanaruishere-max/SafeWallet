import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Detects the correct public-facing origin, even behind reverse proxies
 * like Cloud Run's load balancer. Falls back to request URL origin.
 *
 * Resolution order mirrors middleware.ts for consistency.
 */
async function getPublicOrigin(request: Request): Promise<string> {
  // 1. Runtime env var (NOT inlined at build time, safe for Cloud Run)
  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl.startsWith("http")) {
    return appUrl.replace(/\/$/, "");
  }

  // 2. Build-time env var
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (publicAppUrl && publicAppUrl.startsWith("http")) {
    return publicAppUrl.replace(/\/$/, "");
  }

  // 3. Reconstruct from proxy headers (Cloud Run / Vercel)
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "https";
  const host =
    headersList.get("x-forwarded-host") || headersList.get("host");

  if (
    host &&
    !host.includes("0.0.0.0") &&
    !host.includes("127.0.0.1") &&
    !host.startsWith("localhost")
  ) {
    const cleanHost = host.replace(/:443$/, "").replace(/:80$/, "");
    return `${proto}://${cleanHost}`;
  }

  // 4. Fallback to request URL origin (may be internal IP in containers)
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = await getPublicOrigin(request);

  // FIX C6: Validate redirect to prevent open redirect attacks
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return error page if auth fails
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
