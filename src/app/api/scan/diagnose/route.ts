import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Diagnostic endpoint to debug DB write/read issues.
 * Hit: /api/scan/diagnose to see exactly what's failing.
 * 
 * IMPORTANT: Remove this endpoint before going to production.
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env_check: {},
    auth_check: {},
    admin_client_check: {},
    write_test: {},
    read_test: {},
  };

  // 1. Check environment variables
  diagnostics.env_check = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
  };

  // 2. Check user auth
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    diagnostics.auth_check = {
      success: !!user,
      user_id: user?.id ?? null,
      error: error?.message ?? null,
    };

    if (!user) {
      return NextResponse.json({ diagnostics, message: "Not authenticated. Login first." });
    }

    // 3. Check admin client
    try {
      const adminSupabase = createAdminClient();
      
      // Test read with admin client
      const { data: readTest, error: readError } = await adminSupabase
        .from("scans")
        .select("id, health_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      diagnostics.admin_client_check = {
        success: true,
        read_result: {
          count: readTest?.length ?? 0,
          data: readTest ?? [],
          error: readError ? JSON.stringify(readError) : null,
        },
      };

      // 4. Test write with admin client — insert a test scan then delete it
      const testPayload = {
        user_id: user.id,
        image_url: "diagnostic-test",
        ocr_raw_text: "DIAGNOSTIC TEST - will be deleted",
        health_score: 99,
        categories: { "Test": 0 },
        recommendations: ["This is a diagnostic test"],
        processing_time_ms: 0,
      };

      const { data: writeResult, error: writeError } = await adminSupabase
        .from("scans")
        .insert(testPayload)
        .select("id")
        .single();

      if (writeError) {
        diagnostics.write_test = {
          success: false,
          error: JSON.stringify(writeError),
          error_code: (writeError as any).code,
          error_message: (writeError as any).message,
          error_details: (writeError as any).details,
          error_hint: (writeError as any).hint,
          payload_sent: Object.keys(testPayload),
        };

        // Try to figure out which column is the problem
        // Test with minimal payload
        const minimalPayload = {
          user_id: user.id,
          health_score: 99,
        };

        const { data: minWrite, error: minError } = await adminSupabase
          .from("scans")
          .insert(minimalPayload)
          .select("id")
          .single();

        diagnostics.write_test_minimal = {
          success: !minError,
          error: minError ? JSON.stringify(minError) : null,
          data: minWrite,
        };

        // Clean up minimal test if it succeeded
        if (minWrite?.id) {
          await adminSupabase.from("scans").delete().eq("id", minWrite.id);
          diagnostics.write_test_minimal_cleanup = "deleted";
        }
      } else {
        diagnostics.write_test = {
          success: true,
          inserted_id: writeResult?.id,
        };

        // Clean up test data
        if (writeResult?.id) {
          await adminSupabase.from("scans").delete().eq("id", writeResult.id);
          diagnostics.write_test_cleanup = "deleted";
        }
      }

      // 5. Also test scam_checks table
      const scamPayload = {
        user_id: user.id,
        input_type: "text",
        input_content: "DIAGNOSTIC TEST",
        risk_score: 0,
        confidence: "high",
        red_flags: [],
        safe_alternatives: [],
      };

      const { data: scamWrite, error: scamError } = await adminSupabase
        .from("scam_checks")
        .insert(scamPayload)
        .select("id")
        .single();

      diagnostics.scam_checks_write_test = {
        success: !scamError,
        error: scamError ? JSON.stringify(scamError) : null,
        inserted_id: scamWrite?.id,
      };

      if (scamWrite?.id) {
        await adminSupabase.from("scam_checks").delete().eq("id", scamWrite.id);
        diagnostics.scam_checks_cleanup = "deleted";
      }

      // 6. List actual table columns
      const { data: cols } = await adminSupabase.rpc("get_table_columns", { table_name: "scans" }).select("*");
      diagnostics.scans_columns = cols ?? "RPC not available";

    } catch (adminErr) {
      diagnostics.admin_client_check = {
        success: false,
        error: String(adminErr),
      };
    }

    // 7. Test read from history API perspective
    try {
      const adminSupabase = createAdminClient();
      
      const { data: historyScans, error: hErr } = await adminSupabase
        .from("scans")
        .select("id, health_score, created_at")
        .eq("user_id", user.id);

      const { data: historyScam, error: sErr } = await adminSupabase
        .from("scam_checks")
        .select("id, risk_score, created_at")
        .eq("user_id", user.id);

      diagnostics.read_test = {
        scans: { count: historyScans?.length ?? 0, error: hErr ? JSON.stringify(hErr) : null },
        scam_checks: { count: historyScam?.length ?? 0, error: sErr ? JSON.stringify(sErr) : null },
      };
    } catch (readErr) {
      diagnostics.read_test = { error: String(readErr) };
    }

  } catch (authErr) {
    diagnostics.auth_check = { error: String(authErr) };
  }

  return NextResponse.json({ diagnostics });
}
