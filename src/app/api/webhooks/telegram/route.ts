import { NextResponse } from "next/server";
import { NATIONAL_AVERAGE_UMR } from "@/lib/constants/umr_data";
import { callAI } from "@/lib/ai/client";
import { FINANCIAL_COACHING_PROMPT } from "@/lib/ai/prompts";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskIdentifier, redactForLog } from "@/lib/security/logging";

export async function POST(request: Request) {
  try {
    // SECURITY: Telegram webhook secret is MANDATORY.
    // Set TELEGRAM_WEBHOOK_SECRET in your environment variables.
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      console.error("[Telegram] TELEGRAM_WEBHOOK_SECRET is not configured — all webhook requests rejected");
      return NextResponse.json({ status: "misconfigured" }, { status: 500 });
    }

    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== webhookSecret) {
      console.warn("[Telegram] Invalid webhook secret token — unauthorized request blocked");
      return NextResponse.json({ status: "unauthorized" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const body = await request.json();

    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ status: "ok" });
    }

    const chatId = message.chat.id.toString();
    const userMessage = message.text.trim();
    const userName = message.from?.first_name || "Pengguna Baru";

    // SECURITY: Only log metadata, never log message content (may contain financial data)
    console.log(`[Telegram] Incoming message from chatId=${maskIdentifier(chatId)}, length=${userMessage.length}`);

    // --- 1. HANDLE /link COMMAND ---
    if (userMessage.startsWith("/link ")) {
      const code = userMessage.split(" ")[1];
      
      if (!code) {
        await replyTelegram(chatId, "Format salah. Gunakan `/link KODE`");
        return NextResponse.json({ status: "ok" });
      }

      // Find user with this code
      const { data: userLink } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_link_code", code)
        .single();

      if (!userLink) {
        await replyTelegram(chatId, "❌ Kode tidak valid atau sudah kadaluwarsa.");
        return NextResponse.json({ status: "ok" });
      }

      // Update user with chat_id and clear the code
      const { error } = await supabase
        .from("users")
        .update({ 
          telegram_chat_id: chatId,
          telegram_link_code: null 
        })
        .eq("id", userLink.id);

      if (error) {
        await replyTelegram(chatId, "❌ Terjadi kesalahan sistem saat menghubungkan akun.");
        return NextResponse.json({ status: "ok" });
      }

      await replyTelegram(chatId, `✅ Akun SafeWallet berhasil terhubung!\n\nSaku sekarang siap bantu analisa kesehatan keuangan kamu. Cobalah tanya: *"Saku, bagaimana kondisi skorku saat ini?"*`);
      return NextResponse.json({ status: "ok" });
    }

    // --- 2. REGULAR CHAT (RAG Context Injection) ---
    // Check if telegram account is linked
    const { data: linkInfo } = await supabase
      .from("users")
      .select("id, monthly_income")
      .eq("telegram_chat_id", chatId)
      .single();

    let ragContext = "";
    
    // If linked, fetch newest health scan
    if (linkInfo) {
      const { data: latestScan } = await supabase
        .from("scans")
        .select("health_score, categories, created_at")
        .eq("user_id", linkInfo.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      ragContext += `\n\n[CONTEXT INVISIBLE TO USER - FOR AI ONLY]`;
      ragContext += `\n- Akun user ini SUDAH TERSAMBUNG ke sistem SafeWallet.`;
      if (linkInfo.monthly_income) {
        ragContext += `\n- Gaji bulanan user: Rp ${linkInfo.monthly_income.toLocaleString("id-ID")}`;
        if (linkInfo.monthly_income < NATIONAL_AVERAGE_UMR) {
          ragContext += `\n[SISTEM ALERT: Pendapatan user di bawah batas UMR (Rp 3,2 Juta). JANGAN MENYARANKAN INVESTASI RISIKO TINGGI. AKTIFKAN MODE SIDE-HUSTLE MATCHMAKER: Berikan 1-2 rekomendasi kerja sampingan lepasan (freelance, affiliate, admin sosmed, dll) yang nyata, tanpa modal, dan bisa dikerjakan dari HP untuk menambah income.]`;
        }
      }
      if (latestScan) {
        ragContext += `\n- Hasil Health Scanner Terakhir (${new Date(latestScan.created_at).toLocaleDateString()}):`;
        ragContext += `\n  * Health Score: ${latestScan.health_score}/100`;
        ragContext += `\n  * Kategori Pengeluaran: ${JSON.stringify(latestScan.categories)}`;
      } else {
        ragContext += `\n- User belum pernah melakukan scan data mutasi sama sekali.`;
      }
      ragContext += `\n[END CONTEXT] - Jawablah chat user berikut berdasarkan context di atas jika relevan. Jika tidak relevan, jawab seperti biasa.`;
    } else {
      ragContext += `\n\n[CONTEXT INVISIBLE TO USER - FOR AI ONLY]`;
      ragContext += `\n- User ini BELUM menyambungkan akun Telegramnya ke SafeWallet. Sarankan mereka untuk login ke website, buka menu Profil, dan klik Integrasi Bot Telegram untuk mendapatkan kode /link.`;
      ragContext += `\n[END CONTEXT]`;
    }

    // Call AI
    let aiResponseText = "Halo! Maaf, Saku sedang sibuk menghitung angka. Coba lagi nanti ya 😊";

    try {
      const aiResponse = await callAI(
        [
          { role: "system", content: FINANCIAL_COACHING_PROMPT + ragContext },
          { role: "user", content: `(Pesan dari ${userName}): ${userMessage}` }
        ],
        { model: "llama-3.1-8b-instant", jsonMode: false, temperature: 0.7 }
      );
      
      aiResponseText = aiResponse.content;
    } catch (aiError) {
      console.error("[Telegram] Groq AI Error:", redactForLog(aiError));
      aiResponseText = "Waduh, koneksi Saku ke otak utama lagi gangguan nih. Boleh diulang sebentar lagi? 🙏";
    }

    await replyTelegram(chatId, aiResponseText);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Telegram] Webhook critical error:", redactForLog(error));
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

// Helper function to escape HTML special characters for Telegram HTML parse_mode
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper function to convert safe markdown to HTML for Telegram
function markdownToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/_(.*?)_/g, "<i>$1</i>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

// Helper function to reply to Telegram safely with logs and fallbacks
async function replyTelegram(chatId: string, text: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!telegramToken) {
    console.error("[Telegram] TELEGRAM_BOT_TOKEN is not configured — reply canceled");
    return;
  }

  const htmlText = markdownToHtml(text);

  try {
    // 1. Try sending with HTML formatting (modern, highly robust and structured)
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json() as any;

    if (!response.ok || !result.ok) {
      console.warn(`[Telegram] HTML sendMessage failed (Status ${response.status}):`, JSON.stringify(result));
      console.warn("[Telegram] Falling back to plain text delivery...");

      // 2. Fallback: Send as plain text (guaranteed to succeed regardless of any formatting issues)
      const fallbackResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text, // raw text without parse_mode
        }),
      });

      const fallbackResult = await fallbackResponse.json() as any;
      if (!fallbackResponse.ok || !fallbackResult.ok) {
        console.error(`[Telegram] Plain text fallback sendMessage also failed (Status ${fallbackResponse.status}):`, JSON.stringify(fallbackResult));
      } else {
        console.log("[Telegram] Plain text fallback message delivered successfully!");
      }
    } else {
      console.log(`[Telegram] Message delivered successfully using HTML parse_mode (message_id=${result.result?.message_id})`);
    }
  } catch (err) {
    console.error("[Telegram] replyTelegram critical fetch error:", redactForLog(err));
  }
}
