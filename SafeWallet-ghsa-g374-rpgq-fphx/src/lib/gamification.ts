/**
 * Gamification Engine — Auto-award badges based on user activity
 * See: SafeWallet-PRD-v2.md § Gamification
 */

import { createClient } from "@/lib/supabase/server";

export type BadgeDefinition = {
  type: string;
  name: string;
  description: string;
  emoji: string;
  check: (stats: UserStats) => boolean;
};

type UserStats = {
  totalScans: number;
  totalScamChecks: number;
  latestHealthScore: number | null;
  highestHealthScore: number;
  consecutiveDays: number;
  isPremium: boolean;
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "first_scan",
    name: "Pemula",
    description: "Selesaikan scan pertamamu",
    emoji: "🔰",
    check: (s) => s.totalScans >= 1,
  },
  {
    type: "scam_hunter",
    name: "Scam Hunter",
    description: "Cek 5 investasi mencurigakan",
    emoji: "🕵️",
    check: (s) => s.totalScamChecks >= 5,
  },
  {
    type: "health_80",
    name: "Keuangan Sehat",
    description: "Raih health score 80+",
    emoji: "💪",
    check: (s) => s.highestHealthScore >= 80,
  },
  {
    type: "health_90",
    name: "Keuangan Prima",
    description: "Raih health score 90+",
    emoji: "🏆",
    check: (s) => s.highestHealthScore >= 90,
  },
  {
    type: "streak_7",
    name: "Konsisten",
    description: "Scan 7 hari berturut-turut",
    emoji: "🔥",
    check: (s) => s.consecutiveDays >= 7,
  },
  {
    type: "streak_30",
    name: "Disiplin Finansial",
    description: "Scan 30 hari berturut-turut",
    emoji: "⭐",
    check: (s) => s.consecutiveDays >= 30,
  },
  {
    type: "premium_member",
    name: "Premium Member",
    description: "Upgrade ke Premium",
    emoji: "💎",
    check: (s) => s.isPremium,
  },
  {
    type: "five_scans",
    name: "Data Driven",
    description: "Selesaikan 5 scan",
    emoji: "📊",
    check: (s) => s.totalScans >= 5,
  },
  {
    type: "ten_scans",
    name: "Financial Analyst",
    description: "Selesaikan 10 scan",
    emoji: "📈",
    check: (s) => s.totalScans >= 10,
  },
  {
    type: "first_scam_check",
    name: "Waspada",
    description: "Cek investasi pertamamu",
    emoji: "🛡️",
    check: (s) => s.totalScamChecks >= 1,
  },
];

/**
 * Check and award any newly earned badges for a user.
 * Returns array of newly awarded badge types.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const supabase = await createClient();

  // 1. Get current badges
  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("user_id", userId);

  const earned = new Set(existingBadges?.map((b) => b.badge_type) ?? []);

  // 2. Get user stats
  const stats = await getUserStats(userId);

  // 3. Check each badge
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!earned.has(badge.type) && badge.check(stats)) {
      const { error } = await supabase.from("badges").insert({
        user_id: userId,
        badge_type: badge.type,
        badge_name: badge.name,
      });

      if (!error) {
        newBadges.push(badge.type);
      }
    }
  }

  return newBadges;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient();

  // Total scans
  const { count: totalScans } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total scam checks
  const { count: totalScamChecks } = await supabase
    .from("scam_checks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Health scores
  const { data: scores } = await supabase
    .from("scans")
    .select("health_score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const latestHealthScore = scores?.[0]?.health_score ?? null;
  const highestHealthScore = scores
    ? Math.max(0, ...scores.map((s) => s.health_score ?? 0))
    : 0;

  // Consecutive days (simplified: count distinct dates with scans in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentScans } = await supabase
    .from("scans")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  let consecutiveDays = 0;
  if (recentScans && recentScans.length > 0) {
    const dates = new Set(
      recentScans.map((s) => new Date(s.created_at).toISOString().split("T")[0])
    );
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.has(d.toISOString().split("T")[0])) {
        consecutiveDays++;
      } else {
        break;
      }
    }
  }

  // Subscription
  const { data: user } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  return {
    totalScans: totalScans ?? 0,
    totalScamChecks: totalScamChecks ?? 0,
    latestHealthScore,
    highestHealthScore,
    consecutiveDays,
    isPremium: user?.subscription_tier !== "free",
  };
}

export function getBadgeDefinition(type: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.type === type);
}
