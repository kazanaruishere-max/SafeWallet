# 🔍 SafeWallet — Full Security & Performance Audit

**Date:** 14 Maret 2026  
**Scope:** Seluruh codebase (`src/`, `middleware.ts`, `next.config.ts`, `vercel.json`)  
**Files scanned:** 14 API routes, 14 lib modules, middleware, config

---

## Ringkasan Temuan

| Severity | Jumlah | Area |
|:---:|:---:|---|
| 🔴 CRITICAL | 4 | Payment webhook, Cron auth bypass, API key exposure, Delete tanpa konfirmasi |
| 🟠 HIGH | 6 | Race condition quota, No IP rate limit, Data ke AI tanpa consent, CSP lemah, Missing CORS, Telegram token |
| 🟡 MEDIUM | 7 | No caching, Error detail leak, Export tanpa limit, Missing input validation, Retry loop, No audit log, OCR trust |
| 🔵 LOW | 5 | Console.log di production, No request timeout, Missing CSRF, Gamification bypass, Typo env var |

**Skor Keseluruhan: 4.7 / 10**

---

## 🔴 CRITICAL — Harus Diperbaiki Segera

### C1. Midtrans Webhook — Signature Tidak Diverifikasi

> ⚠️ **RISIKO:** Siapapun bisa mengirim POST palsu ke `/api/webhooks/midtrans` dan mengaktifkan subscription tanpa bayar.

**File:** `src/app/api/webhooks/midtrans/route.ts`

```ts
// Line 14: TODO masih aktif — signature check TIDAK DILAKUKAN
// TODO: Verify Midtrans signature
```

**Dampak:** Payment fraud — user bisa mendapat subscription premium gratis.  
**Fix:** Implementasi SHA-512 signature verification sebelum memproses setiap payment notification.

---

### C2. Cron Endpoint — Auth Bypass jika `CRON_SECRET` Kosong

**File:** `src/app/api/cron/coaching/route.ts` (Line 18)

```ts
// Jika CRON_SECRET undefined → kondisi ini SELALU TRUE → bypass
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
```

Ditambah **typo** di `.env.local`: `CRON_SECRE` (tanpa T).  Kode mencari `CRON_SECRET` → selalu `undefined` → auth di-skip.

**Dampak:** Siapapun bisa trigger cron endpoint → spam AI calls → biaya API membengkak.  
**Fix:**
1. Rename env var ke `CRON_SECRET` (tambah T)
2. Ubah logic: throw error jika `CRON_SECRET` tidak ada

---

### C3. Gemini API Key Exposed di URL Query String

**File:** `src/lib/ai/client.ts` (Line 92)

```ts
const endpoint = `${GEMINI_URL}/${model}:generateContent?key=${apiKey}`;
```

API key ada di URL → terlihat di:
- Server access logs
- CDN/proxy logs
- Browser network tab (jika debugging)
- Error reporting services

**Fix:** Pindahkan ke header: `x-goog-api-key: ${apiKey}`

---

### C4. User Delete — Tanpa Konfirmasi & Incomplete

**File:** `src/app/api/user/delete/route.ts`

| Masalah | Detail |
|---|---|
| Tanpa konfirmasi | Tidak ada password/OTP verification sebelum delete |
| Wrong client | Menggunakan `createClient()` (user-level RLS), bukan admin — jika RLS restrict DELETE, data tetap ada tapi user sudah sign out |
| Auth tidak dihapus | Supabase Auth user tidak di-delete, hanya data di tabel |

**Dampak:** Accidental deletion, incomplete data removal, ghost auth accounts.

---

## 🟠 HIGH — Risiko Tinggi

### H1. Race Condition pada Rate Limiting

**File:** `src/lib/rate-limit.ts` (Line 64-84)

```ts
const { data: existing } = await supabase.select(...)  // Read
if (existing) await supabase.update(...)                // Write
else await supabase.insert(...)                         // Write
```

Read → Check → Write tanpa locking. 10 request bersamaan → semua lolos quota check.

**Fix:** Gunakan database-level atomic operation:
```sql
INSERT INTO usage_counts (user_id, feature, period, count) 
VALUES ($1, $2, $3, 1)
ON CONFLICT (user_id, feature, period) 
DO UPDATE SET count = usage_counts.count + 1
RETURNING count;
```

---

### H2. Tidak Ada IP-Based Rate Limiting

Rate limit hanya berdasarkan `user_id`. Artinya:
- Bot bisa brute-force login tanpa limit
- Unauthenticated endpoints (webhooks) bisa di-spam unlimited
- DDoS pada AI endpoints → tiap request = biaya API

**Fix:** `@upstash/ratelimit` atau Vercel Edge Middleware pada IP address.

---

### H3. Data Finansial Dikirim ke Google Gemini Tanpa Explicit Consent

**File:** `src/app/api/scan/route.ts` (Line 181-187)

Data mutasi bank (nama, nomor rekening, transaksi) dikirim ke Google AI API.  
Secara **UU PDP**, ini pengiriman data pribadi ke pihak ketiga tanpa consent.

**Fix:**
1. Tampilkan consent popup sebelum scan pertama
2. Strip PII (nama, nomor rekening) dari OCR text sebelum kirim ke AI

---

### H4. CSP Mengizinkan `unsafe-inline` dan `unsafe-eval`

**File:** `next.config.ts` (Line 54)

```ts
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io"
```

`unsafe-eval` memungkinkan `eval()`, `Function()`, dan string-based code execution → melemahkan perlindungan XSS.

**Fix:** Gunakan nonce-based CSP untuk inline scripts.

---

### H5. Telegram Webhook — Tidak Ada Source Verification

**File:** `src/app/api/webhooks/telegram/route.ts`

Siapapun yang tahu URL webhook bisa mengirim fake message → mendapat AI response → menghabiskan API quota.

**Fix:** Set `secret_token` saat register webhook, verifikasi header `X-Telegram-Bot-Api-Secret-Token`.

---

### H6. Error Detail Leak ke Client

**File:** `src/app/api/scan/route.ts` (Line 338)

```ts
details: { hint: String(error) }, // Stack trace bisa terexpose
```

**Fix:** Hanya kirim error code ke client, log full detail di server.

---

## 🟡 MEDIUM — Perlu Diperbaiki

### M1. Zero Caching Strategy

| Endpoint | Cacheable? | Status |
|---|:---:|:---:|
| `/api/user/dashboard` | ✅ (5 min) | ❌ No cache |
| `/api/user/badges` | ✅ (1 jam) | ❌ No cache |
| `/api/user/scans` | ✅ (5 min) | ❌ No cache |
| `/api/user/profile` | ✅ (5 min) | ❌ No cache |

Setiap page load = fresh database query. Tidak ada `Cache-Control`, `stale-while-revalidate`, atau in-memory cache.

**Fix:** Tambahkan `Cache-Control: private, max-age=300, stale-while-revalidate=60`.

---

### M2. Data Export Tanpa Rate Limit

**File:** `src/app/api/user/export/route.ts`

User bisa hit `/api/user/export` unlimited → 6 parallel DB queries per request → potential database DDoS.

---

### M3. OCR Text Dipercaya Begitu Saja

**File:** `src/app/api/scan/route.ts` (Line 146)

```ts
const ocrText = formData.get("ocr_text") as string | null;
```

OCR dilakukan client-side → user bisa manipulasi `ocr_text` → health score palsu → badge farming.

---

### M4. AI Retry — Potential Deep Recursion

**File:** `src/lib/ai/client.ts`

Network error path bisa recurse jika fallback model juga network-fails tanpa explicit depth limit.

---

### M5. Scam Check — Quota Increment Tanpa DB Success Check

**File:** `src/app/api/scam-check/route.ts` (Line 133)

```ts
await incrementUsage(user.id, "scam_check"); // Selalu jalan
```

Jika `insertError` terjadi, quota tetap di-increment → user kehilangan jatah tanpa hasil.

---

### M6. Tidak Ada Audit Log

Tidak ada mekanisme pencatatan untuk:
- Login/logout events
- Delete account actions
- Failed authentication attempts
- API key usage

---

### M7. `CRON_SECRE` — Typo di Environment Variable

```
CRON_SECRE="safewallet-cron-2026-xK9mP3nR7qW2"  // Harusnya CRON_SECRET
```

Kode mencari `CRON_SECRET` → selalu `undefined` → cron auth bypass (lihat C2).

---

## 🔵 LOW — Nice to Have

| # | Issue | Detail |
|---|---|---|
| L1 | `console.log` di production | No structured logging, no Sentry integration |
| L2 | No request timeout | AI calls bisa hang indefinitely — no `AbortController` |
| L3 | Missing CORS | Tidak ada CORS headers di API routes |
| L4 | Badge farming | Badges dari scan count → bisa dimanipulasi via OCR palsu |
| L5 | Body size mismatch | `next.config: 5mb` vs scan route accepts `20mb` |

---

## 📊 Skor Per Kategori

| Kategori | Skor | Keterangan |
|---|:---:|---|
| Authentication | 7/10 | Supabase Auth solid, tapi no RBAC, no MFA |
| Authorization | 6/10 | RLS ada tapi delete/export tanpa konfirmasi |
| Input Validation | 7/10 | Magic bytes check ✅, sanitizer ✅, tapi OCR dipercaya |
| API Security | 4/10 | No IP rate limit, no CORS, API key di URL |
| Data Privacy | 5/10 | No E2E encryption, data ke AI tanpa consent |
| Performance | 4/10 | Zero caching, no CDN, no timeout |
| Error Handling | 6/10 | Error codes baik, tapi stack trace leak |
| Monitoring | 2/10 | Console.log only, no audit trail |
| Payment | 1/10 | Signature NOT verified |
| **Overall** | **4.7/10** | |

---

## 🎯 Prioritas Perbaikan

| # | Fix | Severity | Effort |
|:---:|---|:---:|:---:|
| 1 | Midtrans signature verification | 🔴 | 1 jam |
| 2 | Fix `CRON_SECRE` typo + enforce check | 🔴 | 15 min |
| 3 | Move API key ke header | 🔴 | 15 min |
| 4 | Add IP rate limiting | 🟠 | 2 jam |
| 5 | Fix race condition quota (atomic upsert) | 🟠 | 1 jam |
| 6 | Add response caching | 🟡 | 1 jam |
| 7 | Strip PII before AI | 🟠 | 2 jam |
| 8 | Add Telegram webhook secret | 🟠 | 30 min |
| 9 | Add delete confirmation flow | 🔴 | 2 jam |
| 10 | Structured logging + Sentry | 🔵 | 3 jam |
