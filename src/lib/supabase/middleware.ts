import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Skip auth redirects for the callback route — it handles its own flow
  const isCallbackRoute = request.nextUrl.pathname.startsWith("/auth/callback");
  if (isCallbackRoute) {
    return supabaseResponse;
  }

  // Protected routes: redirect to login if no session
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  // Get the reliable absolute URL for redirects
  const rawAppUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const appUrl = rawAppUrl ? rawAppUrl.replace(/\/$/, "") : request.nextUrl.origin;

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(`${appUrl}/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  return supabaseResponse;
}
