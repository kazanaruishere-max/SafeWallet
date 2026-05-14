# Requirements: Critical Security Vulnerabilities Fix

## Overview
Fix 3 critical security vulnerabilities (CVSS 9.0+) in SafeWallet that expose the application to data breaches, infrastructure attacks, and service abuse.

---

## Requirements

### REQ-1: Encryption Key Rotation System
**Priority**: P0 (Critical)  
**Type**: Security Enhancement

Implement a multi-key encryption system with automatic rotation to protect against key compromise.

**Acceptance Criteria:**
- System supports multiple encryption keys with version tracking
- Each encrypted value stores its key version identifier
- New data encrypted with latest key version
- Old data can be decrypted with historical keys
- Key rotation utility created for re-encrypting old data
- Environment variables support multiple keys (e.g., `ENCRYPTION_KEY_V1`, `ENCRYPTION_KEY_V2`)
- Default key version configurable via `ENCRYPTION_KEY_VERSION`
- Decryption automatically detects key version from encrypted data format
- Key rotation schedule documented (recommended: quarterly)
- Backward compatibility maintained for existing encrypted data

**Technical Details:**
- Modify `src/lib/encryption.ts` to support key versioning
- Update encrypted data format: `v{version}:{salt}:{iv}:{authTag}:{encryptedData}`
- Create key management utility in `src/lib/key-management.ts`
- Add migration script for re-encrypting existing data
- Update environment variable documentation

**Security Impact:**
- Reduces blast radius of key compromise
- Enables compliance with data protection regulations
- Allows graceful key deprecation and rotation

---

### REQ-2: SSRF Protection in Scam Checker
**Priority**: P0 (Critical)  
**Type**: Security Fix

Implement comprehensive URL validation and SSRF protection in the scam checker API.

**Acceptance Criteria:**
- All URLs validated before any fetch operations
- Internal IP addresses blocked:
  - Loopback: `127.0.0.0/8`, `::1`
  - Link-local: `169.254.0.0/16`, `fe80::/10`
  - Private networks: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`
- Cloud metadata endpoints blocked:
  - AWS: `169.254.169.254`
  - GCP: `metadata.google.internal`, `169.254.169.254`
  - Azure: `169.254.169.254`
- URL whitelist implemented for allowed domains
- DNS rebinding protection (resolve URL before and after fetch)
- Timeout limits enforced (max 10 seconds)
- Response size limits enforced (max 5MB)
- Redirect following disabled or limited (max 3 redirects)
- User-Agent header set to identify SafeWallet
- Error messages don't leak internal network information

**Technical Details:**
- Create URL validation utility in `src/lib/url-validator.ts`
- Update `src/app/api/scam-check/route.ts` to use validator
- Implement IP address parsing and range checking
- Add DNS resolution check before fetch
- Configure fetch timeout and size limits
- Add security tests for SSRF attack vectors

**Security Impact:**
- Prevents internal network probing
- Blocks cloud metadata credential theft
- Protects internal services from unauthorized access

---

### REQ-3: Atomic Quota System Implementation
**Priority**: P0 (Critical)  
**Type**: Bug Fix

Implement true atomic quota check-and-increment to prevent race conditions and quota bypass.

**Acceptance Criteria:**
- PostgreSQL RPC function `increment_quota_atomic` created
- Function performs atomic check-and-increment in single transaction
- Uses row-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions
- Returns success/failure status with current usage counts
- Handles concurrent requests correctly (verified with load tests)
- Falls back gracefully if RPC fails
- Migration script created for database function
- Function handles edge cases:
  - First usage in new period
  - Concurrent requests from same user
  - Period rollover during request
- Performance optimized (< 50ms p95 latency)
- Monitoring added for quota bypass attempts

**Technical Details:**
- Create Supabase migration: `supabase/migrations/006_atomic_quota_rpc.sql`
- Implement PostgreSQL function with proper locking
- Update `src/lib/rate-limit.ts` to handle RPC response correctly
- Add database indexes for performance
- Add unit tests for concurrent scenarios
- Add load tests to verify race condition eliminated

**Database Function Signature:**
```sql
CREATE OR REPLACE FUNCTION increment_quota_atomic(
  p_user_id UUID,
  p_feature TEXT,
  p_period TEXT,
  p_limit INTEGER
) RETURNS JSON AS $$
-- Returns: { success: boolean, current: number, limit: number, remaining: number }
$$;
```

**Security Impact:**
- Prevents quota bypass and service abuse
- Protects against financial loss from unlimited free usage
- Ensures fair resource allocation across users

---

### REQ-4: Security Testing Suite
**Priority**: P0 (Critical)  
**Type**: Testing

Create comprehensive security tests to verify all vulnerabilities are fixed.

**Acceptance Criteria:**
- Unit tests for encryption key rotation
- Unit tests for URL validation and SSRF protection
- Unit tests for atomic quota increment
- Integration tests for end-to-end security flows
- Load tests for concurrent quota requests (100+ parallel)
- Property-based tests for edge cases
- Security regression tests added to CI/CD pipeline
- Test coverage > 90% for security-critical code
- Penetration testing checklist created
- Security test results documented

**Test Scenarios:**
1. **Encryption Key Rotation:**
   - Encrypt with key v1, decrypt with v1 ✓
   - Encrypt with key v2, decrypt with v2 ✓
   - Encrypt with key v1, decrypt with v2 ✗
   - Re-encrypt v1 data to v2, decrypt with v2 ✓

2. **SSRF Protection:**
   - Valid external URL → allowed ✓
   - Internal IP (127.0.0.1) → blocked ✗
   - AWS metadata endpoint → blocked ✗
   - Private network (192.168.1.1) → blocked ✗
   - DNS rebinding attack → blocked ✗

3. **Atomic Quota:**
   - Sequential requests → quota enforced ✓
   - 100 parallel requests → quota enforced ✓
   - Period rollover → quota reset ✓
   - Premium user → unlimited access ✓

---

### REQ-5: Security Documentation
**Priority**: P1 (High)  
**Type**: Documentation

Document all security fixes, deployment procedures, and operational guidelines.

**Acceptance Criteria:**
- Security fix changelog created
- Key rotation procedure documented
- SSRF protection configuration documented
- Quota system architecture documented
- Deployment checklist created
- Rollback procedures documented
- Monitoring and alerting guidelines created
- Security incident response plan updated
- Developer security guidelines updated
- Operations manual updated

**Documentation Sections:**
1. **Security Fixes Overview**
   - Vulnerability descriptions
   - Fix implementations
   - Testing results
   - Deployment timeline

2. **Key Rotation Procedure**
   - When to rotate keys
   - How to generate new keys
   - Re-encryption process
   - Rollback procedure

3. **SSRF Protection Configuration**
   - URL whitelist management
   - IP blacklist updates
   - Monitoring SSRF attempts
   - Incident response

4. **Quota System Operations**
   - Monitoring quota usage
   - Detecting quota bypass attempts
   - Adjusting limits
   - Troubleshooting

---

## Non-Functional Requirements

### Performance
- Encryption/decryption performance impact < 10ms per operation
- URL validation overhead < 5ms per request
- Atomic quota check latency < 50ms (p95)
- No degradation in API response times

### Reliability
- All security fixes must maintain 99.9% uptime
- Graceful fallback if security checks fail
- No data loss during key rotation
- Atomic operations must be truly atomic

### Compatibility
- Backward compatible with existing encrypted data
- No breaking changes to API contracts
- Existing user sessions remain valid
- Database migrations are reversible

### Security
- All fixes must pass security review
- Penetration testing required before production
- Security audit report updated
- Compliance with OWASP Top 10

---

## Dependencies

### External Dependencies
- PostgreSQL 14+ (for RPC functions and locking)
- Supabase (for database and RLS)
- Node.js crypto module (for encryption)
- TypeScript 5+ (for type safety)

### Internal Dependencies
- `src/lib/supabase/server.ts` - Database client
- `src/types/database.ts` - Database types
- `src/types/api.ts` - API types
- Existing authentication system
- Existing rate limiting infrastructure

---

## Risks and Mitigations

### Risk 1: Key Rotation Breaks Existing Data
**Likelihood**: Medium  
**Impact**: Critical  
**Mitigation**: 
- Maintain backward compatibility with old key versions
- Thorough testing with production data samples
- Gradual rollout with monitoring
- Rollback plan ready

### Risk 2: SSRF Protection Blocks Legitimate URLs
**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**:
- Comprehensive whitelist of legitimate domains
- User feedback mechanism for blocked URLs
- Monitoring and alerting for blocked requests
- Easy whitelist update process

### Risk 3: Atomic Quota System Performance Issues
**Likelihood**: Low  
**Impact**: High  
**Mitigation**:
- Database indexing optimization
- Connection pooling configuration
- Load testing before deployment
- Monitoring query performance
- Fallback to non-atomic check if RPC fails

### Risk 4: Migration Downtime
**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**:
- Zero-downtime migration strategy
- Database function creation is non-blocking
- Gradual feature flag rollout
- Rollback procedure tested

---

## Success Metrics

### Security Metrics
- Zero successful SSRF attacks (monitored)
- Zero quota bypass incidents (monitored)
- 100% of data encrypted with versioned keys
- All security tests passing in CI/CD

### Performance Metrics
- API response time p95 < 500ms (no degradation)
- Encryption overhead < 10ms per operation
- Quota check latency < 50ms p95
- Database query performance maintained

### Business Metrics
- Zero financial loss from quota bypass
- Compliance audit passed
- Security audit score improved
- User trust maintained (no data breaches)

---

## Timeline Estimate

### Phase 1: Atomic Quota Fix (Highest Priority)
- **Duration**: 2-3 days
- **Reason**: Prevents immediate financial loss

### Phase 2: SSRF Protection
- **Duration**: 2-3 days
- **Reason**: Prevents infrastructure attacks

### Phase 3: Encryption Key Rotation
- **Duration**: 3-4 days
- **Reason**: Complex but lower immediate risk

### Phase 4: Testing & Documentation
- **Duration**: 2-3 days
- **Reason**: Ensures quality and maintainability

**Total Estimated Duration**: 9-13 days

---

## Approval

This requirements document must be reviewed and approved by:
- [ ] Security Team Lead
- [ ] Backend Engineering Lead
- [ ] DevOps Lead
- [ ] Product Manager
- [ ] CTO/Technical Director

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-XX | Kiro AI | Initial requirements document |
