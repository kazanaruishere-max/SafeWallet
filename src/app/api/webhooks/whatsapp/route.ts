import { NextResponse } from "next/server";
import { routeAndExecuteAI } from "@/lib/ai/router";
import type { ApiError } from "@/types/api";

// Endpoint untuk menerima webhook dari Meta WhatsApp Cloud API
export async function POST(request: Request) {
  try {
    // 1. Verifikasi Signature Meta WA (Keamanan)
    // Dalam production, harus memverifikasi x-hub-signature
    
    const body = await request.json();

    // Pastikan ini adalah pesan masuk (bukan status update)
    if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const waMessage = body.entry[0].changes[0].value.messages[0];
      const senderPhone = waMessage.from;
      
      // Ambil teks dari pesan
      let messageContent = "";
      if (waMessage.type === "text") {
        messageContent = waMessage.text.body;
      } else {
        // Untuk MVP, kita abaikan gambar/dokumen.
        return NextResponse.json({ success: true, message: "Only text supported for now" });
      }

      console.log(`[WA BOT] Menerima pesan dari ${senderPhone}`);

      // 2. Kirim pesan ke AI Router
      // Kita paksakan userAge 65 (Lansia) agar jawaban bot WA selalu simpel dan sopan
      const aiResponse = await routeAndExecuteAI(messageContent, undefined, 65);
      const result = JSON.parse(aiResponse.content);

      // 3. Bangun balasan WhatsApp
      let replyText = "";
      if (result.verdict === "HIGH_RISK") {
        replyText = `🚨 *PERINGATAN BAHAYA* 🚨\n\nBapak/Ibu, berhati-hatilah! Pesan yang Anda kirimkan terindikasi sebagai *PENIPUAN*.\n\n*Alasan:* ${result.red_flags[0] || 'Modus pencurian data/uang.'}\n\n*Saran:* JANGAN klik link apapun dan langsung blokir nomor pengirimnya ya!`;
      } else if (result.verdict === "CAUTION") {
        replyText = `⚠️ *HATI-HATI* ⚠️\n\nBapak/Ibu, pesan ini terlihat *mencurigakan*. Mohon jangan mudah percaya jika ada yang meminta transfer uang atau kode rahasia (OTP). Cek kembali kebenarannya.`;
      } else {
        replyText = `✅ *AMAN* ✅\n\nSejauh pemindaian kami, pesan ini terlihat aman. Namun tetap waspada dan jangan pernah membagikan password atau PIN kepada siapapun.`;
      }

      // 4. Kirim Balasan via Meta API
      const metaToken = process.env.WHATSAPP_API_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

      if (metaToken && phoneNumberId) {
        await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${metaToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: senderPhone,
            type: "text",
            text: { body: replyText }
          })
        });
      }

      return NextResponse.json({ success: true });
    }

    // Jika pesan bukan dari user (misal pesan otomatis sistem), kembalikan 200 agar WA tidak retry
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[WA BOT] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Webhook failed" } } satisfies ApiError,
      { status: 500 }
    );
  }
}

// WA Webhook Verification Method (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}
