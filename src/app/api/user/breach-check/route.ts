import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import type { ApiError } from "@/types/api";

type BreachDetail = {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
  Description: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Autentikasi Pengguna
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Silakan login terlebih dahulu." } } satisfies ApiError,
        { status: 401 }
      );
    }

    // 2. Proteksi Spam (Rate Limiting)
    let quotaInfo;
    try {
      const { incrementQuotaAtomic } = await import("@/lib/rate-limit");
      // Batasi scan per hari/bulan berdasarkan tier di rate-limit.ts
      quotaInfo = await incrementQuotaAtomic(user.id, "breach_check");
      if (!quotaInfo.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              message: "Batas 3 cek kebocoran data per hari telah tercapai.",
              details: { current: quotaInfo.used, limit: quotaInfo.limit },
            },
          } satisfies ApiError,
          { status: 429 }
        );
      }
    } catch (quotaErr) {
      console.error("[BreachCheck] Quota system unavailable:", quotaErr);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUOTA_SYSTEM_UNAVAILABLE",
            message: "Sistem kuota sedang tidak tersedia. Coba lagi dalam beberapa saat.",
          },
        } satisfies ApiError,
        { status: 503 }
      );
    }

    // 3. Validasi Input
    const body = await request.json();
    const { email_or_phone } = body;

    if (!email_or_phone || typeof email_or_phone !== "string" || email_or_phone.length < 5) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Email atau Nomor HP tidak valid." } } satisfies ApiError,
        { status: 400 }
      );
    }

    // Hash data privasi sebelum disimpan ke DB (Prinsip Zero-Trust)
    const hashedQuery = crypto.createHash("sha256").update(email_or_phone.toLowerCase()).digest("hex");

    // 4. Proses Pengecekan (MOCK API untuk MVP)
    // Di tahap produksi, bagian ini akan diganti dengan `fetch('https://haveibeenpwned.com/api/v3/breachedaccount/...', { headers: { 'hibp-api-key': process.env.HIBP_API_KEY } })`
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi network delay
    
    // Algoritma Mock sederhana: Jika email mengandung "bocor", kita buat seolah-olah bocor.
    let breachCount = 0;
    let breachDetails: BreachDetail[] = [];
    
    const isMockLeaked = email_or_phone.includes("bocor") || email_or_phone.includes("test");
    
    if (isMockLeaked) {
      breachCount = 2;
      breachDetails = [
        {
          Name: "Tokopedia (Simulasi)",
          Title: "Data Breach 2020",
          Domain: "tokopedia.com",
          BreachDate: "2020-04-17",
          DataClasses: ["Email addresses", "Passwords", "Names", "Phone numbers"],
          Description: "Pada tahun 2020, data jutaan pengguna e-commerce diretas."
        },
        {
          Name: "Canva (Simulasi)",
          Title: "Data Breach 2019",
          Domain: "canva.com",
          BreachDate: "2019-05-24",
          DataClasses: ["Email addresses", "Passwords", "Locations"],
          Description: "Sistem desain grafis online diretas."
        }
      ];
    }

    // 5. Simpan Hasil ke Database (Secara Anonim/Hashed)
    const { error: insertError } = await supabase
      .from("breach_scans")
      .insert({
        user_id: user.id,
        search_query: hashedQuery, // Hanya menyimpan Hash!
        breach_count: breachCount,
        breach_details: breachDetails
      });

    if (insertError) {
      console.error("Gagal menyimpan riwayat breach:", insertError);
    }

    // 6. Kembalikan Respon
    return NextResponse.json({
      success: true,
      data: {
        is_breached: breachCount > 0,
        breach_count: breachCount,
        details: breachDetails,
        advice: breachCount > 0 
          ? "SEGERA ganti password Anda dan aktifkan 2-Factor Authentication (2FA) di semua akun yang terhubung dengan email ini!" 
          : "Selamat! Data Anda sejauh ini aman dari kebocoran yang diketahui publik."
      },
      meta: { remaining_quota: quotaInfo?.remaining ?? 0 },
    });

  } catch (error) {
    console.error("Breach Check API Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Gagal memproses pengecekan." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
