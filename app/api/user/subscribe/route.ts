import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types/api";

/**
 * POST /api/user/subscribe — Initiate subscription
 * See: API_SPECIFICATION.md § 3.4
 * 
 * In production, this integrates with Midtrans Snap for payment.
 * Currently returns a mock payment URL.
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

    // Create subscription record
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        tier,
        status: "active",
        payment_method: payment_method ?? "qris",
        amount,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // Update user tier
    await supabase
      .from("users")
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // In production: create Midtrans Snap transaction
    // const snapToken = await midtrans.createTransaction({...});
    // const paymentUrl = `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`;

    return NextResponse.json({
      success: true,
      data: {
        subscription_id: subscription?.id,
        payment_url: `https://app.midtrans.com/snap/v2/placeholder/${subscription?.id}`,
        expires_at: expiresAt.toISOString(),
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
