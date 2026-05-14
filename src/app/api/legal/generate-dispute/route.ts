import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, AIError } from "@/lib/ai/client";
import type { ApiError } from "@/types/api";

const LEGAL_PROMPT = `Anda adalah seorang Pengacara Finansial dan Ahli Hukum Siber di Indonesia (Setara partner firma hukum ternama).
Tugas Anda adalah membuat draf dokumen resmi (Laporan Kepolisian / Pemblokiran Bank / OJK) berdasarkan kronologi pengguna yang tertipu.

INSTRUKSI:
1. Gunakan bahasa hukum yang sangat kaku, formal, dan baku (Sesuai standar Bareskrim Polri atau OJK).
2. Jangan menambahkan komentar di luar isi surat. Langsung berikan hasil draf suratnya.
3. Cantumkan rujukan pasal jika relevan (misal: UU ITE, KUHP Pasal 378 tentang Penipuan).
4. Buat tempat kosong (seperti [Nama Anda], [Nomor KTP]) agar pengguna bisa mengisi sisa datanya.
5. Format draf dalam struktur yang rapi (Titik dua sejajar, ada perihal, lampiran, dan penutup hormat saya).`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Autentikasi & Cek Tier Premium (Fitur ini eksklusif)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login diperlukan." } } satisfies ApiError,
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    // (Opsional) Memaksa fitur ini hanya untuk Premium
    // if (profile?.subscription_tier === 'free') {
    //   return NextResponse.json({ success: false, error: { code: "UPGRADE_REQUIRED", message: "Fitur AI Pengacara hanya untuk pengguna Premium." } }, { status: 403 });
    // }

    // 2. Validasi Input
    const body = await request.json();
    const { chronology, dispute_type } = body;
    // dispute_type: "POLICE" | "BANK" | "OJK"

    if (!chronology || chronology.length < 20) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Kronologi harus jelas dan minimal 20 karakter." } } satisfies ApiError,
        { status: 400 }
      );
    }

    const typeLabel = dispute_type === "BANK" ? "Surat Permohonan Pemblokiran Rekening Bank" : 
                      dispute_type === "OJK" ? "Surat Pengaduan ke Satgas PASTI OJK" : 
                      "Laporan Polisi (Tindak Pidana Siber/Penipuan)";

    const userPrompt = `
      Buatkan saya draf: ${typeLabel}
      
      KRONOLOGI KEJADIAN:
      "${chronology}"
      
      Tolong susun drafnya sekarang.
    `;

    // 3. Proses AI (Menggunakan Gemini Pro karena butuh nalar bahasa tinggi)
    const aiResponse = await callAI(
      [
        { role: "system", content: LEGAL_PROMPT },
        { role: "user", content: userPrompt }
      ],
      { model: "gemini-2.0-flash", temperature: 0.1 } // Suhu rendah agar bahasanya baku/tidak berimajinasi
    );

    return NextResponse.json({
      success: true,
      data: {
        document_type: dispute_type,
        draft_content: aiResponse.content,
      }
    });

  } catch (error: any) {
    console.error("AI Legal Error:", error);
    const message = error instanceof AIError ? error.userMessage : "Gagal menyusun dokumen hukum.";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } } satisfies ApiError,
      { status: 500 }
    );
  }
}
