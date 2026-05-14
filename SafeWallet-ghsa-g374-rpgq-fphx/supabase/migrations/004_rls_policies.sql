-- Migration 004: Strict RLS enforcement for Zero-Trust backend.
-- Fixes vulnerabilities where a user could query or manipulate another user's scan data or profiles.

-- Ensure RLS is enabled on all critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- scans table policies
DROP POLICY IF EXISTS "Users can insert their own scans" ON scans;
CREATE POLICY "Users can insert their own scans" 
ON scans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own scans" ON scans;
CREATE POLICY "Users can view their own scans" 
ON scans FOR SELECT 
USING (auth.uid() = user_id);

-- scam_checks table policies
DROP POLICY IF EXISTS "Users can insert their own scam checks" ON scam_checks;
CREATE POLICY "Users can insert their own scam checks" 
ON scam_checks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own scam checks" ON scam_checks;
CREATE POLICY "Users can view their own scam checks" 
ON scam_checks FOR SELECT 
USING (auth.uid() = user_id);

-- usage_counts table policies
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_counts;
CREATE POLICY "Users can view their own usage" 
ON usage_counts FOR SELECT 
USING (auth.uid() = user_id);

-- Admin Bypass using Service Role exists natively in Supabase, 
-- but these policies ensure generic anon/authenticated requests cannot cross tenant lines.

NOTIFY pgrst, 'reload schema';
