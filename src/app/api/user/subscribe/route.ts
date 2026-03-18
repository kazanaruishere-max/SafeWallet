import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

/**
 * POST /api/user/subscribe — Initiate subscription
 * FIX C7: Don't auto-activate — set to pending until webhook confirms.
 */
export async function POST(request: NextRequest) {
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
    const { tier, payment_method } = body;

    if (!tier || !["premium", "family"].includes(tier)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: 'Tier harus "premium" atau "family".' },
        } satisfies ApiError,
        { status: 400 }
      );
    }

    const amount = tier === "premium" ? 29000 : 79000;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // FIX C7: Status is "pending" — only activated by Midtrans webhook
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        tier,
        status: "pending",
        payment_method: payment_method ?? "qris",
        amount,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // NOTE: User tier is NOT updated here.
    // It will be updated when Midtrans webhook confirms payment.
    // See: app/api/webhooks/midtrans/route.ts

    return NextResponse.json({
      success: true,
      data: {
        subscription_id: subscription?.id,
        payment_url: `https://app.midtrans.com/snap/v2/placeholder/${subscription?.id}`,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
