import { NextResponse } from "next/server";
import { routeAndExecuteAI } from "@/lib/ai/router";
import type { ApiError } from "@/types/api";

// Endpoint untuk diakses oleh Chrome Extension (Fase 4 Ekosistem)
export async function POST(request: Request) {
  try {
    // 1. Verifikasi Asal Request (CORS & Extension ID Check)
    // Dalam production, pastikan hanya dipanggil oleh Ekstensi SafeWallet yang sah
    const origin = request.headers.get("origin");
    if (process.env.NODE_ENV === "production" && origin !== `chrome-extension://${process.env.EXTENSION_ID}`) {
      // Untuk MVP kita abaikan dulu, tapi ini krusial untuk mencegah penyalahgunaan API
      console.warn(`Untrusted extension origin: ${origin}`);
    }

    const body = await request.json();
    const { url, pageContent } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "URL is required" } } satisfies ApiError,
        { status: 400 }
      );
    }

    // 2. Format Input Ekstensi menjadi Prompt
    // Chrome Extension biasanya mengambil teks dari <body> halaman web
    const promptContext = `
      Saya sedang mengunjungi URL: ${url}
      Ini adalah teks yang ada di dalam website tersebut (mungkin terpotong):
      "${pageContent ? pageContent.substring(0, 1500) : 'Tidak ada konten teks yang terbaca.'}"
      
      Tolong evaluasi apakah website ini adalah website Phishing atau penipuan.
    `;

    // 3. Analisis Menggunakan AI Router
    // Kita anggap umur pengguna standar (30) karena kita butuh respons JSON baku untuk ekstensi
    const aiResponse = await routeAndExecuteAI(promptContext, undefined, 30);
    const result = JSON.parse(aiResponse.content);

    // 4. Return ke Ekstensi
    return NextResponse.json({
      success: true,
      data: {
        url: url,
        verdict: result.verdict, // SAFE, CAUTION, HIGH_RISK
        risk_score: result.risk_score,
        red_flags: result.red_flags
      }
    });

  } catch (error: any) {
    console.error("[CHROME EXT] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Gagal menganalisis halaman web." } } satisfies ApiError,
      { status: 500 }
    );
  }
}
