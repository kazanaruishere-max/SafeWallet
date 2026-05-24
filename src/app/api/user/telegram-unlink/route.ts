import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

/**
 * POST /api/user/telegram-unlink
 * Disconnects the Telegram bot by clearing telegram_chat_id and telegram_link_code.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_REQUIRED", message: "Anda harus login." },
        } satisfies ApiError,
        { status: 401 }
      );
    }

    // Clear Telegram connection data
    const { error: dbErr } = await supabase
      .from("users")
      .update({
        telegram_chat_id: null,
        telegram_link_code: null,
      })
      .eq("id", user.id);

    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram unlink error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal memutuskan koneksi Telegram." },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
