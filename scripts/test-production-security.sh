#!/bin/bash
# SafeWallet Production Security Testing Script
# Run this before deploying to production

set -e

echo "🔒 SafeWallet Production Security Test Suite"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_check() {
  local test_name=$1
  local test_command=$2
  local expected=$3
  
  echo -n "Testing: $test_name... "
  
  if eval "$test_command"; then
    if [ -n "$expected" ]; then
      echo -e "${GREEN}✓ PASS${NC}"
      ((PASSED++))
    else
      echo -e "${GREEN}✓ PASS${NC}"
      ((PASSED++))
    fi
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
}

warning_check() {
  local test_name=$1
  local message=$2
  
  echo -e "${YELLOW}⚠ WARNING${NC}: $test_name"
  echo "  $message"
  ((WARNINGS++))
}

echo "1. Environment Variables Check"
echo "------------------------------"

# Check required environment variables
test_check "NEXT_PUBLIC_SUPABASE_URL set" \
  "[ -n \"\$NEXT_PUBLIC_SUPABASE_URL\" ]"

test_check "SUPABASE_SERVICE_ROLE_KEY set" \
  "[ -n \"\$SUPABASE_SERVICE_ROLE_KEY\" ]"

test_check "GROQ_API_KEY set" \
  "[ -n \"\$GROQ_API_KEY\" ]"

test_check "ENCRYPTION_KEY set" \
  "[ -n \"\$ENCRYPTION_KEY\" ]"

test_check "ENCRYPTION_KEY length >= 32" \
  "[ \${#ENCRYPTION_KEY} -ge 32 ]"

test_check "CRON_SECRET set" \
  "[ -n \"\$CRON_SECRET\" ]"

echo ""
echo "2. Code Security Checks"
echo "----------------------"

# Check for service role key exposure
test_check "No service role key in client components" \
  "! grep -r 'SUPABASE_SERVICE_ROLE_KEY' src/components/ 2>/dev/null"

test_check "No createAdminClient in client code" \
  "! grep -r 'createAdminClient' src/app/ --include='*.tsx' --exclude-dir='api' 2>/dev/null"

# Check for hardcoded secrets
test_check "No hardcoded API keys" \
  "! grep -rE '(sk-|gsk_|AIza)[a-zA-Z0-9]{20,}' src/ 2>/dev/null"

# Check for Gemini fallback in non-embedding code
if grep -r "gemini-" src/app/api/ --exclude="*embedding*" 2>/dev/null; then
  warning_check "Gemini model found in non-embedding code" \
    "Ensure Gemini is only used for embeddings, not chat/vision"
fi

echo ""
echo "3. SSRF Protection Check"
echo "------------------------"

# Check if SSRF protection is implemented
if grep -q "blockedHosts" src/app/api/scam-check/route.ts; then
  test_check "SSRF protection implemented" "true"
else
  test_check "SSRF protection implemented" "false"
fi

echo ""
echo "4. Quota System Check"
echo "---------------------"

# Check if quota fallback is removed
if grep -q "Quota system temporarily unavailable" src/lib/rate-limit.ts; then
  test_check "Quota fail-fast implemented" "true"
else
  warning_check "Quota error handling" \
    "Verify quota system fails fast without fallback"
fi

echo ""
echo "5. Privacy Compliance Check"
echo "---------------------------"

test_check "Privacy policy exists" \
  "[ -f src/app/privacy/page.tsx ]"

test_check "Terms of service exists" \
  "[ -f src/app/terms/page.tsx ]"

test_check "Consent banner exists" \
  "[ -f src/components/ConsentBanner.tsx ]"

echo ""
echo "6. Backup & Recovery Check"
echo "--------------------------"

test_check "Backup script exists" \
  "[ -f scripts/backup-database.sh ]"

test_check "Backup script is executable" \
  "[ -x scripts/backup-database.sh ]"

test_check "Key rotation script exists" \
  "[ -f scripts/rotate-encryption-key.ts ]"

test_check "Backup guide exists" \
  "[ -f BACKUP_AND_KEY_ROTATION_GUIDE.md ]"

echo ""
echo "7. Database Security (requires psql)"
echo "-------------------------------------"

if command -v psql &> /dev/null; then
  # Check RLS enabled (requires database connection)
  if [ -n "$SUPABASE_DB_HOST" ]; then
    echo "Checking RLS policies..."
    psql -h "$SUPABASE_DB_HOST" -U postgres -d postgres -c \
      "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'scans', 'scam_checks');" \
      2>/dev/null && test_check "RLS policies queryable" "true" || warning_check "Database connection" "Could not connect to verify RLS"
  else
    warning_check "Database connection" \
      "Set SUPABASE_DB_HOST to verify RLS policies"
  fi
else
  warning_check "psql not installed" \
    "Install PostgreSQL client to verify database security"
fi

echo ""
echo "8. Build & Bundle Check"
echo "-----------------------"

# Check if .next directory exists (built)
if [ -d ".next" ]; then
  test_check "Production build exists" "true"
  
  # Check for secrets in bundle
  if grep -r "service_role" .next/static/ 2>/dev/null; then
    test_check "No secrets in production bundle" "false"
  else
    test_check "No secrets in production bundle" "true"
  fi
else
  warning_check "Production build" \
    "Run 'npm run build' to verify bundle security"
fi

echo ""
echo "9. Documentation Check"
echo "----------------------"

test_check "Production readiness checklist exists" \
  "[ -f PRODUCTION_READINESS_CHECKLIST.md ]"

test_check "Security audit summary exists" \
  "[ -f PRODUCTION_SECURITY_AUDIT_SUMMARY.md ]"

test_check "Verification SQL exists" \
  "[ -f scripts/verify-production-security.sql ]"

echo ""
echo "=============================================="
echo "Test Results Summary"
echo "=============================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All critical tests passed!${NC}"
  
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Please review warnings before deploying${NC}"
    exit 0
  else
    echo -e "${GREEN}✓ Ready for production deployment${NC}"
    exit 0
  fi
else
  echo -e "${RED}✗ Some tests failed. Fix issues before deploying.${NC}"
  exit 1
fi
