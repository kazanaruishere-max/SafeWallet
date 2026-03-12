import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai/client";
import { FINANCIAL_COACHING_PROMPT } from "@/lib/ai/prompts";

/**
 * POST /api/webhooks/telegram
 * Handles incoming messages from Telegram Bot API
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a new message
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ status: "ok" });
    }

    const chatId = message.chat.id;
    const userMessage = message.text;
    const userName = message.from?.first_name || "Pemilik Dana";

    console.log(`[Telegram] Message from ${userName} (${chatId}): ${userMessage}`);

    // Call Gemini AI for coaching response
    let aiResponseText = "Halo! Maaf, Saku sedang sibuk menghitung angka. Coba lagi nanti ya 😊";
    let isError = false;

    try {
      const aiResponse = await callAI(
        [
          { role: "system", content: FINANCIAL_COACHING_PROMPT },
          { role: "user", content: `(Pesan dari ${userName}): ${userMessage}` }
        ],
        { jsonMode: false, temperature: 0.7 } // Higher temp for more conversational replies
      );
      
      aiResponseText = aiResponse.content;
    } catch (aiError) {
      console.error("[Telegram] Gemini AI Error:", aiError);
      isError = true;
    }

    // Send reply back to Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
      console.error("[Telegram] TELEGRAM_BOT_TOKEN is missing!");
      return NextResponse.json({ status: "error", message: "Token missing" }, { status: 500 });
    }

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: isError ? "Waduh, koneksi Saku ke otak utama lagi gangguan nih. Boleh diulang sebentar lagi? 🙏" : aiResponseText,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Telegram] Webhook critical error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
