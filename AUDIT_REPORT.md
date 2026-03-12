# SafeWallet — Comprehensive Audit & Upgrade Roadmap

> **Audited:** 20+ source files · 20 routes · 7 API endpoints
> **Date:** 2026-03-12 · **Auditor:** Antigravity AI

---

## 📊 Ringkasan Temuan

| Severity | Count | Contoh |
|----------|-------|--------|
| 🔴 **FATAL** | 5 | API key exposed, no real OCR, mock data in production |
| 🟠 **CRITICAL** | 8 | Race condition rate limiter, no input sanitization, XSS vectors |
| 🟡 **MEDIUM** | 10 | Profile page static, no logout, hardcoded limits |
| 🟢 **MINOR** | 12 | Typo "Claude" bukan "Gemini", missing loading states |

---

## 🔴 FATAL — Harus Diperbaiki Sebelum Go-Live

### F1. Gemini API Key Exposed di URL Query String
**File:** `lib/ai/client.ts:73`
```typescript
const endpoint = `${GEMINI_URL}/${model}:generateContent?key=${apiKey}`;
```
**Masalah:** API key dikirim via URL query parameter. Jika ada logging di infrastructure (Vercel, CDN, proxy), key bisa terexpose di server logs.
**Fix:** Gunakan header `x-goog-api-key` atau pindah ke Google AI SDK.

---

### F2. OCR Masih Mock Data — Selalu Mengirim Data Palsu
**File:** `app/(dashboard)/dashboard/scan/page.tsx:53-68`
```typescript
await new Promise((r) => setTimeout(r, 1500));
const mockOcrText = `BCA - Mutasi Rekening...`; // ← FAKE DATA
```
**Masalah:** Setiap user upload gambar APAPUN, yang dikirim ke AI selalu data mutasi palsu yang sama. Hasil scan selalu identik.
**Impact:** Fitur inti 100% tidak berfungsi. User akan kecewa karena hasil tidak relevan.
**Fix:** Integrasikan Tesseract.js untuk real OCR.

---

### F3. Profile Page Tidak Terhubung ke API
**File:** `app/(dashboard)/dashboard/profile/page.tsx`
**Masalah:** Profile page is purely static HTML. Buttons "Simpan Perubahan", "Upgrade Premium", "Download", "Hapus Akun" — semua tidak berfungsi. Input fields tidak connected ke state atau API.
**Impact:** User tidak bisa update income, phone, atau manage account.
**Fix:** Convert to `"use client"`, fetch data via `/api/user/profile`, tambah form handlers.

---

### F4. Login/Signup Tidak Handle `?error=` & `?redirect=`
**File:** `app/(auth)/login/page.tsx`
**Masalah:**
1. Middleware set `?redirect=/dashboard/scan` saat unauthenticated, tapi login page tidak membaca `redirect` param untuk post-login navigation
2. Callback route set `?error=auth_failed` saat OAuth gagal, tapi login page tidak menampilkan error
**Impact:** User selalu redirect ke `/dashboard` setelah login, bukan ke halaman yang diminta.

---

### F5. Text Menyebut "Claude AI" Padahal Pakai Gemini
**File:** `app/(dashboard)/dashboard/scan/page.tsx:212,412`
```
"Teks diekstrak & dianalisis Claude AI"
"Menganalisis dengan AI Claude..."
```
**Impact:** Menyesatkan user tentang teknologi yang dipakai.

---

## 🟠 CRITICAL — Kerentanan Keamanan & Fungsional

### C1. Race Condition di Rate Limiter
**File:** `lib/rate-limit.ts:63-84`
**Masalah:** `checkQuota()` dan `incrementUsage()` terpisah tanpa transaksi atomik. Jika user mengirim 5 request simultaneous, semua lolos quota check sebelum increment terjadi.
**Fix:** Gunakan Supabase RPC atau database-level `UPDATE ... RETURNING` dengan atomic increment.

### C2. Tidak Ada Input Sanitization untuk AI Prompt
**File:** `app/api/scam-check/route.ts:84`
**Masalah:** User content langsung dikirim ke AI prompt tanpa sanitization. Prompt injection attack dimungkinkan — user bisa manipulasi AI untuk selalu return "SAFE" bahkan untuk scam nyata.
**Fix:** Sanitize input, strip control characters, limit length, tambah AI guardrails.

### C3. JSON.parse Tanpa Validation
**File:** `app/api/scan/route.ts:124`, `app/api/scam-check/route.ts:89`
```typescript
analysisResult = JSON.parse(aiResponse.content);
```
**Masalah:** Tidak ada Zod/schema validation pada AI response. Jika AI return format berbeda, app crash.
**Fix:** Gunakan `zod.safeParse()` untuk validate AI response shape.

### C4. Object URL Memory Leak
**File:** `app/(dashboard)/dashboard/scan/page.tsx:44`
```typescript
setPreview(URL.createObjectURL(file));
```
**Masalah:** `URL.revokeObjectURL()` tidak pernah dipanggil. Setiap scan membuat memory leak baru.

### C5. Tidak Ada Logout Function
**Masalah:** Tidak ada tombol atau fungsi logout di seluruh aplikasi. User header/dropdown mungkin punya UI tapi `supabase.auth.signOut()` tidak terimplementasi.

### C6. Auth Callback Open Redirect
**File:** `app/auth/callback/route.ts:7`
```typescript
const next = searchParams.get("next") ?? "/dashboard";
return NextResponse.redirect(`${origin}${next}`);
```
**Masalah:** Parameter `next` tidak divalidasi. Attacker bisa set `?next=//evil.com` untuk open redirect.
**Fix:** Validate `next` starts with `/` and doesn't contain `//`.

### C7. Subscription API Langsung Activate Tanpa Payment
**File:** `app/api/user/subscribe/route.ts`
**Masalah:** POST ke `/api/user/subscribe` langsung update user tier ke premium TANPA menunggu pembayaran berhasil. User bisa upgrade free ke premium tanpa bayar.
**Fix:** Set status ke `pending` dan hanya activate setelah Midtrans webhook confirm payment.

### C8. Dashboard API 6 Sequential DB Queries
**File:** `app/api/user/dashboard/route.ts`
**Masalah:** 6 query ke Supabase dijalankan secara sequential. Setiap query ~50-100ms = total 300-600ms latency.
**Fix:** Gunakan `Promise.all()` untuk parallel queries.

---

## 🟡 MEDIUM — Perlu Perbaikan

| # | Issue | File | Fix |
|---|-------|------|-----|
| M1 | Quota info hardcoded "3/3" di profile | `profile/page.tsx:63` | Fetch dari API |
| M2 | Tidak ada dark mode toggle | Layout | Tambah theme provider |
| M3 | `image_url: "client-side-only"` dummy value di DB | `scan/route.ts:143` | Upload ke Supabase Storage |
| M4 | Tidak ada pagination UI di scan history | Dashboard | Tambah pagination component |
| M5 | Badge auto-award tidak di scam-check flow | `scam-check/route.ts` | Tambah `checkAndAwardBadges()` |
| M6 | OCR text truncated 5000 chars tanpa warning | `scan/route.ts:144` | Info user jika truncated |
| M7 | Coaching cron tidak auth di Vercel Cron | `cron/coaching/route.ts` | Vercel auto-sets CRON headers |
| M8 | `.env.example` mungkin tidak up-to-date | Root | Sync semua env vars |
| M9 | Tidak ada loading skeleton — hanya spinner | `dashboard/page.tsx:34` | Gunakan `DashboardSkeleton` |
| M10 | PWA icons belum ada (404 on /icons/) | `public/` | Generate PWA icon set |

---

## 🟢 MINOR — Polish & Improvement

| # | Issue | Fix |
|---|-------|-----|
| m1 | No `aria-label` on icon-only buttons | Tambah accessibility labels |
| m2 | `console.error` di production API routes | Gunakan proper logging service |
| m3 | Tidak ada API response caching | Tambah `Cache-Control` headers |
| m4 | `satisfies` keyword mungkin konflik di edge | Test di production runtime |
| m5 | Import `React` unused di beberapa files | Clean up imports |
| m6 | No `rel="noopener"` pada external links | Security best practice |
| m7 | Hardcoded "999999" untuk premium limits | Gunakan `Infinity` atau config |
| m8 | Tidak ada email verification flow | Supabase bisa handle ini |
| m9 | No breadcrumbs di dashboard pages | Improve navigation UX |
| m10 | Missing `<title>` per dashboard page | Export metadata per page |
| m11 | No confirmation dialog untuk "Hapus Akun" | Prevent accidental deletion |
| m12 | Landing page stats hardcoded | Fetch real or remove |

---

## 🧩 Fitur Yang Belum Diimplementasi

| Fitur | Status | Priority | Effort |
|-------|--------|----------|--------|
| Real OCR (Tesseract.js) | ❌ Mock | 🔴 Critical | 2 jam |
| Profile form yang berfungsi | ❌ Static HTML | 🔴 Critical | 1 jam |
| Logout button | ❌ None | 🔴 Critical | 15 menit |
| Midtrans payment flow | ❌ Stub | 🟠 High | 4 jam |
| OJK API real check | ❌ Hardcoded false | 🟠 High | 3 jam |
| WhatsApp message sending | ❌ Stub | 🟠 High | 4 jam |
| Data export (GDPR/PDP) | ❌ Button only | 🟡 Medium | 2 jam |
| Delete account | ❌ Button only | 🟡 Medium | 1 jam |
| Onboarding flow | ❌ None | 🟡 Medium | 3 jam |
| Notification system | ❌ None | 🟢 Low | 3 jam |
| Scan history list page | ❌ No page | 🟢 Low | 2 jam |
| Badge display page | ❌ No page | 🟢 Low | 1 jam |
| Multi-language (en/id) | ❌ ID only | 🟢 Low | 4 jam |
| PWA offline support | ❌ No SW | 🟢 Low | 2 jam |

---

## 🛠️ Upgrade Priority — Sprint 5 Plan

### Phase 1: Fix Fatal (Week 1) — MUST DO
```
1. Tesseract.js real OCR integration
2. Profile page → connected to API
3. Logout function
4. Fix "Claude" → "Gemini" text
5. Validate auth callback `next` param
6. Fix subscription API (don't auto-activate)
```

### Phase 2: Fix Critical (Week 1-2) — SHOULD DO
```
1. Atomic rate limiter (Supabase RPC)
2. AI prompt sanitization
3. Zod validation on AI response
4. Parallel dashboard queries (Promise.all)
5. Revoke Object URLs
6. Move Gemini API key to request header
```

### Phase 3: Missing Features (Week 2-3) — NICE TO HAVE
```
1. Working Midtrans payment
2. Real OJK API integration
3. Data export & account deletion
4. PWA icons + service worker
5. Dark mode toggle
6. Scan history page
```

---

## 📋 Security Checklist (OWASP Top 10)

| OWASP | Status | Notes |
|-------|--------|-------|
| A01: Broken Access Control | ⚠️ | Open redirect di callback, subscription bypass |
| A02: Cryptographic Failures | ✅ | Supabase handles encryption |
| A03: Injection | ⚠️ | AI prompt injection possible |
| A04: Insecure Design | ⚠️ | Rate limiter race condition |
| A05: Security Misconfiguration | ✅ | Security headers configured |
| A06: Vulnerable Components | ✅ | Dependencies up-to-date |
| A07: Auth Failures | ⚠️ | No logout, no session timeout |
| A08: Data Integrity | ⚠️ | AI response not validated |
| A09: Logging & Monitoring | ⚠️ | Only console.error, no alerting |
| A10: SSRF | ✅ | No server-side URL fetching |

---

> **Total estimated effort untuk semua fix: ~40 jam (5 hari kerja)**
> **Recommended: Fokus Phase 1 dulu (Fatal fixes) sebelum deploy ke real users.**
