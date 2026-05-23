import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side logout endpoint.
 * 
 * Problem: supabase.auth.signOut() on the client (browser) only clears
 * localStorage/sessionStorage tokens. It does NOT clear the HTTP-only
 * cookies that the Supabase SSR middleware sets. This causes "ghost sessions"
 * where the middleware still sees a valid cookie and redirects to /dashboard.
 * 
 * Solution: This endpoint runs on the server with access to cookies(),
 * so signOut() here properly clears the HTTP-only cookies.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Sign out server-side — this clears the HTTP-only auth cookies
    await supabase.auth.signOut();

    // Determine the safe redirect URL
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
    const baseUrl = appUrl ? appUrl.replace(/\/$/, "") : "";
    const redirectTo = baseUrl
      ? `${baseUrl}/login?prompt=select_account`
      : "/login?prompt=select_account";

    // Build response and manually expire any remaining sb-* cookies
    const response = NextResponse.json({
      success: true,
      redirectTo,
    });

    // Parse existing cookies from the request to find Supabase auth cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieNames = cookieHeader
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter((name) => name.startsWith("sb-"));

    for (const name of cookieNames) {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("[Logout API] Error during server-side logout:", error);
    return NextResponse.json(
      { success: false, redirectTo: "/login?prompt=select_account" },
      { status: 500 }
    );
  }
}
