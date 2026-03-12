/**
 * Rate Limiting — Free tier quota enforcement
 * See: API_SPECIFICATION.md § Rate Limiting
 */

import { createClient } from "@/lib/supabase/server";

const TIER_LIMITS: Record<string, Record<string, number>> = {
  free: { scan: 3, scam_check: 5 },
  premium: { scan: 999999, scam_check: 999999 },
  family: { scan: 999999, scam_check: 999999 },
};

export async function checkQuota(
  userId: string,
  feature: "scan" | "scam_check"
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const supabase = await createClient();

  // Get user tier
  const { data: user } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = user?.subscription_tier ?? "free";
  const limit = TIER_LIMITS[tier]?.[feature] ?? 3;

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

export async function incrementUsage(
  userId: string,
  feature: "scan" | "scam_check"
): Promise<void> {
  const supabase = await createClient();
  const period = getCurrentPeriod();

  // Upsert usage count
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

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
