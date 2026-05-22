/**
 * Rate Limiting — Free tier quota enforcement
 * FIX H1: Atomic upsert to prevent race conditions
 */

import { createClient } from "@/lib/supabase/server";

type QuotaFeature = "scan" | "scam_check" | "breach_check";

type QuotaInfo = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
};

type QuotaRpcResponse = {
  success?: boolean;
  current?: number;
  limit?: number;
  remaining?: number;
};

export class QuotaSystemError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "QuotaSystemError";
    this.cause = options?.cause;
  }
}

export const TIER_LIMITS: Record<string, Record<string, number>> = {
  free: { scan: 5, scam_check: 10, breach_check: 3 },
  premium: { scan: 999999, scam_check: 999999, breach_check: 999999 },
  family: { scan: 999999, scam_check: 999999, breach_check: 999999 },
};

/**
 * v2 Update: Atomic Quota Check & Increment
 * Uses Supabase RPC to prevent race conditions in high-traffic scenarios.
 */
export async function incrementQuotaAtomic(
  userId: string,
  feature: QuotaFeature
): Promise<QuotaInfo> {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  // Get user tier to determine limit
  const { data: user } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = user?.subscription_tier ?? "free";
  const limit = TIER_LIMITS[tier]?.[feature] ?? (feature === "scan" ? 5 : 10);

  // Call the atomic RPC function
  const { data, error } = await supabase.rpc("increment_quota_atomic", {
    p_user_id: userId,
    p_feature: feature,
    p_period: period,
    p_limit: limit,
  });

  if (error) {
    console.error(`[RateLimit] RPC Error for ${feature}:`, error.message);
    throw new QuotaSystemError("Atomic quota RPC failed", { cause: error });
  }

  const quota = data as QuotaRpcResponse | null;
  if (
    !quota ||
    typeof quota.success !== "boolean" ||
    typeof quota.current !== "number" ||
    typeof quota.limit !== "number"
  ) {
    console.error(`[RateLimit] Invalid RPC response for ${feature}:`, data);
    throw new QuotaSystemError("Atomic quota RPC returned an invalid response");
  }

  return {
    allowed: quota.success,
    used: quota.current,
    limit: quota.limit,
    remaining: quota.remaining ?? Math.max(0, quota.limit - quota.current),
  };
}

export async function checkQuota(
  userId: string,
  feature: QuotaFeature
): Promise<QuotaInfo> {
  const supabase = await createClient();

  // Get user tier
  const { data: user } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = user?.subscription_tier ?? "free";
  const limit = TIER_LIMITS[tier]?.[feature] ?? (feature === "scan" ? 5 : 10);

  // Get current period usage
  const period = getCurrentPeriod();

  const { data: usage } = await supabase
    .from("usage_counts")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("period", period)
    .single();

  const used = usage?.count ?? 0;

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * FIX H1: Atomic increment via upsert with ON CONFLICT DO UPDATE
 * Prevents race condition where multiple concurrent requests all pass quota check.
 */
export async function incrementUsage(
  userId: string,
  feature: QuotaFeature
): Promise<void> {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  // Atomic upsert: insert or increment in a single operation
  const { error } = await supabase
    .from("usage_counts")
    .upsert(
      {
        user_id: userId,
        feature,
        period,
        count: 1,
      },
      {
        onConflict: "user_id,feature,period",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    // Fallback: try raw increment if upsert fails (e.g., no unique constraint)
    const { data: existing } = await supabase
      .from("usage_counts")
      .select("id, count")
      .eq("user_id", userId)
      .eq("feature", feature)
      .eq("period", period)
      .single();

    if (existing) {
      await supabase
        .from("usage_counts")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("usage_counts").insert({
        user_id: userId,
        feature,
        period,
        count: 1,
      });
    }
  }
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
