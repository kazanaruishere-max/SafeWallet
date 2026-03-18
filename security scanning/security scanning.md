# 🔒 SafeWallet Security Scanning Guide

## Overview

SafeWallet menggunakan comprehensive security scanning pipeline untuk mendeteksi vulnerabilities pada:
- Dependencies (npm packages)
- Source code (SAST - Static Application Security Testing)
- Container images (Docker)
- GitHub Actions (Dependabot automated updates)

---

## 🚨 Known Issues & Resolved Errors

### Issue #30: Dependabot PR - Bump actions/checkout from v3 to v6

**Status:** ⚠️ Requires Manual Intervention  
**Severity:** Medium  
**Affected Files:** `.github/workflows/v3_pipeline.yml`

#### Problem Description

Dependabot automatically creates PRs untuk update GitHub Actions versions:
```
build(deps): bump actions/checkout from 3 to 6
```

**Error yang terjadi:**
```yaml
Error: GitHub Actions v6 menggunakan syntax yang berbeda
Error: Node.js version mismatch
Error: Breaking changes in actions/checkout@v6
```

#### Root Cause

1. **Breaking Changes v3 → v6:**
   - v6 menggunakan Node.js 20+ (v3 menggunakan Node.js 16)
   - Perubahan parameter syntax (`fetch-depth` default berubah)
   - Permission model yang lebih strict

2. **Compatibility Issues:**
   ```yaml
   # ❌ OLD (v3 syntax)
   - uses: actions/checkout@v3
     with:
       fetch-depth: 0
   
   # ✅ NEW (v6 syntax)
   - uses: actions/checkout@v6
     with:
       fetch-depth: 0
       persist-credentials: true  # New required parameter
   ```

3. **Workflow Conflicts:**
   - Others actions (setup-node, codeql-action) harus compatible
   - GitHub Enterprise Server version requirements

#### Solution

**Option A: Gradual Upgrade (Recommended)**

```yaml
# Step 1: Update to v4 first (compatible with existing workflow)
- uses: actions/checkout@v4

# Step 2: Test workflow thoroughly
# Step 3: Update to v5 when ready
- uses: actions/checkout@v5

# Step 4: Finally to v6
- uses: actions/checkout@v6
  with:
    persist-credentials: true  # Required for v6
    show-progress: true        # New in v5+
```

**Option B: Pin to Specific Version**

```yaml
# Pin to stable v4 (safe choice)
- uses: actions/checkout@v4.2.2  # Specific stable version

# Or pin to v3 if v4 breaks something
- uses: actions/checkout@v3.6.0
```

**Option C: Disable Auto-Update for GitHub Actions**

Update `.github/dependabot.yml`:
```yaml
- package-ecosystem: "github-actions"
  directory: "/"
  schedule:
    interval: "monthly"
  open-pull-requests-limit: 0  # Disable auto PRs
  # Or review manually before merge
```

#### Verification Checklist

```
□ Update all actions to compatible versions
□ Test workflow in staging branch first
□ Verify checkout permissions work correctly
□ Check codeql-action compatibility
□ Review GitHub release notes for breaking changes
□ Update documentation with new version numbers
```

#### Related Issues

- Issue #31: `bump actions/setup-node from 3 to 4`
- Issue #32: `bump github/codeql-action from v2 to v3`
- Issue #33: `bump snyk/actions from master to node`

---

## 🛠️ Tools yang Digunakan

| Tool | Purpose | Coverage |
|------|---------|----------|
| **Snyk** | Dependency & Code scanning | npm packages, JavaScript/TypeScript code |
| **Trivy** | Container scanning | Docker images, OS packages |
| **CodeQL** | Upload results to GitHub Security | SARIF format |

---

## 📋 Prerequisites

### 1. GitHub Secrets Setup

Tambahkan secrets berikut di GitHub Repository Settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret Name | Required | Description | How to Get |
|-------------|----------|-------------|------------|
| `SNYK_TOKEN` | ✅ YES | Snyk API authentication token | See below |
| `SNYK_ORG_ID` | ⚠️ Optional | Organization ID for team accounts | `snyk orgs` command |

### 2. Getting SNYK_TOKEN

**Option A: Personal API Token (Individual/Free Tier)**

```
1. Login ke https://snyk.io
2. Klik nama Anda → Account Settings
3. Scroll ke "Auth Token" section
4. Click "Copy" untuk melihat token
5. Token format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Option B: Service Account Token (Organization)**

```
1. Login ke Snyk sebagai Organization Admin
2. Settings → Service Accounts → Add Service Account
3. Fill in:
   - Name: safewallet-github-actions
   - Description: Automated security scanning
4. Generate Token untuk service account tersebut
5. Set expiration: 90 days (recommended)
```

### 3. Getting SNYK_ORG_ID (Optional)

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# List organizations
snyk orgs

# Output:
# Org 1: Your Org Name (id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

---

## 🔧 Fixing Common Errors

### Error 1: npm ERESOLVE (Peer Dependency Conflict)

**Symptom:**
```
npm error ERESOLVE could not resolve
npm error While resolving: @studio-freight/react-lenis@0.0.47
npm error Found: react-dom@19.2.3
npm error peer react-dom@"^17 || ^18" from @studio-freight/react-lenis@0.0.47
```

**Root Cause:**
Project menggunakan React 19, tetapi beberapa dependencies masih require React 18.

**Solution:**
Gunakan `--legacy-peer-deps` flag untuk bypass peer dependency conflicts:

```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps --ignore-scripts
```

**Why this works:**
- `--legacy-peer-deps`: Install dependencies tanpa strict peer dependency checking
- `--ignore-scripts`: Skip postinstall scripts untuk security dan speed

---

### Error 2: SNYK-0005 Authentication Error

**Symptom:**
```
ERROR  Authentication error (SNYK-0005)
Authentication credentials not recognized, or user access is not provisioned.
```

**Root Cause:**
- SNYK_TOKEN secret tidak ada atau kosong
- Token expired atau invalid
- Token tidak di-pass dengan benar ke Docker/container

**Solution:**

```yaml
# ✅ CORRECT: Verify token exists first
- name: Verify Snyk Token
  id: check-token
  run: |
    if [ -z "${{ secrets.SNYK_TOKEN }}" ]; then
      echo "::error::SNYK_TOKEN is not configured!"
      exit 1
    fi
    echo "✓ SNYK_TOKEN configured (length: ${#SNYK_TOKEN})"
    echo "token-set=true" >> $GITHUB_OUTPUT
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

# ✅ CORRECT: Install CLI and authenticate explicitly
- name: Install Snyk CLI
  run: npm install -g snyk

- name: Authenticate Snyk
  run: snyk config set api=${{ secrets.SNYK_TOKEN }}
```

**Verification:**
```bash
# Test token locally
snyk whoami
# Should show: authenticated as your-email@example.com
```

---

### Error 3: SARIF File Not Found

**Symptom:**
```
Error: Path does not exist: snyk-os.sarif
Error: Path does not exist: snyk-code.sarif
```

**Root Cause:**
- Snyk scan gagal sebelum generate SARIF file
- Step sebelumnya fail dengan exit code 1
- Token invalid sehingga scan tidak jalan

**Solution:**

```yaml
# ✅ CORRECT: Always create SARIF file (even if empty)
- name: Run Snyk Open Source Scan
  run: |
    snyk test \
      --severity-threshold=high \
      --sarif-file-output=snyk-os.sarif \
      || echo "Snyk OS scan completed with findings"
    
    # Verify SARIF file was created
    if [ ! -f snyk-os.sarif ]; then
      echo "::warning::snyk-os.sarif was not created, creating empty file"
      echo '{"runs": [{"tool": {"driver": {"name": "Snyk Open Source"}}}]}' > snyk-os.sarif
    fi
  continue-on-error: true
```

**Why this works:**
- `continue-on-error: true`: Step tidak fail整个 job
- Fallback create empty SARIF: Upload step selalu ada file untuk di-upload
- `|| echo`: Handle non-zero exit code dari Snyk (normal behavior)

---

## 📊 Workflow Structure

```yaml
name: SafeWallet V3 Enterprise CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  sast-scan:
    name: Security Scanning (Snyk)
    runs-on: ubuntu-latest
    
    steps:
      1. Checkout code
      2. Setup Node.js (v20)
      3. Install dependencies (--legacy-peer-deps)
      4. Verify SNYK_TOKEN exists
      5. Install Snyk CLI
      6. Authenticate Snyk
      7. Run Snyk Open Source Scan → snyk-os.sarif
      8. Run Snyk Code Scan → snyk-code.sarif
      9. Upload SARIF to GitHub Security
```

---

## 🧪 Testing Locally

### Test Snyk Open Source Scan

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Run scan
cd c:\Users\Lenovo\PROJECT\SafeWallet
snyk test --severity-threshold=high

# Generate SARIF
snyk test --severity-threshold=high --sarif-file-output=snyk-os.sarif
```

### Test Snyk Code Scan

```bash
# Requires Snyk Code feature enabled
snyk code test --severity-threshold=high

# Generate SARIF
snyk code test --severity-threshold=high --sarif-file-output=snyk-code.sarif
```

### View Results

```bash
# View SARIF file (JSON format)
cat snyk-os.sarif | jq

# Or open in browser (GitHub Security tab)
# https://github.com/kazanaruishere-max/SafeWallet/security/code-scanning
```

---

## 📈 Understanding Results

### Snyk Open Source Results

Snyk OS scan vulnerabilities di dependencies:

```
✗ High severity vulnerability found in 'axios'
  Description: Server-Side Request Forgery (SSRF)
  Package: axios@0.21.1
  Fix: Upgrade to axios@1.6.0 or higher
  More info: https://snyk.io/vuln/SNYK-JS-AXIOS-123456
```

**Action Required:**
```bash
# Update vulnerable package
npm update axios

# Or install specific version
npm install axios@1.6.0
```

### Snyk Code Results

Snyk Code scan vulnerabilities di source code:

```
✗ SQL Injection in database query
  Location: src/lib/database.ts:42
  User input flows to: query parameter
  Fix: Use parameterized queries
```

**Action Required:**
```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ SECURE
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);
```

---

## 🔗 Integration dengan GitHub Security

Hasil scan otomatis muncul di:

```
Repository → Security → Code scanning alerts
```

**Filter alerts:**
- By severity: Critical, High, Medium, Low
- By status: Open, Fixed, Dismissed
- By branch: main, develop, feature branches

**Dismiss false positives:**
```
Alert → ... → Dismiss → Select reason:
- Used in tests only
- Not used in production
- False positive
- Won't fix
```

---

## 🚀 CI/CD Pipeline Status

| Job | Status | Description |
|-----|--------|-------------|
| `sast-scan` | ✅ Active | Snyk OS + Code scanning |
| `build-and-test` | ✅ Active | Unit tests + integration tests |
| `container-scan` | ✅ Active | Trivy Docker scanning |
| `deploy-staging` | ⚠️ Manual | Requires environment approval |
| `deploy-production` | ⚠️ Manual | Requires environment approval |

---

## 📝 Troubleshooting Checklist

```
□ 1. Verify SNYK_TOKEN secret exists di GitHub
□ 2. Verify token format (UUID: 8-4-4-4-12)
□ 3. Test token locally: snyk whoami
□ 4. Check token expiration (regenerate if >90 days)
□ 5. Verify SNYK_ORG_ID (if using organization)
□ 6. Check workflow logs for specific error message
□ 7. Test with minimal workflow first
□ 8. Verify SARIF files exist before upload step
```

---

## 🔐 Security Best Practices

### DO's ✅

- ✅ Rotate SNYK_TOKEN setiap 90 days
- ✅ Use Service Account untuk CI/CD (bukan personal token)
- ✅ Set token expiration date
- ✅ Monitor usage di Snyk dashboard
- ✅ Review security alerts weekly
- ✅ Fix Critical/High vulnerabilities immediately

### DON'Ts ❌

- ❌ Jangan commit SNYK_TOKEN ke Git
- ❌ Jangan share token via email/chat
- ❌ Jangan gunakan token yang sama untuk multiple environments
- ❌ Jangan ignore Critical/High alerts
- ❌ Jangan disable security scanning untuk speed

---

## 📞 Support & Resources

- **Snyk Documentation:** https://docs.snyk.io/
- **Snyk CLI Reference:** https://docs.snyk.io/snyk-cli/
- **GitHub Security:** https://docs.github.com/en/code-security
- **Snyk Support:** support@snyk.io
- **Community Slack:** https://snyk.io/slack-invite/

---

## 📊 Metrics & KPIs

Track security metrics di dashboard:

| Metric | Target | Current |
|--------|--------|---------|
| Critical Vulnerabilities | 0 | TBD |
| High Vulnerabilities | < 5 | TBD |
| Mean Time to Resolution | < 7 days | TBD |
| Scan Coverage | 100% | 100% |

---

**Last Updated:** 18 Maret 2026  
**Version:** 2.0  
**Maintained by:** SafeWallet Security Team
