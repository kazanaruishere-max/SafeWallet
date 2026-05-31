import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Resolves the public-facing origin for server-side redirects.
 *
 * Why this exists:
 *   In Cloud Run (Docker), Next.js sees `request.nextUrl.origin` as
 *   `http://0.0.0.0:PORT` — the internal container address.
 *   Browsers cannot navigate to 0.0.0.0, so redirects break.
 *
 * Resolution order:
 *   1. APP_URL env var (runtime, NOT inlined at build time)
 *   2. NEXT_PUBLIC_APP_URL env var (build-time, may be empty)
 *   3. x-forwarded-host / host headers (set by Cloud Run's proxy)
 *   4. request.nextUrl.origin (last resort, may be 0.0.0.0)
 */
function getPublicOrigin(request: NextRequest): string {
  // 1. Runtime env var — most reliable for Cloud Run
  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl.startsWith("http")) {
    return appUrl.replace(/\/$/, "");
  }

  // 2. Build-time env var — may be empty if secret wasn't set during docker build
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (publicAppUrl && publicAppUrl.startsWith("http")) {
    return publicAppUrl.replace(/\/$/, "");
  }

  // 3. Reconstruct from proxy headers
  //    Cloud Run sets Host to the public domain and x-forwarded-proto to https
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (host && !isInternalHost(host)) {
    // Strip default ports
    const cleanHost = host.replace(/:443$/, "").replace(/:80$/, "");
    return `${proto}://${cleanHost}`;
  }

  // 4. Fallback — may contain 0.0.0.0, but we have no better option
  return request.nextUrl.origin;
}

/** Returns true if the host string points to an internal/container address */
function isInternalHost(host: string): boolean {
  return (
    host.includes("0.0.0.0") ||
    host.includes("127.0.0.1") ||
    host.startsWith("localhost")
  );
}

/**
 * Builds a redirect URL that is guaranteed to NOT point to an internal IP.
 * If all origin-detection methods fail, returns null (caller should skip redirect).
 */
function buildSafeRedirect(
  request: NextRequest,
  pathname: string,
  params?: Record<string, string>
): string | null {
  const origin = getPublicOrigin(request);

  // Safety net: if origin is still an internal address, don't redirect
  if (isInternalHost(new URL(origin).host)) {
    console.warn(
      `[Middleware] Skipping redirect to ${pathname} — origin resolved to internal address: ${origin}`
    );
    return null;
  }

  const url = new URL(pathname, origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Skip auth redirects for routes that handle their own flow
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/auth/callback") ||
    pathname === "/api/auth/logout"
  ) {
    return supabaseResponse;
  }

  // Protected routes: redirect to login if no session
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedRoute && !user) {
    const redirectUrl = buildSafeRedirect(request, "/login", {
      redirect: pathname,
    });
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }
    // If we can't build a safe URL, let the request through
    // The client-side will handle showing login UI
    return supabaseResponse;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const redirectUrl = buildSafeRedirect(request, "/dashboard");
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}
