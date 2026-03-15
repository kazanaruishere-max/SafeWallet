import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type AuditAction = 
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_DELETE"
  | "PROFILE_UPDATE"
  | "SUBSCRIPTION_UPDATE"
  | "SECURITY_EVENT"
  | "DATA_EXPORT";

/**
 * FIX M6: Audit Log Table Implementation
 * Utility for securely logging sensitive actions and data changes.
 */
export async function logAudit(
  userId: string,
  action: AuditAction,
  details: Record<string, any> = {},
  status: "SUCCESS" | "FAILED" = "SUCCESS"
) {
  try {
    // We use the admin client here if available to bypass RLS for inserting logs
    const supabase = await createClient();
    
    let ipAddress = "127.0.0.1";
    let userAgent = "Unknown";
    
    try {
      // Get request metadata
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "127.0.0.1";
      userAgent = headersList.get("user-agent") ?? "Unknown";
    } catch {
       // Ignore if headers() is called in a context where it's not allowed (e.g. background job)
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details,
      status,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    if (error) {
      // We don't throw here to avoid failing the main request if logging fails 
      // User might not have created the table yet.
      console.warn("[AuditLogger] Failed to save log (Have you created the SQL table?):", error.message);
    }
  } catch (error) {
    console.error("[AuditLogger] Fatal exception:", error);
  }
}
