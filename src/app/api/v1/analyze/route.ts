import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { routeAndExecuteAI } from "@/lib/ai/router";
import type { ApiError } from "@/types/api";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing x-api-key header" } } satisfies ApiError,
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 1. Validasi API Key
    const { data: clientData, error: dbError } = await supabase
      .from("api_keys")
      .select("id, company_name, usage_count, monthly_quota, is_active")
      .eq("api_key", apiKey)
      .single();

    if (dbError || !clientData || !clientData.is_active) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or inactive API Key" } } satisfies ApiError,
        { status: 401 }
      );
    }

    // 2. Validasi Kuota
    if (clientData.usage_count >= clientData.monthly_quota) {
      return NextResponse.json(
        { success: false, error: { code: "QUOTA_EXCEEDED", message: "Monthly API quota exceeded" } } satisfies ApiError,
        { status: 429 }
      );
    }

    // 3. Proses Request
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.length < 10) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Content must be a string with at least 10 characters." } } satisfies ApiError,
        { status: 400 }
      );
    }

    // 4. Analisis menggunakan AI Router (RAG + Intelligent Routing)
    // Untuk korporat, kita paksakan userAge 30 agar responsenya standar dan profesional (bukan bahasa anak/lansia)
    const aiResponse = await routeAndExecuteAI(content, undefined, 30);
    const result = JSON.parse(aiResponse.content);

    // 5. Kurangi Kuota (Update usage)
    await supabase.rpc('increment_api_usage', { key_id: clientData.id });

    return NextResponse.json({
      success: true,
      data: {
        analyzed_by: "SafeWallet B2B Enterprise API",
        client: clientData.company_name,
        result: result,
      }
    });

  } catch (error: any) {
    console.error("B2B API Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } } satisfies ApiError,
      { status: error.statusCode || 500 }
    );
  }
}
