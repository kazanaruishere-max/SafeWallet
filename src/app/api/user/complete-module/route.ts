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

    // Get existing modules
    const { data: profile } = await supabase
      .from("users")
      .select("modules_completed")
      .eq("id", user.id)
      .single();

    const modules = Array.isArray(profile?.modules_completed) ? profile.modules_completed : [];
    if (!modules.includes("debt-snowball-101")) {
       modules.push("debt-snowball-101");
    }

    // Update DB to release the lock
    const { error: dbErr } = await supabase
      .from("users")
      .update({ 
        needs_education_lock: false,
        modules_completed: modules
      })
      .eq("id", user.id);

    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete module error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal menyimpan progres modul." },
      } satisfies ApiError,
      { status: 500 }
    );
  }
}
