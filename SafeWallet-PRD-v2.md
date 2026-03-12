# SafeWallet PRD v2.0

> AI-powered financial wellness platform — Indonesia market
> Last updated: 2026-03-12 | Status: Ready to Build

---

## 1. Overview

| Key | Detail |
|-----|--------|
| **Product** | SafeWallet — AI financial health scanner, scam detector & coach |
| **Mission** | Prevent debt traps & investment scams through AI analysis |
| **Market** | Indonesia (270M population, 70% tanpa dana darurat, 64% literasi keuangan rendah) |
| **Timeline** | 8-week MVP → Beta Week 5-6 → Launch Week 8 |
| **Monetization** | Freemium SaaS (3 tiers + B2B) |

## 2. Problem Statement

| Problem | Data | Impact |
|---------|------|--------|
| Tidak ada dana darurat | 70% populasi | Rentan jerat utang |
| Paylater predatory | 41% APR tersembunyi, 50M+ pengguna aktif | Debt spiral |
| Investasi bodong | Rp 100T+ kerugian/tahun (OJK 2024) | Tabungan rakyat hilang |
| Literasi keuangan nol | 64% skor rendah (OJK survey) | Tidak ada tool edukasi yang accessible |

**Competitive gap:** Finansialku (paid), Halofina (basic), tidak ada yang combine AI analysis + scam detection + coaching dalam satu platform.

## 3. Solution Architecture

### 3.1 Three-Pillar System

```
┌──────────────────────────────────────────────────────┐
│                    SAFEWALLET                        │
├──────────────┬──────────────┬────────────────────────┤
│  📊 Health   │  🛡️ Scam     │  🤖 AI Coach           │
│  Scanner     │  Detector    │  (WhatsApp)            │
├──────────────┼──────────────┼────────────────────────┤
│ Bank stmt →  │ Promo URL → │ Daily nudge →          │
│ OCR →        │ OJK check → │ Budget alert →         │
│ AI category →│ AI analysis→│ Personalized tip →     │
│ Score 0-100  │ Risk 0-100% │ Challenge invite       │
└──────┬───────┴──────┬──────┴──────────┬──────────────┘
       │              │                 │
       └──────────────┼─────────────────┘
                      ▼
              ┌───────────────┐
              │  Supabase DB  │
              │  + Auth + RLS │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  Claude 3.5   │
              │  (OpenRouter) │
              └───────────────┘
```

### 3.2 Feature Detail

#### Pillar 1: Health Scanner

| Aspect | Specification |
|--------|---------------|
| **Input** | Bank statement screenshot (BCA, BRI, Mandiri, BNI, CIMB, dana, OVO, GoPay) |
| **OCR Engine** | Tesseract.js + custom preprocessing (deskew, contrast, noise reduction) |
| **AI Analysis** | Claude 3.5 Sonnet via OpenRouter — structured JSON output |
| **Output** | Health score (0-100), debt-to-income ratio, savings rate, top 5 spending categories, 3 actionable recommendations |
| **Accuracy** | Target: 75%+ OCR → 90%+ with user correction flow |
| **Latency** | Target: <8s end-to-end (OCR 3s + AI 5s) |
| **Edge Cases** | Blur detection → re-upload prompt; unsupported bank → manual input fallback; multi-page → sequential upload |

**Prompt Strategy:**
```
Role: Financial analyst Indonesia
Input: OCR text dari bank statement
Task: Kategorisasi transaksi, hitung health score
Output format: JSON { score, categories[], recommendations[], warnings[] }
Constraint: Bahasa Indonesia, no hallucination, flag uncertain items
```

#### Pillar 2: Scam Detector

| Aspect | Specification |
|--------|---------------|
| **Input** | Screenshot/URL/text of investment promo |
| **Detection Pipeline** | Step 1: Extract claims (return %, timeline) → Step 2: OJK license check (API/scraping) → Step 3: Pattern matching (Ponzi, MLM, unrealistic returns) → Step 4: AI risk assessment |
| **Red Flag Patterns** | Return >2%/month, "guaranteed", no risk disclosure, unlicensed entity, urgency pressure, referral-heavy |
| **Output** | Risk score (0-100%), red flags list, similar known scam cases, safe alternative suggestions |
| **Accuracy** | Target: 85%+ detection (v1), improve via user feedback loop |
| **False Positive Strategy** | Confidence threshold: <60% → "review with caution", 60-85% → "likely scam", >85% → "high risk scam" |

#### Pillar 3: AI Coach (WhatsApp)

| Aspect | Specification |
|--------|---------------|
| **Delivery** | WhatsApp Business API (via provider: Wablas/Fonnte as fallback) |
| **Schedule** | Daily 7 AM WIB (configurable per user) |
| **Content Types** | Budget remaining alert, personalized saving tip, weekly challenge, milestone celebration |
| **Gamification** | Badges (10 types), streaks (daily check-in), monthly leaderboard |
| **Engagement Target** | <3% unsubscribe rate/month |
| **Fallback** | If WA API unavailable → in-app push notification → email |
| **Cost Reality** | WA API: ~Rp 300-500/conversation/24h — budget Rp 500k/month for 1K active users |

## 4. User Stories & Acceptance Criteria

### US-1: Financial Health Check
```
GIVEN user uploads bank statement screenshot
WHEN system processes the image
THEN display health score (0-100) + breakdown + recommendations

Acceptance Criteria:
  ✓ OCR extracts 75%+ text accurately
  ✓ AI categorizes into min 5 spending categories  
  ✓ End-to-end response <8 seconds
  ✓ Blur/unreadable detection with re-upload prompt
  ✓ Works for top 5 Indonesian banks
  ✓ User can manually correct OCR errors
```

### US-2: Scam Verification
```
GIVEN user submits investment opportunity (screenshot/URL/text)
WHEN system analyzes the submission
THEN display risk score + red flags + safe alternatives

Acceptance Criteria:
  ✓ OJK license verification in <3 seconds
  ✓ Risk score with confidence level displayed
  ✓ Min 3 red flags identified per scam
  ✓ Show similar known scam cases
  ✓ 85%+ true positive rate
```

### US-3: Daily Financial Coaching
```
GIVEN premium user has linked WhatsApp
WHEN daily schedule triggers (7 AM WIB)
THEN send personalized financial nudge

Acceptance Criteria:
  ✓ Message delivered within 5 min of schedule
  ✓ Content personalized based on latest scan data
  ✓ Opt-out mechanism in every message
  ✓ Fallback to push notification if WA fails
```

### US-4: User Authentication
```
GIVEN new user visits SafeWallet
WHEN they sign up/login
THEN authenticate via email magic link OR Google OAuth

Acceptance Criteria:
  ✓ Magic link expires in 10 minutes
  ✓ Google OAuth with one-click
  ✓ Session persists 30 days (remember me)
  ✓ Rate limit: 5 attempts/15 min
```

## 5. Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 15 (App Router) | SSR + RSC, SEO, PWA-ready |
| **Styling** | Tailwind CSS v4 + Shadcn UI | Rapid UI, accessible components |
| **Backend** | Hono.js on Cloudflare Workers | Edge compute, <50ms cold start, global |
| **Database** | Supabase (PostgreSQL + Auth + RLS + Storage) | Free tier generous, auth built-in |
| **AI** | Claude 3.5 Sonnet via OpenRouter | Best reasoning, structured output |
| **OCR** | Tesseract.js (client-side) | Free, no server cost, privacy-first |
| **Cache** | Upstash Redis | Rate limiting, session, AI response cache |
| **Queue** | BullMQ (Redis-backed) | WhatsApp message scheduling |
| **Messaging** | WhatsApp Business API (or Fonnte) | Market penetration 87% in Indonesia |
| **Hosting** | Vercel (FE) + Cloudflare (API) | Free tiers, auto-scaling |
| **Monitoring** | Sentry (errors) + Plausible (analytics) | Free tiers available |

**Cost Projection:**

| Component | Free Tier Limit | Estimated Usage (Month 3) | Cost |
|-----------|----------------|--------------------------|------|
| Vercel | 100GB bandwidth | ~10GB | Rp 0 |
| Cloudflare Workers | 100K req/day | ~30K req/day | Rp 0 |
| Supabase | 500MB DB, 1GB storage | ~100MB DB | Rp 0 |
| OpenRouter (Claude) | Pay-per-use | ~5K requests | ~Rp 150K |
| Upstash Redis | 10K cmd/day | ~5K cmd/day | Rp 0 |
| WhatsApp API | N/A | 100 premium users | ~Rp 500K |
| **Total** | | | **~Rp 650K/month** |

> ⚠️ **Koreksi dari v1:** Bukan "Rp 0/month" — WhatsApp API dan AI API memiliki biaya. Budget realistis: Rp 500K-1M/bulan di Month 3.

## 6. Data Model

```sql
-- Core
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  monthly_income INTEGER,
  subscription_tier TEXT DEFAULT 'free', -- free | premium | family
  subscription_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Scanner
scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ocr_raw_text TEXT,
  ocr_corrected_text TEXT, -- user-corrected version
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),
  categories JSONB, -- { "food": 2500000, "transport": 800000, ... }
  recommendations JSONB, -- ["Kurangi pengeluaran makan luar", ...]
  ai_model TEXT DEFAULT 'claude-3.5-sonnet',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scam Detector
scam_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL, -- screenshot | url | text
  input_content TEXT NOT NULL,
  ojk_verified BOOLEAN,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  confidence TEXT, -- low | medium | high
  red_flags JSONB, -- ["Return >10%/bulan", "Tidak terdaftar OJK", ...]
  safe_alternatives JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification
badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- first_scan | streak_7 | scam_hunter | ...
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Subscriptions & Billing
subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- premium | family
  status TEXT DEFAULT 'active', -- active | cancelled | expired
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT, -- midtrans | manual
  amount INTEGER NOT NULL
);

-- Notifications/Coaching Log
coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- whatsapp | push | email
  message_type TEXT NOT NULL, -- budget_alert | tip | challenge | milestone
  content TEXT NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Tracking (rate limiting)
usage_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- scan | scam_check
  period TEXT NOT NULL, -- 2026-03
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, feature, period)
);

-- RLS Policies (Supabase)
-- Every table: user can only read/write own data
-- Admin role can read all for analytics
```

## 7. API Design

### Public Endpoints (require auth)

| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| `POST` | `/api/scan` | Upload bank stmt, return AI analysis | Free: 3/mo, Premium: ∞ |
| `POST` | `/api/scam-check` | Verify investment opportunity | Free: 5/mo, Premium: ∞ |
| `GET` | `/api/user/dashboard` | Aggregated insights + badges + history | 60/min |
| `GET` | `/api/user/scans` | Scan history | 60/min |
| `GET` | `/api/user/scam-checks` | Scam check history | 60/min |
| `PATCH` | `/api/user/profile` | Update profile/income | 10/min |
| `POST` | `/api/user/subscribe` | Initiate subscription | 5/min |

### Internal/Webhook Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/webhooks/whatsapp` | Incoming WA messages |
| `POST` | `/api/webhooks/midtrans` | Payment callbacks |
| `POST` | `/api/cron/coaching` | Trigger daily coaching (Cloudflare Cron) |

### Auth Endpoints (Supabase handles)

| Flow | Method |
|------|--------|
| Magic link login | `supabase.auth.signInWithOtp({ email })` |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Logout | `supabase.auth.signOut()` |
| Session check | `supabase.auth.getSession()` |

## 8. Security & Privacy

| Concern | Implementation |
|---------|----------------|
| **Authentication** | Supabase Auth (magic link + Google OAuth), JWT tokens |
| **Authorization** | Row Level Security (RLS) — users access own data only |
| **Data Encryption** | TLS 1.3 in transit; Supabase encrypts at rest (AES-256) |
| **Bank Statement Privacy** | OCR processed client-side (Tesseract.js), raw image not stored on server — only extracted text |
| **PII Handling** | Encrypt phone numbers, hash email for analytics, no plain-text PII in logs |
| **UU PDP Compliance** | Consent on signup, data deletion API, clear privacy policy, data retention: 2 years then auto-delete |
| **Rate Limiting** | Upstash Redis — per-user, per-endpoint |
| **Input Validation** | Zod schema validation on all endpoints |
| **Image Upload** | Max 5MB, MIME type validation (image/jpeg, image/png only), content scanning |
| **API Keys** | Stored in environment variables (Cloudflare Secrets), never in code |
| **Monitoring** | Sentry error tracking, anomaly detection on auth failures |

## 9. Business Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | Rp 0 | 3 health scans/mo, 5 scam checks/mo, basic dashboard |
| **Premium** | Rp 29,000/mo | Unlimited scans & checks, WhatsApp coach, gamification, priority AI |
| **Family** | Rp 79,000/mo | 5 members, shared goals, family dashboard, parental controls |
| **B2B** | Rp 15,000/employee/mo | Corporate wellness, admin dashboard, bulk reports |

**Payment:** Midtrans (GoPay, OVO, bank transfer, QRIS)

**Paywall Strategy:** Free tier deliberately limited → clear "upgrade to continue" prompt setelah limit tercapai, tidak hard-block.

## 10. Success Metrics

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Total users | 1,000 | 5,000 | 20,000 |
| Premium conversions | 100 (10%) | 800 (16%) | 4,000 (20%) |
| MRR | Rp 2.9M | Rp 23.2M | Rp 116M |
| Scams prevented | 50+ | 300+ | 1,500+ |
| Money saved (collective) | Rp 500M | Rp 3B | Rp 15B |
| NPS Score | >40 | >50 | >60 |
| OCR accuracy | 75% | 85% | 90% |
| Scam detection accuracy | 85% | 90% | 95% |

## 11. Launch Strategy

| Phase | Timeline | Activity | Target |
|-------|----------|----------|--------|
| **Build** | Week 1-4 | MVP development (Health Scanner + Scam Detector) | Feature complete |
| **Alpha** | Week 5 | Internal testing, bug fixing | 0 critical bugs |
| **Beta** | Week 6-7 | Closed beta (50 users from UMKM communities) | NPS >30 |
| **Soft Launch** | Week 7 | Facebook UMKM groups, WhatsApp broadcast | 500 signups |
| **Public Launch** | Week 8 | TikTok campaign, press release, influencer affiliate (20%) | 1,000 signups |

**Priority Channels:**
1. Facebook Groups (UMKM komunitas) — organic, high trust
2. TikTok (financial tips short-form) — viral potential
3. WhatsApp sharing (built-in referral) — network effect
4. Micro-influencers (Rp 500K-2M per post) — affordable

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low conversion rate | Medium | High | Aggressive paywall, value-first onboarding, social proof |
| AI cost spike | Medium | Medium | Cache common patterns (60% hit rate), rate limit free tier, model fallback (Haiku for simple queries) |
| WhatsApp API rate limit | Low | Medium | BullMQ queue with backoff, fallback to push/email |
| OCR accuracy low | High | Medium | User correction flow, manual input fallback, progressive improvement |
| OJK API unavailable | Medium | Low | Cached OJK registry (daily sync), manual fallback list |
| Competition copies features | Low | Medium | First-mover, community moat, Indonesia-specific AI training |
| Data breach | Low | Critical | RLS, encryption, minimal data collection, security audit pre-launch |
| Regulatory changes | Low | High | Legal review quarterly, compliance-first architecture |

## 13. Development Sprints

| Sprint | Week | Deliverables |
|--------|------|--------------|
| **Sprint 1** | 1-2 | Project setup, auth (Supabase), UI shell (Next.js + Shadcn), database schema, landing page |
| **Sprint 2** | 3-4 | Health Scanner (OCR + AI), Scam Detector (OJK + AI), dashboard, rate limiting |
| **Sprint 3** | 5-6 | WhatsApp integration, gamification, subscription/payment (Midtrans), beta testing |
| **Sprint 4** | 7-8 | Bug fixes, performance optimization, monitoring setup, launch prep, public launch |

## 14. Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| **Unit** | Vitest | AI prompt parsing, OCR text extraction, scoring algorithms |
| **Integration** | Vitest + Supabase local | API endpoints, auth flow, RLS policies |
| **E2E** | Playwright | Critical flows: signup → scan → result → upgrade |
| **AI Eval** | Custom test suite | 50 sample bank statements, 30 known scams, accuracy benchmarking |
| **Load** | k6 | API endpoints: target 100 RPS, <200ms p95 |
| **Security** | OWASP ZAP | Pre-launch vulnerability scan |

## 15. Out of Scope (v1)

- ❌ Investment portfolio tracking
- ❌ Automated savings transfers (bank API required)
- ❌ Loan marketplace
- ❌ Crypto/NFT scam detection (add v2)
- ❌ Multi-country support (add v2)
- ❌ Native mobile app (PWA first, native v2)

## 16. Future Roadmap (v2+)

| Version | Features |
|---------|----------|
| **v2 (Month 6)** | Crypto scam detection, native Android app, bank API integration (open banking) |
| **v3 (Month 12)** | Multi-country (MY, PH, VN), automated savings, investment recommendations (licensed) |

---

*PRD v2.0 — Structured Density Format*
*Designed for both human developers and AI coding assistants*
*Token-efficient (~4,500 tokens) with zero information trade-off*
