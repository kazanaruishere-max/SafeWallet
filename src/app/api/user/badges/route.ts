import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BADGE_DEFINITIONS, checkAndAwardBadges } from "@/lib/gamification";
import type { ApiError } from "@/types/api";

// GET /api/user/badges — List all badges (earned + available)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login terlebih dahulu." } } satisfies ApiError,
        { status: 401 }
      );
    }

    // Get earned badges
    const { data: earned } = await supabase
      .from("badges")
      .select("badge_type, badge_name, earned_at")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    const earnedTypes = new Set(earned?.map((b) => b.badge_type) ?? []);

    // Build complete badge list
    const badges = BADGE_DEFINITIONS.map((def) => ({
      type: def.type,
      name: def.name,
      description: def.description,
      emoji: def.emoji,
      earned: earnedTypes.has(def.type),
      earned_at: earned?.find((b) => b.badge_type === def.type)?.earned_at ?? null,
    }));

    // FIX M1: Add Cache-Control — badges change infrequently
    return NextResponse.json(
      { success: true, data: badges },
      { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Badges error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan." } } satisfies ApiError,
      { status: 500 }
    );
  }
}

// POST /api/user/badges — Trigger badge check (called after scan/scam)
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login." } } satisfies ApiError,
        { status: 401 }
      );
    }

    const newBadges = await checkAndAwardBadges(user.id);

    return NextResponse.json({
      success: true,
      data: {
        new_badges: newBadges,
        count: newBadges.length,
      },
    });
  } catch (error) {
    console.error("Badge check error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
