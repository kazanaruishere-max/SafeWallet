import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * POST /api/webhooks/midtrans — Midtrans Payment Notification
 * FIX C1: Signature verification now ENFORCED.
 *
 * Midtrans sends payment status updates here.
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- SIGNATURE VERIFICATION (C1 FIX) ---
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[Midtrans] MIDTRANS_SERVER_KEY not configured");
      return NextResponse.json({ status: "error", message: "Server misconfigured" }, { status: 500 });
    }

    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      console.warn("[Midtrans] Missing required fields in webhook body");
      return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error(`[Midtrans] Signature mismatch for order ${order_id}`);
      return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 403 });
    }

    console.log(`[Midtrans] Verified webhook — Order: ${order_id}, Status: ${transaction_status}`);

    // --- HANDLE PAYMENT STATUS ---
    const supabase = createAdminClient();

    switch (transaction_status) {
      case "capture":
      case "settlement": {
        // Payment successful — activate subscription
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "active", activated_at: new Date().toISOString() })
          .eq("order_id", order_id);

        if (error) console.error(`[Midtrans] Failed to activate subscription: ${order_id}`, error);
        else console.log(`[Midtrans] Subscription activated: ${order_id}`);
        break;
      }

      case "deny":
      case "cancel":
      case "expire": {
        // Payment failed — cancel subscription
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("order_id", order_id);

        if (error) console.error(`[Midtrans] Failed to cancel subscription: ${order_id}`, error);
        else console.log(`[Midtrans] Subscription cancelled: ${order_id}`);
        break;
      }

      case "pending":
        console.log(`[Midtrans] Payment pending: ${order_id}`);
        break;

      default:
        console.warn(`[Midtrans] Unknown transaction_status: ${transaction_status}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Midtrans] Webhook critical error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
