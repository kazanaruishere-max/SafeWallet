/**
 * Daily Coaching Message Generator
 * See: SafeWallet-PRD-v2.md § AI Coach
 */

import { callAI } from "@/lib/ai/client";

const COACHING_SYSTEM_PROMPT = `Kamu adalah AI financial coach Indonesia yang ramah dan suportif.
Tugasmu: buat satu tips keuangan harian yang singkat, praktis, dan memotivasi.

ATURAN:
- Maksimal 2 kalimat
- Bahasa Indonesia informal yang ramah
- Relevan untuk anak muda Indonesia (22-35 tahun)
- Sertakan emoji yang relevan
- Variasi topik: budgeting, saving, investing, anti-scam, utang, dana darurat

OUTPUT FORMAT (JSON):
{
  "message": "Tips singkat di sini",
  "category": "budgeting|saving|investing|anti_scam|debt|emergency_fund",
  "emoji": "emoji utama"
}`;

const DAILY_TOPICS = [
  "Tips hemat belanja online hari ini",
  "Cara menabung walau gaji pas-pasan",
  "Tanda-tanda investasi bodong",
  "Pentingnya dana darurat 6 bulan",
  "Cara keluar dari jerat pinjol/utang",
  "Investasi aman untuk pemula",
  "Budget 50-30-20 rule",
  "Cara tracking pengeluaran harian",
  "Generasi sandwich: kelola keuangan keluarga",
  "Kapan waktu yang tepat beli rumah pertama",
];

export async function generateDailyTip(): Promise<{
  message: string;
  category: string;
}> {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const topic = DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];

  try {
    const response = await callAI(
      [
        { role: "system", content: COACHING_SYSTEM_PROMPT },
        { role: "user", content: `Topik hari ini: ${topic}` },
      ],
      { jsonMode: true, temperature: 0.7, maxTokens: 200 }
    );

    const result = JSON.parse(response.content);
    return {
      message: result.message ?? "💡 Catat pengeluaranmu hari ini, mulai dari yang kecil!",
      category: result.category ?? "budgeting",
    };
  } catch {
    // Fallback tip if AI fails
    return {
      message: "💡 Jangan lupa catat pengeluaranmu hari ini! Mulai dari yang kecil, konsisten adalah kunci. 💪",
      category: "budgeting",
    };
  }
}
