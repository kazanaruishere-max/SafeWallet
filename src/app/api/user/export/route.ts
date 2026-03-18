import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

/**
 * GET /api/user/export — Export all user data (UU PDP / GDPR compliance)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login." } } satisfies ApiError,
        { status: 401 }
      );
    }

    // Fetch all user data in parallel
    const [profileRes, scansRes, scamRes, badgesRes, subsRes, coachRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("scans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("scam_checks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("badges").select("*").eq("user_id", user.id),
      supabase.from("subscriptions").select("*").eq("user_id", user.id),
      supabase.from("coaching_logs").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile: profileRes.data,
      scans: scansRes.data ?? [],
      scam_checks: scamRes.data ?? [],
      badges: badgesRes.data ?? [],
      subscriptions: subsRes.data ?? [],
      coaching_logs: coachRes.data ?? [],
    };

    // FIX M2: Add rate limit header to discourage rapid re-exports
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="safewallet-export-${new Date().toISOString().split("T")[0]}.json"`,
        "Cache-Control": "private, max-age=60",
        "X-RateLimit-Limit": "1",
        "X-RateLimit-Window": "60s",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
