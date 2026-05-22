-- ============================================
-- SafeWallet Production Security Verification
-- Run this in Supabase SQL Editor before going live
-- ============================================

-- 1. VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'scans', 'scam_checks', 'subscriptions', 
    'usage_counts', 'badges', 'audit_logs', 'api_keys', 'ojk_knowledge'
  )
ORDER BY tablename;

-- Expected: ALL tables should have rls_enabled = true

-- 2. VERIFY RLS POLICIES EXIST
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Each table should have at least 1 policy

-- 3. VERIFY OCR ENCRYPTION (NO PLAINTEXT)
-- ============================================
SELECT 
  COUNT(*) AS total_scans,
  COUNT(CASE WHEN ocr_raw_text IS NOT NULL THEN 1 END) AS plaintext_count,
  COUNT(CASE WHEN encrypted_ocr_text IS NOT NULL THEN 1 END) AS encrypted_count,
  COUNT(CASE WHEN ocr_raw_text IS NULL AND encrypted_ocr_text IS NOT NULL THEN 1 END) AS secure_count
FROM scans;

-- Expected: 
-- plaintext_count = 0 (NO plaintext OCR)
-- secure_count = encrypted_count (all encrypted, no plaintext)

-- 4. VERIFY ATOMIC QUOTA RPC EXISTS
-- ============================================
SELECT 
  proname AS function_name,
  prosrc AS function_body
FROM pg_proc
WHERE proname = 'increment_quota_atomic';

-- Expected: Function should exist with SELECT ... FOR UPDATE

-- 5. VERIFY AUDIT LOG STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Expected: Should have user_id, action, status, request_id, details, ip_address, user_agent

-- 6. CHECK FOR EXPOSED SERVICE ROLE KEYS (should be 0)
-- ============================================
-- This checks if any client-side code accidentally logs service role key
-- Run this in your codebase, not SQL:
-- grep -r "SUPABASE_SERVICE_ROLE_KEY" src/components/
-- grep -r "service_role" .next/static/

-- 7. VERIFY NO PII IN AUDIT LOGS
-- ============================================
SELECT 
  action,
  details,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- Manual check: details should NOT contain:
-- - Passwords/tokens
-- - OCR text
-- - Full account numbers
-- - Detailed financial data

-- 8. VERIFY ENCRYPTION KEY IS SET (run in API route)
-- ============================================
-- Add this to a diagnostic endpoint (server-side only):
-- console.log("Encryption key configured:", !!process.env.ENCRYPTION_KEY);
-- console.log("Key length:", process.env.ENCRYPTION_KEY?.length);
-- Expected: true, length >= 32

-- 9. TEST RLS ISOLATION (CRITICAL)
-- ============================================
-- Create 2 test users and verify they can't see each other's data
-- This should be done via API tests, not SQL

-- 10. VERIFY QUOTA RPC WORKS UNDER LOAD
-- ============================================
-- Run concurrent requests to test atomic behavior:
-- for i in {1..20}; do curl -X POST /api/scan & done
-- Expected: Should respect quota limit (e.g., max 5 for free tier)

-- ============================================
-- PRODUCTION READINESS CHECKLIST
-- ============================================
-- [ ] All tables have RLS enabled
-- [ ] All tables have appropriate policies
-- [ ] No plaintext OCR in database
-- [ ] Atomic quota RPC exists and works
-- [ ] Audit logs properly structured
-- [ ] No service role key in client bundle
-- [ ] No PII in audit logs
-- [ ] Encryption key configured (32+ chars)
-- [ ] RLS isolation tested
-- [ ] Quota system tested under load
-- [ ] Privacy policy published
-- [ ] Consent banner implemented
-- [ ] Backup script scheduled
-- [ ] Key rotation procedure documented
