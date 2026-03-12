# SafeWallet PRD v1.0

## Overview
**Product:** AI-powered financial wellness platform for emerging markets  
**Mission:** Prevent debt traps & investment scams through AI analysis  
**Target:** Indonesia market (270M people, 70% no emergency fund)  
**Timeline:** 8-week MVP → Launch Month 3

## Problem
- 70% lack emergency savings
- Paylater debt epidemic (41% APR hidden fees)
- Investment scams: Rp 100B+ lost annually
- Zero financial literacy infrastructure

## Solution
Three-pillar AI platform:

### 1. Health Scanner
**Input:** Bank statement screenshot  
**Process:** OCR → AI categorization → Health score (0-100)  
**Output:** Debt ratio, savings rate, spending insights  
**Tech:** Tesseract.js + Claude 3.5 Sonnet

### 2. Scam Detector
**Input:** Investment promo (screenshot/URL)  
**Process:** Pattern matching + OJK registry + AI analysis  
**Output:** Risk score (0-100%), red flags, safe alternatives  
**Detection:** Unrealistic returns, unlicensed, Ponzi patterns

### 3. AI Coach (WhatsApp)
**Delivery:** Daily nudges via WhatsApp Business API  
**Content:** Budget alerts, saving challenges, milestone celebrations  
**Engagement:** Gamification (badges, streaks, leaderboards)

## User Stories

### US-1: Health Check
```
User uploads bank screenshot
→ OCR extracts transactions
→ AI categorizes spending
→ Display health score + recommendations
Acceptance: 80%+ OCR accuracy, <5s analysis
```

### US-2: Scam Detection
```
User submits investment opportunity
→ Check OJK license
→ Analyze promise vs. reality
→ Display risk assessment
Acceptance: 95%+ scam detection accuracy
```

### US-3: Daily Coaching
```
System sends daily WhatsApp at 7 AM
→ Budget remaining
→ Personalized tip
→ Challenge invitation
Acceptance: <1% unsubscribe rate
```

## Tech Stack
**Frontend:** Next.js 15, Tailwind v4, Shadcn UI, PWA  
**Backend:** Hono.js (Cloudflare Workers), Supabase (PostgreSQL)  
**AI:** Claude 3.5 (OpenRouter), Tesseract.js (OCR)  
**Messaging:** WhatsApp Business API  
**Infra:** Vercel (frontend), Cloudflare (API), Upstash (Redis)  
**Cost:** Rp 0/month (free tiers only)

## Data Model
```sql
users: id, email, phone, monthly_income, created_at
scans: id, user_id, image_url, ocr_text, health_score, insights_json
scam_reports: id, user_id, input_text, risk_score, red_flags_json
badges: id, user_id, badge_type, earned_at
```

## API Endpoints
```
POST /api/scan → Upload screenshot, return analysis
POST /api/check-scam → Verify investment, return risk
POST /api/whatsapp/webhook → Handle incoming messages
GET /api/user/insights → Dashboard data
```

## Business Model
**Free:** 3 scans/month, 5 scam checks  
**Premium (Rp 29k/mo):** Unlimited, WhatsApp coach, gamification  
**Family (Rp 79k/mo):** 5 members, shared goals  
**B2B (Rp 15k/employee):** Corporate wellness

## Success Metrics
**Month 3:** 1,000 users, 100 premium (10% CVR), Rp 2.9M MRR  
**Month 6:** 5,000 users, 800 premium (16% CVR), Rp 23.2M MRR  
**Impact:** Prevent 50+ scams, Rp 500M saved collectively

## Launch Strategy
**Week 1-4:** Build MVP  
**Week 5-6:** Beta test (50 users)  
**Week 7:** Soft launch (Facebook groups, 500 signups)  
**Week 8:** Public launch (TikTok, press, 1,000 signups)

**Channels:** Facebook (UMKM groups), TikTok (finance tips), WhatsApp (viral share), Influencers (affiliate 20%)

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Low conversion | Strong paywall (free = very limited), time-saved messaging |
| AI cost spike | Cache common patterns (60% hit rate), rate limit free tier |
| WhatsApp rate limits | BullMQ queue, fallback to email |
| Competition | AI scam detection unique, Indonesia-specific (OJK integration) |

## Out of Scope (v1)
- Investment portfolio tracking
- Automated savings transfers
- Loan marketplace
- Crypto scam detection (add v2)

## Approval
Build: ✅ (Token-optimized for Antigravity IDE)
