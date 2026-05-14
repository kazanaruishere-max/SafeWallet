import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

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

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    const { error: dbErr } = await supabase
      .from("users")
      .update({ telegram_link_code: code })
      .eq("id", user.id);

    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Telegram link code error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal membuat kode penghubung Telegram." },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
