import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDailyTip } from "@/lib/coaching";

/**
 * POST /api/cron/coaching — Daily coaching trigger
 * See: API_SPECIFICATION.md § 3.5
 *
 * Called by Vercel Cron or Cloudflare Workers on schedule.
 * Generates daily tips and logs them for users.
 */
export async function POST(request: Request) {
  try {
    // FIX C2: ALWAYS verify cron secret — reject if missing
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cron] CRON_SECRET environment variable is NOT configured");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron] Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Generate today's tip
    const tip = await generateDailyTip();

    // Get active premium users who opted into coaching
    const { data: users } = await supabase
      .from("users")
      .select("id, phone")
      .in("subscription_tier", ["premium", "family"])
      .not("phone", "is", null);

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: { message: "No eligible users", sent: 0 },
      });
    }

    // Log coaching messages
    const logs = users.map((u) => ({
      user_id: u.id,
      channel: "whatsapp" as const,
      message_type: "tip" as const,
      content: tip.message,
      delivered: false,
    }));

    const { error } = await supabase.from("coaching_logs").insert(logs);

    if (error) {
      console.error("Failed to log coaching:", error);
    }

    // TODO: Send via WhatsApp Business API
    // for (const user of users) {
    //   if (user.phone) {
    //     await sendWhatsAppMessage(user.phone, tip.message);
    //   }
    // }

    return NextResponse.json({
      success: true,
      data: {
        message: tip.message,
        category: tip.category,
        sent: users.length,
      },
    });
  } catch (error) {
    console.error("Cron coaching error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
