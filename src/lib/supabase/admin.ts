import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the Service Role key.
 * 
 * WARNING: This client BYPASSES ALL Row Level Security (RLS) policies.
 * ONLY use this in secure server environments (e.g., Webhooks, Cron jobs) 
 * where you absolutely need administrative privileges and have validated 
 * the request source. Never expose this client to the frontend or use it 
 * for standard user-driven API routes where RLS should apply.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin actions");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
