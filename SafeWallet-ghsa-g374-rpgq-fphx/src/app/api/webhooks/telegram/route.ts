import { NextResponse } from "next/server";
import { NATIONAL_AVERAGE_UMR } from "@/lib/constants/umr_data";
import { callAI } from "@/lib/ai/client";
import { FINANCIAL_COACHING_PROMPT } from "@/lib/ai/prompts";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // FIX H5: Verify Telegram webhook secret if configured
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    if (webhookSecret) {
      const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (headerSecret !== webhookSecret) {
        console.warn("[Telegram] Invalid webhook secret token");
        return NextResponse.json({ status: "unauthorized" }, { status: 403 });
      }
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

    console.log(`[Telegram] Message from ${userName} (${chatId}): ${userMessage}`);

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
        .select("id, email")
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

      await replyTelegram(chatId, `✅ Akun SafeWallet berhasil terhubung!\n\nHalo pemilik email **${userLink.email}**, Saku sekarang siap bantu analisa kesehatan keuangan kamu. Cobalah tanya: *"Saku, bagaimana kondisi skorku saat ini?"*`);
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
        { jsonMode: false, temperature: 0.7 }
      );
      
      aiResponseText = aiResponse.content;
    } catch (aiError) {
      console.error("[Telegram] Gemini AI Error:", aiError);
      aiResponseText = "Waduh, koneksi Saku ke otak utama lagi gangguan nih. Boleh diulang sebentar lagi? 🙏";
    }

    await replyTelegram(chatId, aiResponseText);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Telegram] Webhook critical error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

// Helper function to reply
async function replyTelegram(chatId: string, text: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!telegramToken) return;

  await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}
