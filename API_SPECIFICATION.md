# 🔌 API_SPECIFICATION.md — SafeWallet API Contract

> **Version:** v2.0 | **Base URL:** `https://api.safewallet.app`
> Frontend dan backend dapat bekerja independen berdasarkan kontrak ini.

---

## 1. Authentication

### Model: Supabase Auth (JWT-based)

| Method | Endpoint | Description |
|--------|----------|-------------|
| Magic Link | `supabase.auth.signInWithOtp({ email })` | Kirim link login ke email |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` | One-click Google login |
| Logout | `supabase.auth.signOut()` | Hapus session |
| Get Session | `supabase.auth.getSession()` | Cek auth status |

**Auth Header (semua protected endpoint):**
```
Authorization: Bearer <supabase-jwt-token>
```

**Token Lifecycle:**
- Access token: 1 jam (auto-refresh via Supabase SDK)
- Refresh token: 30 hari
- Magic link: expires 10 menit

---

## 2. Response Format

### Success Response
```typescript
{
  success: true,
  data: T,              // Response payload
  meta?: {
    page?: number,
    total?: number,
    remaining_quota?: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable: "QUOTA_EXCEEDED"
    message: string,     // Human-readable: "Batas scan gratis tercapai"
    details?: object     // Additional context
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | Token tidak ada atau expired |
| `AUTH_INVALID` | 401 | Token tidak valid |
| `FORBIDDEN` | 403 | Tidak punya akses ke resource ini |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `QUOTA_EXCEEDED` | 429 | Batas free tier tercapai |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `OCR_FAILED` | 422 | Gagal membaca gambar |
| `AI_UNAVAILABLE` | 503 | AI service timeout/down |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 3. Endpoints

### 3.1 Health Scanner

#### `POST /api/scan` — Upload & Analyze Bank Statement

```typescript
// Request
Content-Type: multipart/form-data

{
  image: File,              // JPEG/PNG, max 5MB
  bank_hint?: string,       // "bca" | "bri" | "mandiri" | "bni" | "dana" | "ovo" | "gopay"
  monthly_income?: number   // Override user profile income
}

// Response 200
{
  success: true,
  data: {
    scan_id: "uuid",
    health_score: 72,                    // 0-100
    categories: {
      "Makanan & Minuman": 2500000,
      "Transport": 800000,
      "Belanja Online": 1200000,
      "Tagihan": 500000,
      "Lainnya": 300000
    },
    debt_to_income_ratio: 0.35,
    savings_rate: 0.15,
    recommendations: [
      "Kurangi belanja online 20% bisa hemat Rp 240K/bulan",
      "Alokasikan 10% income ke dana darurat",
      "Pertimbangkan meal prep untuk kurangi biaya makan"
    ],
    warnings: [
      "Debt ratio >30% — risiko jerat utang tinggi"
    ],
    processing_time_ms: 6500
  },
  meta: { remaining_quota: 2 }
}

// Response 429 (quota exceeded)
{
  success: false,
  error: {
    code: "QUOTA_EXCEEDED",
    message: "Batas 3 scan gratis/bulan tercapai. Upgrade ke Premium?",
    details: { current: 3, limit: 3, resets_at: "2026-04-01T00:00:00Z" }
  }
}
```

#### `GET /api/user/scans` — Scan History

```typescript
// Query params: ?page=1&limit=10

// Response 200
{
  success: true,
  data: [
    {
      scan_id: "uuid",
      health_score: 72,
      created_at: "2026-03-12T07:00:00Z",
      categories: { ... },
      recommendations: [...]
    }
  ],
  meta: { page: 1, total: 15 }
}
```

### 3.2 Scam Detector

#### `POST /api/scam-check` — Verify Investment

```typescript
// Request
Content-Type: application/json

{
  input_type: "text" | "url" | "screenshot",
  content: string,          // Text/URL, atau base64 jika screenshot
  company_name?: string     // Untuk OJK registry check
}

// Response 200
{
  success: true,
  data: {
    check_id: "uuid",
    risk_score: 87,                     // 0-100
    confidence: "high",                 // "low" | "medium" | "high"
    verdict: "HIGH_RISK",              // "SAFE" | "CAUTION" | "HIGH_RISK"
    ojk_status: {
      registered: false,
      checked_at: "2026-03-12T07:00:00Z"
    },
    red_flags: [
      { type: "unrealistic_returns", detail: "15%/bulan = 180%/tahun", severity: "critical" },
      { type: "unlicensed", detail: "Tidak terdaftar di OJK", severity: "critical" },
      { type: "urgency", detail: "Kata 'terbatas' dan 'segera'", severity: "high" }
    ],
    safe_alternatives: [
      { name: "Reksa Dana Pasar Uang", return: "4-6%/tahun", risk: "Rendah" },
      { name: "Deposito Bank", return: "3-5%/tahun", risk: "Sangat Rendah" }
    ]
  },
  meta: { remaining_quota: 4 }
}
```

### 3.3 User Profile & Dashboard

#### `GET /api/user/dashboard` — Aggregated Insights

```typescript
// Response 200
{
  success: true,
  data: {
    user: {
      name: "Budi",
      subscription: "free",
      member_since: "2026-03-01"
    },
    latest_scan: { health_score: 72, date: "2026-03-12" },
    scan_trend: [65, 68, 72],          // Last 3 months
    scam_checks_count: 3,
    badges: [
      { type: "first_scan", name: "Pemula", earned_at: "2026-03-01" },
      { type: "streak_7", name: "Konsisten", earned_at: "2026-03-08" }
    ],
    quota: {
      scans: { used: 1, limit: 3 },
      scam_checks: { used: 1, limit: 5 }
    }
  }
}
```

#### `PATCH /api/user/profile` — Update Profile

```typescript
// Request
{ monthly_income?: number, phone?: string, name?: string }

// Response 200
{ success: true, data: { updated_fields: ["monthly_income"] } }
```

### 3.4 Subscription

#### `POST /api/user/subscribe` — Initiate Subscription

```typescript
// Request
{
  tier: "premium" | "family",
  payment_method: "gopay" | "ovo" | "bank_transfer" | "qris"
}

// Response 200
{
  success: true,
  data: {
    subscription_id: "uuid",
    payment_url: "https://app.midtrans.com/snap/...",  // Redirect user
    expires_at: "2026-04-12T00:00:00Z"
  }
}
```

### 3.5 Webhooks (Internal)

#### `POST /api/webhooks/whatsapp` — Incoming WA Message
```typescript
// Meta Cloud API webhook payload (auto-handled)
// Verifikasi: X-Hub-Signature-256 header
```

#### `POST /api/webhooks/midtrans` — Payment Notification
```typescript
// Midtrans notification payload (auto-handled)
// Verifikasi: Server key signature
```

#### `POST /api/cron/coaching` — Daily Coaching Trigger
```typescript
// Cloudflare Cron Trigger (no request body)
// Schedule: 0 0 * * * (00:00 UTC = 07:00 WIB)
```

---

## 4. Rate Limiting

| Tier | Scan | Scam Check | API General |
|------|------|------------|-------------|
| **Free** | 3/month | 5/month | 60 req/min |
| **Premium** | Unlimited | Unlimited | 120 req/min |
| **Family** | Unlimited (per member) | Unlimited | 120 req/min |

**Rate limit headers (semua response):**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710234000
```

---

## 5. TypeScript Types (Shared)

```typescript
// types/api.ts

// === Enums ===
type SubscriptionTier = 'free' | 'premium' | 'family';
type InputType = 'text' | 'url' | 'screenshot';
type Confidence = 'low' | 'medium' | 'high';
type Verdict = 'SAFE' | 'CAUTION' | 'HIGH_RISK';
type BadgeType = 'first_scan' | 'streak_7' | 'streak_30' | 'scam_hunter' |
                 'saver_100k' | 'saver_1m' | 'health_80' | 'health_90' |
                 'referral_5' | 'premium_member';

// === Core Types ===
interface ScanResult {
  scan_id: string;
  health_score: number;
  categories: Record<string, number>;
  debt_to_income_ratio: number;
  savings_rate: number;
  recommendations: string[];
  warnings: string[];
  processing_time_ms: number;
}

interface ScamCheckResult {
  check_id: string;
  risk_score: number;
  confidence: Confidence;
  verdict: Verdict;
  ojk_status: { registered: boolean; checked_at: string };
  red_flags: Array<{ type: string; detail: string; severity: string }>;
  safe_alternatives: Array<{ name: string; return: string; risk: string }>;
}

// === Zod Schemas (validation) ===
// Lihat CONVENTIONS.md § Validation Patterns
```

---

## 6. WebSocket Events

```typescript
// Real-time job status updates via Supabase Realtime

// Subscribe to scan job status
supabase
  .channel('scan-updates')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'scans', filter: `id=eq.${scanId}` },
    (payload) => {
      if (payload.new.health_score !== null) {
        // Scan complete — update UI
      }
    }
  )
  .subscribe();
```

---

*Semua endpoint memerlukan `Authorization: Bearer <token>` kecuali webhooks.*
*Webhook endpoint memverifikasi via signature header masing-masing platform.*
