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
  const requestId = crypto.randomUUID();
  try {
    const supabase = await createClient();
    
    let ipAddress = "127.0.0.1";
    let userAgent = "Unknown";
    
    try {
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for")?.split(',')[0] ?? 
                  headersList.get("x-real-ip") ?? 
                  "127.0.0.1";
      userAgent = headersList.get("user-agent") ?? "Unknown";
    } catch {
       // Ignore if headers() is called in a context where it's not allowed
    }

    // Structured logging for production observability
    console.log(JSON.stringify({
      level: "AUDIT",
      request_id: requestId,
      user_id: userId,
      action,
      status,
      timestamp: new Date().toISOString()
    }));

    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details: { ...details, request_id: requestId },
      status,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    if (error) {
      console.warn(`[AuditLogger][${requestId}] Failed to save log:`, error.message);
    }
  } catch (error) {
    console.error(`[AuditLogger][${requestId}] Fatal exception:`, error);
  }
}
