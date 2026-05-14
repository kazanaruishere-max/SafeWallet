// === Database Types (matches Supabase schema) ===

export type SubscriptionTier = "free" | "premium" | "family";
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type InputType = "text" | "url" | "screenshot";
export type Confidence = "low" | "medium" | "high";
export type Verdict = "SAFE" | "CAUTION" | "HIGH_RISK";
export type CoachingChannel = "whatsapp" | "push" | "email";
export type MessageType = "budget_alert" | "tip" | "challenge" | "milestone";
export type BadgeType =
  | "first_scan"
  | "streak_7"
  | "streak_30"
  | "scam_hunter"
  | "saver_100k"
  | "saver_1m"
  | "health_80"
  | "health_90"
  | "referral_5"
  | "premium_member";

export type User = {
  id: string;
  email: string;
  phone: string | null;
  monthly_income: number | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  telegram_chat_id: string | null;
  telegram_link_code: string | null;
  debt_ratio: number;
  needs_education_lock: boolean;
  modules_completed: string[];
  created_at: string;
  updated_at: string;
};

export type Scan = {
  id: string;
  user_id: string;
  image_url: string;
  ocr_raw_text: string | null;
  ocr_corrected_text: string | null;
  health_score: number | null;
  categories: Record<string, number> | null;
  recommendations: string[] | null;
  ai_model: string;
  processing_time_ms: number | null;
  created_at: string;
};

export type ScamCheck = {
  id: string;
  user_id: string;
  input_type: InputType;
  input_content: string;
  ojk_verified: boolean | null;
  risk_score: number | null;
  confidence: Confidence | null;
  red_flags: Array<{ type: string; detail: string; severity: string }> | null;
  safe_alternatives:
    | Array<{ name: string; return: string; risk: string }>
    | null;
  created_at: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  payment_method: string | null;
  amount: number;
};

export type CoachingLog = {
  id: string;
  user_id: string;
  channel: CoachingChannel;
  message_type: MessageType;
  content: string;
  delivered: boolean;
  delivered_at: string | null;
  created_at: string;
};

export type UsageCount = {
  id: string;
  user_id: string;
  feature: string;
  period: string;
  count: number;
};
