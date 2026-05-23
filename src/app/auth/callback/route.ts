import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Detects the correct public-facing origin, even behind reverse proxies
 * like Cloud Run's load balancer. Falls back to request URL origin.
 */
async function getPublicOrigin(request: Request): Promise<string> {
  // PAKSA gunakan URL publik jika ada di environment
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // Jika tidak ada, baru cek header (GCloud/Vercel)
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "https";
  
  // Pastikan tidak mengembalikan 0.0.0.0
  if (host && !host.includes("0.0.0.0")) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = await getPublicOrigin(request);

  // FIX C6: Validate redirect to prevent open redirect attacks
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

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
