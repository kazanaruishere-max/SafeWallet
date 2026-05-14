#!/usr/bin/env node
/**
 * SafeWallet — Telegram Webhook Registration Script
 * 
 * Cara pakai:
 *   node scripts/setup-telegram-webhook.js
 * 
 * Script ini mendaftarkan URL webhook + secret_token ke Telegram API.
 * Jalankan sekali setelah deploy ke production (atau setiap kali URL berubah).
 */

// ─── KONFIGURASI — sesuaikan dengan environment Anda ───────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8782857316:AAE2w07aAE1rsPRVAOhS7ixHm0nNu6sHLZY";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "9c5cb1231fa12b8838a2af67cf6abef62c21dbdfcf7aeb5c275d83b23ec1688c";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"; // ← Ganti dengan URL production Anda
// ────────────────────────────────────────────────────────────────────────────

const WEBHOOK_URL = `${APP_URL}/api/webhooks/telegram`;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function main() {
  console.log("🤖 SafeWallet — Telegram Webhook Setup");
  console.log("=".repeat(50));
  console.log(`📡 Webhook URL : ${WEBHOOK_URL}`);
  console.log(`🔐 Secret      : ${WEBHOOK_SECRET.substring(0, 8)}...${WEBHOOK_SECRET.slice(-4)}`);
  console.log("");

  // 1. Cek info bot dulu
  console.log("1️⃣  Mengecek info bot...");
  const meRes = await fetch(`${TELEGRAM_API}/getMe`);
  const me = await meRes.json();

  if (!me.ok) {
    console.error("❌ BOT_TOKEN tidak valid:", me.description);
    process.exit(1);
  }

  console.log(`   ✅ Bot: @${me.result.username} (${me.result.first_name})`);
  console.log("");

  // 2. Set webhook
  console.log("2️⃣  Mendaftarkan webhook ke Telegram...");
  const setRes = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      secret_token: WEBHOOK_SECRET,        // ← Inilah yang membuat Telegram mengirim header secret
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,          // Buang pesan lama saat restart
    }),
  });

  const setResult = await setRes.json();

  if (!setResult.ok) {
    console.error("❌ Gagal set webhook:", setResult.description);
    console.error("   Pastikan APP_URL sudah benar dan bisa diakses dari internet (HTTPS).");
    process.exit(1);
  }

  console.log(`   ✅ ${setResult.description}`);
  console.log("");

  // 3. Verifikasi webhook terdaftar
  console.log("3️⃣  Memverifikasi webhook...");
  const infoRes = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
  const info = await infoRes.json();

  if (info.ok) {
    const w = info.result;
    console.log(`   📡 URL            : ${w.url}`);
    console.log(`   🔐 Has Secret     : ${w.has_custom_certificate ? "Ya (custom cert)" : "Ya (via secret_token)"}`);
    console.log(`   ⏱️  Last Error     : ${w.last_error_message || "Tidak ada"}`);
    console.log(`   📨 Pending Updates: ${w.pending_update_count}`);
  }

  console.log("");
  console.log("✅ SELESAI! Telegram sekarang akan mengirim update ke:");
  console.log(`   ${WEBHOOK_URL}`);
  console.log("");
  console.log("💡 Tips:");
  console.log("   - Setiap request dari Telegram akan menyertakan header:");
  console.log("     X-Telegram-Bot-Api-Secret-Token: " + WEBHOOK_SECRET.substring(0, 8) + "...");
  console.log("   - Server SafeWallet akan verifikasi header ini otomatis.");
  console.log("   - Untuk menghapus webhook: node scripts/setup-telegram-webhook.js --delete");
}

// Handle --delete flag
if (process.argv.includes("--delete")) {
  console.log("🗑️  Menghapus webhook Telegram...");
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, { method: "POST" })
    .then((r) => r.json())
    .then((r) => {
      if (r.ok) console.log("✅ Webhook berhasil dihapus.");
      else console.error("❌ Gagal:", r.description);
    });
} else {
  main().catch((err) => {
    console.error("❌ Error tidak terduga:", err.message);
    process.exit(1);
  });
}
