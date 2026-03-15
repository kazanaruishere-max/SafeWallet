import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiError } from "@/types/api";

/**
 * DELETE /api/user/delete — Delete user account and all data
 * UU PDP: Right to Erasure
 *
 * FIX C4: Requires password confirmation. Uses admin client for complete deletion.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login." } } satisfies ApiError,
        { status: 401 }
      );
    }

    // --- C4 FIX: Require password confirmation ---
    let body: { password?: string } = {};
    try {
      body = await request.json();
    } catch {
      // No body provided
    }

    if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIRMATION_REQUIRED",
            message: "Masukkan password Anda untuk mengkonfirmasi penghapusan akun.",
          },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // Verify password by attempting sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: body.password,
    });

    if (verifyError) {
      const { logAudit } = await import("@/lib/audit-logger");
      await logAudit(user.id, "USER_DELETE", { reason: "Konfirmasi password gagal" }, "FAILED");
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PASSWORD",
            message: "Password salah. Penghapusan akun dibatalkan.",
          },
        } satisfies ApiError,
        { status: 403 }
      );
    }

    const { logAudit } = await import("@/lib/audit-logger");
    await logAudit(user.id, "USER_DELETE", { email: user.email }, "SUCCESS");

    // --- Use admin client to bypass RLS for complete deletion ---
    const adminSupabase = createAdminClient();

    // Delete all user data in order (respect foreign keys)
    await Promise.all([
      adminSupabase.from("coaching_logs").delete().eq("user_id", user.id),
      adminSupabase.from("usage_counts").delete().eq("user_id", user.id),
      adminSupabase.from("badges").delete().eq("user_id", user.id),
    ]);

    await Promise.all([
      adminSupabase.from("scans").delete().eq("user_id", user.id),
      adminSupabase.from("scam_checks").delete().eq("user_id", user.id),
      adminSupabase.from("subscriptions").delete().eq("user_id", user.id),
    ]);

    // Delete user profile
    await adminSupabase.from("users").delete().eq("id", user.id);

    // Delete auth user via admin API
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error("[Delete] Failed to delete auth user:", authDeleteError);
    }

    // Sign out current session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      data: { message: "Akun dan semua data berhasil dihapus secara permanen." },
    });
  } catch (error) {
    console.error("[Delete] Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Gagal menghapus akun." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
