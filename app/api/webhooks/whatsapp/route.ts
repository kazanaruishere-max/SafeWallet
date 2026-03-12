import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/whatsapp — WhatsApp Business API webhook
 * GET  /api/webhooks/whatsapp — Webhook verification (Meta requires this)
 * See: API_SPECIFICATION.md § 3.5, ADR/006-whatsapp-api.md
 */

// GET — Meta webhook verification challenge
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? "safewallet_verify_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — Incoming message handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify X-Hub-Signature-256 header
    // const signature = request.headers.get('X-Hub-Signature-256');

    // Extract message from Meta Cloud API payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from; // Phone number
      const text = message.text?.body;

      console.log(`[WhatsApp] Message from ${from}: ${text}`);

      // TODO: Process incoming message
      // - Parse coaching commands
      // - Respond with AI-generated financial tips
      // - Track user engagement
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
