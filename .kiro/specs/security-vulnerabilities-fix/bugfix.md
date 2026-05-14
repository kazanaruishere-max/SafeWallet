# Bugfix Spec: Critical Security Vulnerabilities

## Bug Summary
SafeWallet has 3 critical security vulnerabilities (CVSS 9.0+) that expose the application to severe security risks including data breaches, service abuse, and infrastructure attacks.

## Affected Components
- **Encryption System** (`src/lib/encryption.ts`)
- **Scam Checker API** (`src/app/api/scam-check/route.ts`)
- **Health Scanner API** (`src/app/api/scan/route.ts`)
- **Rate Limiting System** (`src/lib/rate-limit.ts`)
- **Database Schema** (Supabase migrations)

## Bug Conditions

### C-01: Static Encryption Key Without Rotation (CVSS 9.1 - CRITICAL)

**Current Behavior:**
- Uses a single static encryption key from `ENCRYPTION_KEY` environment variable
- No key rotation mechanism exists
- If key is compromised, ALL historical encrypted data is exposed
- Key derivation uses Scrypt with random salt per encryption, but base key never changes

**Root Cause:**
The encryption system in `src/lib/encryption.ts` uses a static key:
```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback-secret-key-at-least-32-chars";
```

**Expected Behavior:**
- Support multiple encryption keys with versioning
- Implement automatic key rotation schedule
- Allow re-encryption of old data with new keys
- Maintain backward compatibility for decryption

**Impact:**
- **Severity**: CRITICAL (CVSS 9.1)
- **Data at Risk**: Bank statements, financial transactions, PII
- **Compliance**: Violates data protection regulations (GDPR, PDP Indonesia)

---

### C-02: SSRF Vulnerability in Scam Checker (CVSS 9.0 - CRITICAL)

**Current Behavior:**
- Accepts arbitrary URLs from users without validation
- No URL whitelist or blacklist
- No internal IP address blocking (127.0.0.1, 169.254.169.254, 10.0.0.0/8, etc.)
- Allows attackers to probe internal network and cloud metadata endpoints

**Root Cause:**
The scam checker API in `src/app/api/scam-check/route.ts` accepts URL input type but doesn't validate the URL:
```typescript
const { input_type, content, company_name } = body;
// content can be any URL, no validation
```

**Expected Behavior:**
- Validate all URLs against a whitelist of allowed domains
- Block internal IP addresses and private network ranges
- Block cloud metadata endpoints (AWS, GCP, Azure)
- Implement URL parsing and validation before any fetch operations
- Add timeout and size limits for external requests

**Impact:**
- **Severity**: CRITICAL (CVSS 9.0)
- **Attack Vectors**: 
  - Access AWS metadata endpoint (169.254.169.254) to steal credentials
  - Probe internal services and databases
  - Bypass firewall rules
  - Port scanning internal network

---

### C-03: Race Condition in Quota System (CVSS 9.0 - CRITICAL)

**Current Behavior:**
- Uses check-then-act pattern: SELECT count → check limit → INSERT
- Multiple concurrent requests can all pass the quota check before any increment
- Free users can exceed limits by sending parallel requests
- `incrementQuotaAtomic` function exists but the RPC doesn't exist in database

**Root Cause:**
The rate limiting system in `src/lib/rate-limit.ts` calls a non-existent RPC function:
```typescript
const { data, error } = await supabase.rpc("increment_quota_atomic", {
  p_user_id: userId,
  p_feature: feature,
  p_period: period,
  p_limit: limit,
});
```

This RPC function `increment_quota_atomic` is not defined in any Supabase migration file, so it falls back to the non-atomic `checkQuota` function which has the race condition.

**Expected Behavior:**
- Implement true atomic quota check-and-increment in a single database operation
- Create the missing PostgreSQL RPC function with proper locking
- Use database-level constraints to enforce limits
- Handle concurrent requests correctly

**Impact:**
- **Severity**: CRITICAL (CVSS 9.0)
- **Financial Loss**: Free users can abuse unlimited scans/checks
- **Service Degradation**: Quota bypass leads to AI API cost explosion
- **Business Impact**: Revenue loss from users not upgrading to premium

---

## Reproduction Steps

### C-01: Static Encryption Key
1. Deploy SafeWallet with `ENCRYPTION_KEY=test-key-12345678901234567890`
2. Create user and perform health scan (data encrypted with key)
3. Change `ENCRYPTION_KEY` to different value
4. Try to decrypt old data → fails
5. Compromise the key → all historical data exposed

### C-02: SSRF Vulnerability
1. Go to Scam Checker page
2. Select "URL" input type
3. Enter malicious URL: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
4. Submit → System fetches internal AWS metadata
5. Attacker receives cloud credentials in response

### C-03: Race Condition
1. Create free tier account (5 scans/month limit)
2. Open 10 browser tabs
3. Simultaneously submit scan requests from all tabs
4. All 10 requests pass quota check before any increment
5. User performs 10 scans despite 5-scan limit

---

## Test Strategy

### Unit Tests
- Test encryption key rotation mechanism
- Test URL validation against blacklist/whitelist
- Test atomic quota increment under concurrent load

### Integration Tests
- Test re-encryption of old data with new keys
- Test SSRF protection with various malicious URLs
- Test quota enforcement with parallel requests

### Property-Based Tests
- **C-01**: Generate random encryption keys and verify all data remains decryptable
- **C-02**: Generate random URLs (including internal IPs) and verify all are blocked
- **C-03**: Generate random concurrent request patterns and verify quota never exceeded

---

## Success Criteria

### C-01: Encryption Key Rotation
- [ ] Multiple encryption keys supported with version tracking
- [ ] Automatic key rotation schedule implemented
- [ ] Re-encryption utility for old data created
- [ ] Backward compatibility maintained for decryption
- [ ] Key rotation documented in operations manual

### C-02: SSRF Protection
- [ ] URL validation implemented with whitelist
- [ ] Internal IP addresses blocked (RFC 1918, link-local, loopback)
- [ ] Cloud metadata endpoints blocked
- [ ] Timeout and size limits enforced
- [ ] Security tests pass for all attack vectors

### C-03: Atomic Quota System
- [ ] PostgreSQL RPC function created and tested
- [ ] Atomic check-and-increment implemented
- [ ] Race condition eliminated (verified with load tests)
- [ ] Concurrent requests handled correctly
- [ ] Quota limits enforced under all conditions

---

## Related Files
- `src/lib/encryption.ts` - Encryption system
- `src/app/api/scam-check/route.ts` - Scam checker API
- `src/app/api/scan/route.ts` - Health scanner API
- `src/lib/rate-limit.ts` - Rate limiting system
- `supabase/migrations/` - Database schema migrations

---

## Notes
- These are CRITICAL vulnerabilities that must be fixed before production deployment
- Each vulnerability has severe security and business impact
- Fixes should be implemented in order: C-03 (quota) → C-02 (SSRF) → C-01 (encryption)
- All fixes require thorough testing including security penetration tests
- Consider bug bounty program after fixes are deployed
