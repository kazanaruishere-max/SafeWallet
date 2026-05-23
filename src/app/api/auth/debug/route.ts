import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * Diagnostic endpoint to verify Cloud Run environment configuration.
 * 
 * Usage: GET /api/auth/debug
 * Protected by DIAGNOSTIC_SECRET header in production.
 * 
 * This helps verify:
 * - Whether APP_URL / NEXT_PUBLIC_APP_URL are set correctly
 * - What headers Cloud Run's proxy is sending
 * - Whether origin detection would work for auth redirects
 */
export async function GET(request: Request) {
  // Only allow in dev or with diagnostic secret
  const diagnosticSecret = process.env.DIAGNOSTIC_SECRET?.trim();
  if (process.env.NODE_ENV === "production") {
    if (
      !diagnosticSecret ||
      request.headers.get("x-diagnostic-secret") !== diagnosticSecret
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const headersList = await headers();

  // Collect all relevant headers
  const relevantHeaders: Record<string, string | null> = {
    host: headersList.get("host"),
    "x-forwarded-host": headersList.get("x-forwarded-host"),
    "x-forwarded-proto": headersList.get("x-forwarded-proto"),
    "x-forwarded-for": headersList.get("x-forwarded-for"),
    "x-real-ip": headersList.get("x-real-ip"),
    origin: headersList.get("origin"),
    referer: headersList.get("referer"),
  };

  // Check environment variables (existence only, not values for security)
  const envVars = {
    APP_URL: process.env.APP_URL || "(not set)",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || "(not set)",
    HOSTNAME: process.env.HOSTNAME || "(not set)",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ set"
      : "❌ not set",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ set"
      : "❌ not set",
    GROQ_API_KEY: process.env.GROQ_API_KEY ? "✅ set" : "❌ not set",
  };

  // Simulate origin detection logic
  let detectedOrigin = "(fallback to request.url)";
  let detectionMethod = "request.url fallback";

  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl.startsWith("http")) {
    detectedOrigin = appUrl.replace(/\/$/, "");
    detectionMethod = "APP_URL env var";
  } else {
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (publicAppUrl && publicAppUrl.startsWith("http")) {
      detectedOrigin = publicAppUrl.replace(/\/$/, "");
      detectionMethod = "NEXT_PUBLIC_APP_URL env var";
    } else {
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
        detectedOrigin = `${proto}://${cleanHost}`;
        detectionMethod = "proxy headers";
      } else {
        detectedOrigin = new URL(request.url).origin;
        detectionMethod = "request.url (⚠️ may be internal IP!)";
      }
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    request_url: request.url,
    request_url_origin: new URL(request.url).origin,
    detected_origin: detectedOrigin,
    detection_method: detectionMethod,
    is_safe_origin:
      !detectedOrigin.includes("0.0.0.0") &&
      !detectedOrigin.includes("127.0.0.1"),
    headers: relevantHeaders,
    env_vars: envVars,
    recommendation:
      detectedOrigin.includes("0.0.0.0") || detectedOrigin.includes("127.0.0.1")
        ? "⚠️ Origin resolves to internal IP! Set APP_URL in Cloud Run environment variables."
        : "✅ Origin detection looks correct.",
  });
}
