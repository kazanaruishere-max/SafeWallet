import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/router";
import type { ApiError } from "@/types/api";

// Fungsi rahasia ini HANYA bisa dijalankan oleh Vercel secara otomatis
export async function GET(request: Request) {
  try {
    // 1. VERIFIKASI KEAMANAN (Cegah Hacker menjalankan Cron Job manual)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Vercel Cron mengirimkan secret di Bearer token
    if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses Ditolak." } } satisfies ApiError,
        { status: 401 }
      );
    }

    console.log("[CRON] Memulai Sinkronisasi Pengetahuan OJK/Scam...");

    const supabase = createAdminClient(); // Menggunakan hak akses penuh (Service Role)

    // ====================================================================
    // SIMULASI PENGAMBILAN DATA (Dalam produksi ini akan me-request API OJK)
    // ====================================================================
    const newDataToIngest = [
      {
        source: "ojk_ilegal",
        name: "Koperasi Simpan Pinjam Fiktif",
        content: "Aplikasi pinjol ilegal berkedok Koperasi Simpan Pinjam (KSP). Meminta transfer biaya admin di awal sebelum pencairan dana. Biasa beriklan di Telegram."
      },
      {
        source: "scam_pattern",
        name: "APK Kurir Paket",
        content: "Modus penipuan dimana pelaku mengirimkan file dengan akhiran .apk melalui WhatsApp menyamar sebagai kurir paket (J&T, JNE). Jika diinstal, aplikasi akan mencuri kode OTP dan SMS dari HP korban."
      },
      {
        source: "edukasi",
        name: "Janji Return Tidak Masuk Akal",
        content: "Setiap tawaran investasi yang menjanjikan keuntungan pasti di atas 5% per bulan tanpa risiko adalah skema Ponzi atau penipuan finansial."
      }
    ];

    let insertedCount = 0;

    // 2. PROSES INGESTI (Otomatis setiap minggu)
    for (const item of newDataToIngest) {
      // Cek apakah data ini sudah ada di database untuk mencegah duplikasi
      const { data: existing } = await supabase
        .from("ojk_knowledge")
        .select("id")
        .eq("entity_name", item.name)
        .single();

      if (!existing) {
        // Jika belum ada, ubah teks menjadi Vektor Angka (Embeddings)
        const embedding = await generateEmbedding(item.content);

        // Masukkan ke Supabase Vector Database
        const { error } = await supabase.from("ojk_knowledge").insert({
          source_type: item.source,
          entity_name: item.name,
          content: item.content,
          embedding: embedding, // [0.0023, -0.0123, ...] (768 dimensi)
          metadata: { synced_at: new Date().toISOString() }
        });

        if (error) console.error("Gagal insert knowledge:", error);
        else insertedCount++;
      }
    }

    console.log(`[CRON] Sinkronisasi Selesai. ${insertedCount} data baru ditambahkan.`);

    return NextResponse.json({
      success: true,
      message: `Database Pengetahuan AI berhasil di-upgrade. Data baru masuk: ${insertedCount}`
    });

  } catch (error: any) {
    console.error("[CRON] Error sinkronisasi OJK:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } } satisfies ApiError,
      { status: 500 }
    );
  }
}
