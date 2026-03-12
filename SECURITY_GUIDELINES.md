# 🔐 SECURITY_GUIDELINES.md — SafeWallet Security & Compliance

> **SafeWallet menangani data keuangan.** Security bukan fitur opsional — ini fondasi.
> Semua developer WAJIB baca file ini sebelum menulis code.

---

## 1. Data Classification

| Level | Jenis Data | Contoh | Perlakuan |
|-------|-----------|--------|-----------|
| 🔴 **Critical** | Financial credentials | Bank statement images, income | Encrypt, don't store raw, minimal retention |
| 🟠 **Sensitive** | PII | Email, phone, nama | Encrypt at rest, hash for analytics |
| 🟡 **Internal** | App data | Scan results, scores, badges | Standard protection, RLS enforced |
| 🟢 **Public** | Non-personal | Aggregated stats, tips | No special protection needed |

### Rules per Level

**🔴 Critical:**
- OCR diproses **client-side** (Tesseract.js di browser)
- Raw bank statement image **TIDAK disimpan** di server
- Hanya teks hasil OCR yang dikirim ke API
- Income di-hash jika dipakai untuk analytics

**🟠 Sensitive:**
- Nomor telepon di-encrypt (AES-256) sebelum store
- Email hashing untuk analytics (SHA-256 + salt)
- Tidak boleh muncul di log/error reports

**🟡 Internal:**
- Dilindungi via Supabase RLS
- Accessible hanya oleh user pemilik data

---

## 2. Authentication & Authorization

### Auth Flow

```
User → Login page → [Magic Link | Google OAuth]
  → Supabase Auth → JWT token (1 jam)
  → Auto-refresh via Supabase SDK (30 hari)
  → Logout → Clear session + revoke token
```

### Authorization Matrix

| Resource | Free User | Premium User | Admin |
|----------|-----------|-------------|-------|
| Own scans (CRUD) | ✅ | ✅ | ✅ |
| Other user scans | ❌ | ❌ | ✅ (read only) |
| Scan quota (3/mo) | ✅ (enforced) | ✅ (unlimited) | N/A |
| Subscribe | ✅ | ✅ (upgrade) | N/A |
| User management | ❌ | ❌ | ✅ |

### Supabase RLS Policies

```sql
-- Users can only see their own data
CREATE POLICY "Users read own data"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own data"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Never disable RLS in production!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counts ENABLE ROW LEVEL SECURITY;
```

---

## 3. Input Validation

### Rules

| Input | Validation | Max Size |
|-------|------------|----------|
| Image upload | MIME: `image/jpeg`, `image/png` only | 5 MB |
| Text input | Sanitize HTML, trim whitespace | 10,000 chars |
| URL | Valid URL format, no internal IPs | 2,048 chars |
| Email | RFC 5322 format | 254 chars |
| Phone | Indonesian format (+62...) | 15 chars |
| Income | Positive integer, max 1B | — |

### Zod Schema Pattern

```typescript
// lib/validation.ts
import { z } from 'zod';

export const scanSchema = z.object({
  image: z.instanceof(File)
    .refine(f => f.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(f => ['image/jpeg', 'image/png'].includes(f.type), 'JPEG/PNG only'),
  bank_hint: z.enum(['bca', 'bri', 'mandiri', 'bni', 'dana', 'ovo', 'gopay']).optional(),
  monthly_income: z.number().positive().max(1_000_000_000).optional()
});

export const scamCheckSchema = z.object({
  input_type: z.enum(['text', 'url', 'screenshot']),
  content: z.string().min(1).max(10_000),
  company_name: z.string().max(200).optional()
});

// Gunakan di setiap API route:
const parsed = scanSchema.safeParse(requestBody);
if (!parsed.success) {
  return Response.json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: parsed.error.message }
  }, { status: 400 });
}
```

---

## 4. Encryption & Data Protection

| Layer | Method | Implementation |
|-------|--------|----------------|
| **In Transit** | TLS 1.3 | Enforced by Vercel & Cloudflare (auto) |
| **At Rest** | AES-256 | Supabase default encryption |
| **Phone Number** | Application-level encrypt | `crypto.createCipheriv('aes-256-gcm', key, iv)` |
| **API Keys** | Environment variables | Cloudflare Secrets / Vercel env (encrypted) |
| **Passwords** | N/A | Magic link — no passwords stored |

### Secrets Management

```
✅ DO:
  - Store secrets in Vercel/Cloudflare environment variables
  - Use different keys per environment (dev/staging/prod)
  - Rotate API keys every 90 days

❌ DON'T:
  - Commit .env files to git
  - Log API keys or tokens
  - Hardcode secrets in source code
  - Share secrets via chat/email
```

---

## 5. UU PDP (Undang-Undang Perlindungan Data Pribadi) Compliance

Indonesia Data Protection Law (UU No. 27 Tahun 2022):

| Requirement | Implementation |
|-------------|----------------|
| **Consent** | Explicit consent popup saat signup — user harus centang |
| **Purpose Limitation** | Data hanya dipakai untuk analisis keuangan — tercantum di privacy policy |
| **Data Minimization** | Hanya kumpulkan yang diperlukan — no tracking pixels, no third-party analytics |
| **Right to Access** | `GET /api/user/data-export` — download semua data pribadi |
| **Right to Delete** | `DELETE /api/user/account` — hard delete semua data dalam 30 hari |
| **Data Retention** | Auto-delete setelah 2 tahun tidak aktif |
| **Breach Notification** | Notifikasi user dalam 72 jam jika breach |
| **Data Protection Officer** | Tunjuk DPO sebelum 10K users |

### Privacy Policy Checklist
- [ ] Jelaskan data apa yang dikumpulkan
- [ ] Jelaskan tujuan penggunaan data
- [ ] Jelaskan pihak ketiga yang menerima data (Supabase, OpenRouter)
- [ ] Jelaskan hak user (akses, hapus, portabilitas)
- [ ] Jelaskan retensi data (2 tahun)
- [ ] Sediakan mekanisme withdrawal consent
- [ ] Bahasa Indonesia yang mudah dipahami

---

## 6. API Security

### Rate Limiting

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),  // 60 requests per minute
  analytics: true
});

export async function rateLimitMiddleware(request: Request, userId: string) {
  const { success, remaining, reset } = await ratelimit.limit(userId);

  if (!success) {
    return Response.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Terlalu banyak request' } },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(reset) } }
    );
  }
}
```

### CORS Configuration

```typescript
// Hanya izinkan domain SafeWallet
const ALLOWED_ORIGINS = [
  'https://safewallet.app',
  'https://www.safewallet.app',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000'
].filter(Boolean);
```

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval';        // Tesseract.js worker
  connect-src 'self' https://*.supabase.co https://openrouter.ai;
  img-src 'self' blob: data:;             // OCR image preview
  style-src 'self' 'unsafe-inline';
  frame-ancestors 'none';
```

---

## 7. Incident Response Plan

| Severity | Contoh | Response Time | Action |
|----------|--------|---------------|--------|
| 🔴 **Critical** | Data breach, auth bypass | <1 jam | Shut down affected endpoints, notify users (72h UU PDP) |
| 🟠 **High** | SQL injection attempt, API key leak | <4 jam | Rotate keys, patch vulnerability, postmortem |
| 🟡 **Medium** | Elevated error rate, DDoS attempt | <24 jam | Enable extra rate limiting, investigate |
| 🟢 **Low** | Failed login spike | <48 jam | Monitor, add CAPTCHA if needed |

### Response Steps
```
1. DETECT → Sentry alert / manual report
2. CONTAIN → Disable affected endpoint / rotate secrets
3. INVESTIGATE → Review logs, determine scope
4. FIX → Patch vulnerability
5. NOTIFY → User notification (jika ada data terdampak)
6. POSTMORTEM → Document root cause & prevention
```

---

## 8. Security Checklist (Pre-Launch)

- [ ] Semua endpoint punya auth middleware
- [ ] RLS enabled di semua tabel Supabase
- [ ] Input validation (Zod) di semua endpoint
- [ ] Rate limiting aktif
- [ ] CORS configured (whitelist only)
- [ ] CSP headers configured
- [ ] .env files di .gitignore
- [ ] No secrets in source code (git-secrets scan)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] OWASP ZAP scan lulus (0 high/critical findings)
- [ ] Sentry configured (scrub PII dari error reports)
- [ ] Privacy policy & consent flow live
- [ ] Data export & delete API working
- [ ] API keys dirotasi (fresh keys for production)

---

*Setiap PR yang menyentuh auth, data model, atau API harus direview terhadap dokumen ini.*
