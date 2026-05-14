-- SafeWallet Database Schema v2.0
-- Run this migration in Supabase SQL Editor
-- See: SafeWallet-PRD-v2.md § Data Model

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  monthly_income INTEGER,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'family')),
  subscription_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Scans (Health Scanner)
-- ============================================
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  ocr_raw_text TEXT,
  ocr_corrected_text TEXT,
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),
  categories JSONB,
  recommendations JSONB,
  ai_model TEXT DEFAULT 'claude-3.5-sonnet',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scans_user_date ON scans(user_id, created_at DESC);

-- ============================================
-- 3. Scam Checks
-- ============================================
CREATE TABLE scam_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('screenshot', 'url', 'text')),
  input_content TEXT NOT NULL,
  ojk_verified BOOLEAN,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  red_flags JSONB,
  safe_alternatives JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scam_checks_user ON scam_checks(user_id, created_at DESC);

-- ============================================
-- 4. Badges (Gamification)
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL DEFAULT '',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- ============================================
-- 5. Subscriptions
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'family')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  amount INTEGER NOT NULL
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- ============================================
-- 6. Coaching Logs
-- ============================================
CREATE TABLE coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'push', 'email')),
  message_type TEXT NOT NULL CHECK (message_type IN ('budget_alert', 'tip', 'challenge', 'milestone')),
  content TEXT NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Usage Counts (Rate Limiting)
-- ============================================
CREATE TABLE usage_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  period TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, feature, period)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counts ENABLE ROW LEVEL SECURITY;

-- Users: read/write own data only
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Scans: CRUD own data
CREATE POLICY "Users can read own scans" ON scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scam checks: CRUD own data
CREATE POLICY "Users can read own scam checks" ON scam_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scam checks" ON scam_checks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: read own
CREATE POLICY "Users can read own badges" ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions: read own
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Coaching logs: read own
CREATE POLICY "Users can read own coaching logs" ON coaching_logs FOR SELECT USING (auth.uid() = user_id);

-- Usage counts: CRUD own
CREATE POLICY "Users can read own usage" ON usage_counts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_counts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_counts FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Auto-create user profile on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
