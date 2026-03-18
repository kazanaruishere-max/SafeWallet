import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiError, DashboardData } from "@/types/api";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_REQUIRED", message: "Login terlebih dahulu." },
        } satisfies ApiError,
        { status: 401 }
      );
    }

    // FIX C8: Parallel queries instead of sequential
    const period = getCurrentPeriod();

    const [profileRes, latestScanRes, scanTrendRes, scamCountRes, badgesRes, usageRes] =
      await Promise.all([
        supabase
          .from("users")
          .select("email, subscription_tier, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("scans")
          .select("health_score, created_at, debt_to_income_ratio, savings_rate")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("scans")
          .select("health_score")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("scam_checks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("badges")
          .select("badge_type, badge_name, earned_at")
          .eq("user_id", user.id),
        supabase
          .from("usage_counts")
          .select("feature, count")
          .eq("user_id", user.id)
          .eq("period", period),
      ]);

    const profile = profileRes.data;
    const latestScan = latestScanRes.data;
    const scanTrend = scanTrendRes.data;
    const scamCount = scamCountRes.count;
    const badges = badgesRes.data;
    const usageData = usageRes.data;

    const scanUsage = usageData?.find((u) => u.feature === "scan")?.count ?? 0;
    const scamUsage = usageData?.find((u) => u.feature === "scam_check")?.count ?? 0;

    const tier = profile?.subscription_tier ?? "free";
    const scanLimit = tier === "free" ? 3 : 999999;
    const scamLimit = tier === "free" ? 5 : 999999;

    const result: DashboardData = {
      user: {
        email: profile?.email ?? user.email ?? "",
        subscription: tier,
        member_since: profile?.created_at ?? user.created_at ?? "",
      },
      latest_scan: latestScan
        ? {
            health_score: latestScan.health_score,
            date: latestScan.created_at,
            debt_to_income_ratio: latestScan.debt_to_income_ratio,
            savings_rate: latestScan.savings_rate,
          }
        : null,
      scan_trend: scanTrend?.map((s) => s.health_score).reverse() ?? [],
      scam_checks_count: scamCount ?? 0,
      badges:
        badges?.map((b) => ({
          type: b.badge_type,
          name: b.badge_name,
          earned_at: b.earned_at,
        })) ?? [],
      quota: {
        scans: { used: scanUsage, limit: scanLimit },
        scam_checks: { used: scamUsage, limit: scamLimit },
      },
    };

    // FIX M1: Add Cache-Control for browser-side caching
    return NextResponse.json(
      {
        success: true,
        data: result,
      } satisfies ApiResponse<DashboardData>,
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan." },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
