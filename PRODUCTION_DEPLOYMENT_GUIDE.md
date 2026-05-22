# 🚀 SafeWallet Production Deployment Guide

**Target:** Vercel + Supabase Production  
**Estimated Time:** 2-3 hours  
**Prerequisites:** Vercel account, Supabase Pro plan

---

## 📋 Pre-Deployment Checklist

### 1. Security Audit Completed ✅

- [x] RLS policies verified
- [x] OCR encryption verified
- [x] Quota system fixed
- [x] SSRF protection implemented
- [x] Privacy policy created
- [x] Backup scripts ready

**Verification:**
```bash
./scripts/test-production-security.sh
```

---

## 🔧 Step-by-Step Deployment

### Step 1: Environment Variables Setup

**1.1 Generate Required Secrets**

```bash
# Encryption key (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Save output as ENCRYPTION_KEY

# Cron secret
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
# Save output as CRON_SECRET

# Telegram webhook secret (if using Telegram bot)
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
# Save output as TELEGRAM_WEBHOOK_SECRET
```

**1.2 Set Vercel Environment Variables**

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://your-project.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGc... (from Supabase Dashboard → Settings → API)

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGc... (from Supabase Dashboard → Settings → API)
# ⚠️ CRITICAL: This is a secret key, never expose to client

vercel env add GROQ_API_KEY production
# Paste: gsk_... (from https://console.groq.com)

vercel env add ENCRYPTION_KEY production
# Paste: Generated 64-char hex from step 1.1

vercel env add UPSTASH_REDIS_REST_URL production
# Paste: https://your-redis.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste: Your Upstash token

vercel env add CRON_SECRET production
# Paste: Generated hex from step 1.1

# Optional: Telegram bot
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add TELEGRAM_WEBHOOK_SECRET production

# Optional: Gemini for embeddings only
vercel env add GEMINI_API_KEY production
# Paste: AIza... (from https://makersuite.google.com/app/apikey)
```

**1.3 Verify Environment Variables**

```bash
vercel env ls

# Expected output:
# NEXT_PUBLIC_SUPABASE_URL          production
# NEXT_PUBLIC_SUPABASE_ANON_KEY     production
# SUPABASE_SERVICE_ROLE_KEY         production
# GROQ_API_KEY                      production
# ENCRYPTION_KEY                    production
# UPSTASH_REDIS_REST_URL            production
# UPSTASH_REDIS_REST_TOKEN          production
# CRON_SECRET                       production
```

---

### Step 2: Database Setup

**2.1 Run Migrations in Supabase**

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:

```sql
-- 1. Initial schema
\i supabase/migrations/001_initial_schema.sql

-- 2. RLS policies
\i supabase/migrations/004_rls_policies.sql

-- 3. Atomic quota
\i supabase/migrations/006_atomic_quota.sql

-- 4. OCR encryption
\i supabase/migrations/013_ocr_encrypted_retention.sql

-- 5. Audit logs
\i supabase/migrations/014_audit_logs.sql

-- ... (run all other migrations)
```

**2.2 Verify Database Security**

```sql
-- Run verification script
\i scripts/verify-production-security.sql

-- Expected results:
-- ✅ All tables have RLS enabled
-- ✅ No plaintext OCR data
-- ✅ Atomic quota RPC exists
```

---

### Step 3: Code Deployment

**3.1 Add Consent Banner to Layout**

```typescript
// src/app/layout.tsx
import { ConsentBanner } from "@/components/ConsentBanner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <ConsentBanner />  {/* Add this line */}
      </body>
    </html>
  );
}
```

**3.2 Build and Test Locally**

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Test production build locally
npm run start

# Open http://localhost:3000
# Test: Login, scan, scam check
```

**3.3 Run Security Tests**

```bash
# Automated security tests
chmod +x scripts/test-production-security.sh
./scripts/test-production-security.sh

# Expected output:
# ✓ All critical tests passed!
# ✓ Ready for production deployment
```

**3.4 Deploy to Vercel**

```bash
# Deploy to production
vercel --prod

# Wait for deployment to complete
# Note the deployment URL
```

---

### Step 4: Post-Deployment Verification

**4.1 Health Check**

```bash
# Test API endpoints
curl https://your-app.vercel.app/api/health

# Expected: {"status": "ok"}
```

**4.2 Test Authentication**

1. Go to https://your-app.vercel.app
2. Sign up with test account
3. Verify email confirmation works
4. Login successfully

**4.3 Test Core Features**

**Health Scanner:**
```bash
# Upload test image
curl -X POST https://your-app.vercel.app/api/scan \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-mutasi.jpg"

# Expected: 
# - OCR text extracted
# - Health score calculated
# - Recommendations provided
```

**Scam Checker:**
```bash
# Test text input
curl -X POST https://your-app.vercel.app/api/scam-check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "text",
    "content": "Investasi crypto return 100% per bulan dijamin!"
  }'

# Expected:
# - Risk score calculated
# - Red flags identified
# - Verdict provided
```

**4.4 Test Quota System**

```bash
# Test free tier limit (5 scans)
for i in {1..10}; do
  curl -X POST https://your-app.vercel.app/api/scan \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@test.jpg"
done

# Expected:
# - First 5 requests: Success
# - Requests 6-10: 429 Quota Exceeded
```

**4.5 Verify Security**

**SSRF Protection:**
```bash
# Try to access internal metadata (should be blocked)
curl -X POST https://your-app.vercel.app/api/scam-check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "url",
    "content": "http://169.254.169.254/latest/meta-data/"
  }'

# Expected: 400 Bad Request - "URL tidak diizinkan"
```

**RLS Isolation:**
```sql
-- In Supabase SQL Editor
-- Create 2 test users and verify they can't see each other's data

-- User 1 creates scan
INSERT INTO scans (user_id, ...) VALUES ('user-1-id', ...);

-- User 2 tries to read User 1's scan
SELECT * FROM scans WHERE user_id = 'user-1-id';
-- Expected: 0 rows (RLS blocks access)
```

---

### Step 5: Monitoring Setup

**5.1 Sentry (Error Tracking)**

```bash
# Set Sentry DSN
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production

# Redeploy
vercel --prod
```

**5.2 Vercel Analytics**

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics
3. Enable Speed Insights

**5.3 Supabase Monitoring**

1. Go to Supabase Dashboard → Reports
2. Monitor:
   - Database size
   - API requests
   - Auth users
   - Storage usage

---

### Step 6: Backup Configuration

**6.1 Setup Automated Backups**

```bash
# On your server (or GitHub Actions)
# Add to crontab:
crontab -e

# Add this line (runs every Sunday at 2 AM):
0 2 * * 0 /path/to/SafeWallet/scripts/backup-database.sh
```

**6.2 Configure S3 for Backup Storage**

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region

# Create S3 bucket
aws s3 mb s3://safewallet-backups

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket safewallet-backups \
  --versioning-configuration Status=Enabled

# Set lifecycle policy (delete after 90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket safewallet-backups \
  --lifecycle-configuration file://s3-lifecycle.json
```

**6.3 Test Backup**

```bash
# Run backup script manually
./scripts/backup-database.sh

# Verify backup created
ls -lh backups/

# Expected:
# safewallet_backup_20260522_020000.tar.gz
```

---

### Step 7: Key Rotation Schedule

**7.1 Document First Rotation Date**

```bash
# Calculate 90 days from today
date -d '+90 days' +%Y-%m-%d

# Add to calendar reminder
# Subject: SafeWallet Encryption Key Rotation
# Date: [90 days from today]
# Description: Run scripts/rotate-encryption-key.ts
```

**7.2 Store Old Key Securely**

```bash
# Encrypt current key for emergency rollback
echo $ENCRYPTION_KEY > current-key-$(date +%Y%m%d).txt
gpg --encrypt --recipient admin@safewallet.id current-key-*.txt
shred -u current-key-*.txt

# Store encrypted key in secure vault
# - AWS Secrets Manager
# - 1Password
# - Encrypted USB drive in safe
```

---

### Step 8: DNS & Domain Setup

**8.1 Configure Custom Domain**

```bash
# Add domain in Vercel
vercel domains add safewallet.id

# Add DNS records (in your domain registrar):
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com

# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com
```

**8.2 Enable HTTPS**

Vercel automatically provisions SSL certificate via Let's Encrypt.

**8.3 Verify Domain**

```bash
# Test HTTPS
curl -I https://safewallet.id

# Expected: HTTP/2 200
```

---

### Step 9: Cron Jobs Setup

**9.1 Configure Vercel Cron**

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-knowledge",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-old-scans",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

**9.2 Verify Cron Secret**

```bash
# Test cron endpoint
curl -X GET https://safewallet.id/api/cron/sync-knowledge \
  -H "Authorization: Bearer $CRON_SECRET"

# Expected: {"success": true}
```

---

### Step 10: Final Checklist

**Before Going Live:**

- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] RLS policies verified
- [ ] OCR encryption verified (no plaintext)
- [ ] Quota system tested (respects limits)
- [ ] SSRF protection tested (blocks internal IPs)
- [ ] Privacy policy accessible at /privacy
- [ ] Terms of service accessible at /terms
- [ ] Consent banner appears on first visit
- [ ] Backup script scheduled (weekly)
- [ ] Key rotation scheduled (90 days)
- [ ] Monitoring enabled (Sentry, Vercel Analytics)
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Cron jobs configured

**After Going Live:**

- [ ] Monitor error logs (first 24 hours)
- [ ] Check Supabase logs for RLS violations
- [ ] Verify quota system working
- [ ] Test all critical user flows
- [ ] Review audit logs for anomalies
- [ ] Confirm backups running successfully

---

## 🚨 Troubleshooting

### Issue: "ENCRYPTION_KEY not set" error

**Solution:**
```bash
vercel env add ENCRYPTION_KEY production
# Paste your 64-char hex key
vercel --prod  # Redeploy
```

### Issue: Quota system returns 503

**Solution:**
```sql
-- Verify RPC function exists
SELECT proname FROM pg_proc WHERE proname = 'increment_quota_atomic';

-- If not exists, run migration:
\i supabase/migrations/006_atomic_quota.sql
```

### Issue: RLS blocking legitimate requests

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Verify user authentication
SELECT auth.uid();  -- Should return user UUID
```

### Issue: SSRF protection blocking legitimate URLs

**Solution:**
```typescript
// Edit src/app/api/scam-check/route.ts
// Add legitimate domain to whitelist
const allowedDomains = ["ojk.go.id", "bi.go.id", ...];
```

---

## 📞 Support Contacts

**Technical Issues:**
- Email: devops@safewallet.id
- Slack: #safewallet-production

**Security Incidents:**
- Email: security@safewallet.id
- On-call: [Your phone number]

**Database Issues:**
- Email: dba@safewallet.id

---

## 📚 Additional Resources

- [Production Readiness Checklist](./PRODUCTION_READINESS_CHECKLIST.md)
- [Security Audit Summary](./PRODUCTION_SECURITY_AUDIT_SUMMARY.md)
- [Backup & Key Rotation Guide](./BACKUP_AND_KEY_ROTATION_GUIDE.md)
- [Security Audit README](./SECURITY_AUDIT_README.md)

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 22 Mei 2026  
**Next Review:** After first production deployment
