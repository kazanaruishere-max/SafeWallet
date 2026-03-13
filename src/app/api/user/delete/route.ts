import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

/**
 * DELETE /api/user/delete — Delete user account and all data
 * UU PDP: Right to Erasure
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login." } } satisfies ApiError,
        { status: 401 }
      );
    }

    // Delete all user data in order (respect foreign keys)
    await Promise.all([
      supabase.from("coaching_logs").delete().eq("user_id", user.id),
      supabase.from("usage_counts").delete().eq("user_id", user.id),
      supabase.from("badges").delete().eq("user_id", user.id),
    ]);

    await Promise.all([
      supabase.from("scans").delete().eq("user_id", user.id),
      supabase.from("scam_checks").delete().eq("user_id", user.id),
      supabase.from("subscriptions").delete().eq("user_id", user.id),
    ]);

    // Delete user profile
    await supabase.from("users").delete().eq("id", user.id);

    // Sign out
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      data: { message: "Akun dan semua data berhasil dihapus." },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
