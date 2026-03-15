import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

// GET /api/user/profile
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

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // FIX M1: Add Cache-Control
    return NextResponse.json(
      { success: true, data: profile },
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login." } } satisfies ApiError,
        { status: 401 }
      );
    }

    const body = await request.json();
    const allowedFields = ["monthly_income", "phone", "onboarding_completed"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada field yang valid." } } satisfies ApiError,
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    // Log the profile update
    const { logAudit } = await import("@/lib/audit-logger");
    const updated_fields = Object.keys(updates).filter((k) => k !== "updated_at");
    await logAudit(user.id, "PROFILE_UPDATE", { fields: updated_fields }, "SUCCESS");

    return NextResponse.json({
      success: true,
      data: { updated_fields },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
