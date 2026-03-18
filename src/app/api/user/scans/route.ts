import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const offset = (page - 1) * limit;

    // Get total count
    const { count: total } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get scans
    const { data: scans, error } = await supabase
      .from("scans")
      .select("id, health_score, created_at, categories, recommendations, blockchain_tx_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const items: ScanHistoryItem[] =
      scans?.map((s) => ({
        id: s.id,
        health_score: s.health_score,
        created_at: s.created_at,
        categories: (s.categories as Record<string, number>) ?? {},
        recommendations: (s.recommendations as string[]) ?? [],
        blockchain_tx_id: s.blockchain_tx_id,
      })) ?? [];

    // FIX M1: Add Cache-Control
    return NextResponse.json(
      {
        success: true,
        data: items,
        meta: { page, total: total ?? 0 },
      } satisfies ApiResponse<ScanHistoryItem[]>,
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=60" } }
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
