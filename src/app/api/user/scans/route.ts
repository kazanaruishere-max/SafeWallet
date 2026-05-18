import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiError, ScanHistoryItem } from "@/types/api";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    
    // Use admin client to bypass RLS for reading scan history
    const adminSupabase = createAdminClient();

    // Fetch health scans (use only columns from original schema)
    const { data: healthScans, error: healthError } = await adminSupabase
      .from("scans")
      .select("id, health_score, created_at, categories, recommendations")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch scam checks (use only columns from original schema)
    const { data: scamChecks, error: scamError } = await adminSupabase
      .from("scam_checks")
      .select("id, risk_score, created_at, red_flags, confidence")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (healthError) console.error("[History] Health scan fetch error:", healthError);
    if (scamError) console.error("[History] Scam check fetch error:", scamError);

    // Combine and sort by date
    const healthItems: ScanHistoryItem[] = (healthScans ?? []).map((s) => ({
      id: s.id,
      scan_type: "health" as const,
      health_score: s.health_score,
      created_at: s.created_at,
      categories: (s.categories as Record<string, number>) ?? {},
      recommendations: (s.recommendations as string[]) ?? {},
    }));

    const scamItems: ScanHistoryItem[] = (scamChecks ?? []).map((s) => ({
      id: s.id,
      scan_type: "scam" as const,
      health_score: 0, // Not applicable for scam checks
      created_at: s.created_at,
      categories: {},
      recommendations: [],
      risk_score: s.risk_score,
      verdict: s.risk_score >= 61 ? "HIGH_RISK" : s.risk_score >= 31 ? "CAUTION" : "SAFE",
      red_flags: (s.red_flags as Array<{ type: string; detail: string }>) ?? [],
    }));

    // Merge and sort by created_at descending
    const allItems = [...healthItems, ...scamItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = allItems.length;
    const offset = (page - 1) * limit;
    const paginatedItems = allItems.slice(offset, offset + limit);

    return NextResponse.json(
      {
        success: true,
        data: paginatedItems,
        meta: { page, total },
      } satisfies ApiResponse<ScanHistoryItem[]>,
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=10" } }
    );
  } catch (error) {
    console.error("Scan history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan." },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
