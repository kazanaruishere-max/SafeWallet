import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/midtrans — Midtrans Payment Notification
 * See: API_SPECIFICATION.md § 3.5
 *
 * Midtrans sends payment status updates here.
 * Verify signature before processing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify Midtrans signature
    // const serverKey = process.env.MIDTRANS_SERVER_KEY;
    // const expectedSignature = crypto
    //   .createHash('sha512')
    //   .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
    //   .digest('hex');

    const { order_id, transaction_status } = body;

    console.log(`[Midtrans Webhook] Order: ${order_id}, Status: ${transaction_status}`);

    // Handle payment status
    switch (transaction_status) {
      case "capture":
      case "settlement":
        // Payment successful — activate subscription
        // await activateSubscription(order_id);
        console.log(`[Midtrans] Payment success: ${order_id}`);
        break;

      case "deny":
      case "cancel":
      case "expire":
        // Payment failed — cancel subscription
        // await cancelSubscription(order_id);
        console.log(`[Midtrans] Payment failed: ${order_id}`);
        break;

      case "pending":
        console.log(`[Midtrans] Payment pending: ${order_id}`);
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
