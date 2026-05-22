# 🔐 SafeWallet Backup & Key Rotation Guide

**Audience:** DevOps, Security Team, Database Administrators  
**Last Updated:** 22 Mei 2026  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Database Backup Strategy](#database-backup-strategy)
2. [Encryption Key Rotation](#encryption-key-rotation)
3. [Disaster Recovery](#disaster-recovery)
4. [Emergency Procedures](#emergency-procedures)

---

## 1. Database Backup Strategy

### 1.1 Automatic Backups (Supabase)

**Included in Supabase Pro Plan:**
- ✅ Daily automated backups (retained 7 days)
- ✅ Point-in-time recovery (PITR) available
- ✅ Stored in encrypted S3 buckets

**Access Backups:**
1. Go to Supabase Dashboard → Database → Backups
2. Select backup date
3. Click "Restore" to create new database from backup

### 1.2 Manual Backup Procedure

**Frequency:** Weekly (every Sunday 2 AM UTC)

**Script:** `scripts/backup-database.sh`

**Prerequisites:**
```bash
# Install PostgreSQL client tools
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# Install AWS CLI (for S3 upload)
pip install awscli

# Install GPG (for encryption)
sudo apt-get install gnupg
```

**Environment Variables:**
```bash
export SUPABASE_DB_HOST="db.xxx.supabase.co"
export GPG_RECIPIENT="admin@safewallet.id"  # Your GPG key email
export AWS_S3_BUCKET="safewallet-backups"
export PGPASSWORD="your-postgres-password"
```

**Run Backup:**
```bash
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

**Output:**
```
backups/
├── schema_20260522_020000.sql
├── data_20260522_020000.sql
├── sensitive_20260522_020000.sql.gpg  # Encrypted
└── safewallet_backup_20260522_020000.tar.gz
```

### 1.3 Backup Schedule

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Supabase Auto | Daily | 7 days | Supabase S3 |
| Manual Full | Weekly | 90 days | AWS S3 |
| Critical Data | Before key rotation | 1 year | Encrypted S3 |

### 1.4 Restore from Backup

**Restore Schema:**
```bash
psql -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  < backups/schema_20260522_020000.sql
```

**Restore Non-Sensitive Data:**
```bash
psql -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  < backups/data_20260522_020000.sql
```

**Restore Encrypted Data:**
```bash
# Decrypt first
gpg --decrypt backups/sensitive_20260522_020000.sql.gpg > sensitive.sql

# Then restore
psql -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  < sensitive.sql

# Securely delete plaintext
shred -u sensitive.sql
```

---

## 2. Encryption Key Rotation

### 2.1 Why Rotate Keys?

**Security Best Practices:**
- Limit exposure window if key is compromised
- Comply with security standards (PCI-DSS, ISO 27001)
- Reduce impact of potential breaches

**Rotation Schedule:**
- **Regular:** Every 90 days
- **Emergency:** Immediately if compromise suspected
- **Audit:** Before major security audits

### 2.2 Key Rotation Procedure

**Script:** `scripts/rotate-encryption-key.ts`

**⚠️ CRITICAL: Run during maintenance window (2-4 hours)**

#### Step 1: Pre-Rotation Checklist

```bash
# 1. Announce maintenance window
# Send email to all users 48 hours in advance

# 2. Backup database (MANDATORY)
./scripts/backup-database.sh

# 3. Verify backup integrity
tar -tzf backups/safewallet_backup_*.tar.gz

# 4. Generate new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6...  (64 hex characters)

# 5. Store old key securely (for rollback)
echo $ENCRYPTION_KEY > old-key-$(date +%Y%m%d).txt
gpg --encrypt --recipient admin@safewallet.id old-key-*.txt
shred -u old-key-*.txt  # Delete plaintext
```

#### Step 2: Run Rotation Script

```bash
# Set environment variables
export OLD_KEY="current-encryption-key-64-chars"
export NEW_KEY="new-encryption-key-64-chars"
export NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run rotation (requires tsx)
npm install -g tsx
tsx scripts/rotate-encryption-key.ts
```

**Expected Output:**
```
🔄 Starting encryption key rotation...
⏰ Started at: 2026-05-22T02:00:00.000Z
📊 Found 1523 records to re-encrypt
✅ Progress: 100/1523 (7%)
✅ Progress: 200/1523 (13%)
...
✅ Progress: 1523/1523 (100%)

🎉 Rotation complete!
✅ Success: 1523
❌ Failed: 0
⏰ Finished at: 2026-05-22T02:08:34.123Z
```

#### Step 3: Update Production Environment

```bash
# Update Vercel environment variable
vercel env rm ENCRYPTION_KEY production
vercel env add ENCRYPTION_KEY production
# Paste new key when prompted

# Trigger redeployment
vercel --prod
```

#### Step 4: Verify Rotation

```bash
# Test decryption with new key
curl -X POST https://your-app.vercel.app/api/scan/test-decrypt \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"scan_id": "test-scan-id"}'

# Expected: Successfully decrypted OCR text
```

#### Step 5: Post-Rotation Cleanup

```bash
# 1. Monitor for errors (24 hours)
# Check Sentry, Supabase logs, Vercel logs

# 2. Update audit logs
psql -h db.xxx.supabase.co -U postgres -d postgres -c "
INSERT INTO audit_logs (user_id, action, status, request_id, details)
VALUES (
  NULL,
  'SECURITY_EVENT',
  'SUCCESS',
  gen_random_uuid(),
  '{\"event\": \"ENCRYPTION_KEY_ROTATION\", \"date\": \"$(date -I)\", \"records_updated\": 1523}'::jsonb
);
"

# 3. Store old key for 30 days (for emergency rollback)
# After 30 days, securely delete:
gpg --delete-secret-keys admin@safewallet.id
rm old-key-*.txt.gpg
```

### 2.3 Emergency Key Rotation

**If key is compromised:**

```bash
# 1. IMMEDIATELY rotate key (no maintenance window)
tsx scripts/rotate-encryption-key.ts

# 2. Notify affected users (within 72 hours - UU PDP requirement)
# Email template: "Data security incident notification"

# 3. Report to authorities if >1000 users affected
# Contact: Kominfo, OJK (for financial data)

# 4. Engage external security audit
# Recommended: Ethical hackers, penetration testing

# 5. Review access logs
psql -c "SELECT * FROM audit_logs WHERE action = 'SECURITY_EVENT' ORDER BY created_at DESC LIMIT 100;"
```

---

## 3. Disaster Recovery

### 3.1 Recovery Time Objective (RTO)

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Database corruption | 4 hours | 1 hour | P0 |
| Key compromise | 2 hours | 0 (immediate) | P0 |
| Supabase outage | 8 hours | 24 hours | P1 |
| Complete data loss | 24 hours | 7 days | P0 |

### 3.2 Disaster Recovery Procedures

#### Scenario 1: Database Corruption

```bash
# 1. Identify corruption
psql -c "SELECT * FROM scans LIMIT 10;"
# Error: invalid page header

# 2. Restore from latest backup
# Via Supabase Dashboard → Backups → Restore

# 3. Verify data integrity
psql -c "SELECT COUNT(*) FROM scans;"
psql -c "SELECT COUNT(*) FROM users;"

# 4. Re-run migrations if needed
psql -f supabase/migrations/*.sql
```

#### Scenario 2: Encryption Key Lost

```bash
# 1. Retrieve key from secure vault
# AWS Secrets Manager, 1Password, etc.

# 2. If key is permanently lost:
# - Data is UNRECOVERABLE (by design)
# - Notify users immediately
# - Offer account reset with data deletion

# 3. Prevention: Store key in multiple secure locations
# - AWS Secrets Manager (primary)
# - 1Password vault (backup)
# - Encrypted USB drive in safe (offline backup)
```

#### Scenario 3: Complete Infrastructure Failure

```bash
# 1. Provision new Supabase project
# 2. Restore schema from backup
psql -f backups/schema_latest.sql

# 3. Restore data from S3 backup
aws s3 cp s3://safewallet-backups/latest.tar.gz .
tar -xzf latest.tar.gz
psql -f backups/data_latest.sql

# 4. Decrypt and restore sensitive data
gpg --decrypt backups/sensitive_latest.sql.gpg | psql

# 5. Update DNS and environment variables
# 6. Test all critical paths
# 7. Announce service restoration
```

---

## 4. Emergency Procedures

### 4.1 Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Security Lead | [Your Name] | +62-xxx-xxx-xxxx | 24/7 |
| Database Admin | [DBA Name] | dba@safewallet.id | 24/7 |
| DevOps Lead | [DevOps Name] | devops@safewallet.id | Business hours |
| Legal Counsel | [Lawyer Name] | legal@safewallet.id | Business hours |

### 4.2 Incident Response Checklist

**Data Breach:**
- [ ] Isolate affected systems
- [ ] Rotate all keys immediately
- [ ] Review access logs
- [ ] Notify affected users (within 72 hours)
- [ ] Report to Kominfo (if >1000 users)
- [ ] Engage external security audit
- [ ] Update security measures
- [ ] Document lessons learned

**Service Outage:**
- [ ] Check Supabase status page
- [ ] Review Vercel deployment logs
- [ ] Test database connectivity
- [ ] Verify environment variables
- [ ] Check rate limiting (Upstash)
- [ ] Notify users via status page
- [ ] Implement temporary workaround
- [ ] Post-mortem analysis

### 4.3 Rollback Procedures

**If key rotation fails:**

```bash
# 1. Stop rotation script (Ctrl+C)

# 2. Restore from pre-rotation backup
psql -f backups/pre-rotation-backup.sql

# 3. Revert environment variable
vercel env rm ENCRYPTION_KEY production
vercel env add ENCRYPTION_KEY production
# Paste OLD key

# 4. Redeploy
vercel --prod

# 5. Verify old key works
curl -X POST /api/scan/test-decrypt

# 6. Investigate failure
# Check audit_logs for KEY_ROTATION_ERROR events
```

---

## 5. Testing & Validation

### 5.1 Backup Testing (Monthly)

```bash
# 1. Restore backup to staging environment
# 2. Run integration tests
npm run test:integration

# 3. Verify data integrity
psql -c "SELECT COUNT(*) FROM scans;"
psql -c "SELECT COUNT(*) FROM users;"

# 4. Test decryption
curl -X POST https://staging.safewallet.id/api/scan/test-decrypt

# 5. Document results
echo "Backup test passed: $(date)" >> backup-test-log.txt
```

### 5.2 Key Rotation Dry Run (Before Production)

```bash
# 1. Clone production database to staging
# 2. Run rotation script on staging
OLD_KEY=$PROD_KEY NEW_KEY=$TEST_KEY tsx scripts/rotate-encryption-key.ts

# 3. Verify all records re-encrypted
psql -c "SELECT COUNT(*) FROM scans WHERE encrypted_ocr_text IS NOT NULL;"

# 4. Test decryption with new key
# 5. Measure rotation time (for maintenance window planning)
```

---

## 6. Compliance & Audit

### 6.1 Audit Trail

All key rotations and backups are logged in `audit_logs` table:

```sql
SELECT 
  action,
  status,
  details,
  created_at
FROM audit_logs
WHERE action = 'SECURITY_EVENT'
  AND details->>'event' IN ('ENCRYPTION_KEY_ROTATION', 'DATABASE_BACKUP')
ORDER BY created_at DESC;
```

### 6.2 Compliance Requirements

| Regulation | Requirement | SafeWallet Implementation |
|------------|-------------|---------------------------|
| UU PDP | Data breach notification (72h) | Automated email + audit log |
| PCI-DSS | Key rotation (90 days) | Scheduled rotation script |
| ISO 27001 | Backup testing (monthly) | Automated staging restore |
| GDPR | Data portability | Export API endpoint |

---

## 7. Appendix

### 7.1 Key Storage Best Practices

**DO:**
- ✅ Store keys in AWS Secrets Manager or similar
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys every 90 days
- ✅ Encrypt backups containing keys
- ✅ Use hardware security modules (HSM) for high-value keys

**DON'T:**
- ❌ Commit keys to Git
- ❌ Store keys in plaintext files
- ❌ Share keys via email/Slack
- ❌ Use same key across environments
- ❌ Store keys in application logs

### 7.2 Useful Commands

```bash
# Generate secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Count encrypted records
psql -c "SELECT COUNT(*) FROM scans WHERE encrypted_ocr_text IS NOT NULL;"

# Test GPG encryption
echo "test" | gpg --encrypt --recipient admin@safewallet.id | gpg --decrypt

# Verify backup integrity
tar -tzf backup.tar.gz | wc -l
```

---

**Document Maintainer:** Security Team  
**Review Frequency:** Quarterly  
**Next Review:** August 2026
