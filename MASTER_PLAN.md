# 🧭 MASTER_PLAN.md — SafeWallet GPS & Checkpoint

> **Single source of truth** untuk progress, timeline, dan keputusan proyek.
> Update file ini setiap kali sprint bergerak maju.

---

## Project Identity

| Key | Value |
|-----|-------|
| **Nama** | SafeWallet |
| **Tagline** | AI-powered financial wellness for Indonesia |
| **Version** | v2.0 (MVP) |
| **Start Date** | TBD |
| **Target Launch** | 8 minggu dari start |
| **Team** | Solo developer + AI coding assistant |

## 📚 Documentation Map

```
📂 SafeWallet/
├── 🧭 MASTER_PLAN.md          ← ANDA DI SINI (GPS & Checkpoint)
├── 📖 INSTRUCTIONS.md          ← Baca pertama (onboarding)
├── 📋 SafeWallet-PRD-v2.md     ← Product requirements
├── 🏗️ SafeWallet-DesignDoc.md  ← Architecture & code patterns
├── ⚙️ SafeWallet-TechStack.md  ← Tech stack & setup
├── 🔌 API_SPECIFICATION.md     ← API contract (endpoints, schemas)
├── 🔐 SECURITY_GUIDELINES.md   ← Security & UU PDP compliance
├── 📏 CONVENTIONS.md           ← Code style & patterns
├── 🧪 TESTING_STRATEGY.md      ← Testing plan + TestSprite MCP
├── 📁 ADR/                     ← Architectural Decision Records
│   ├── README.md               ← Index semua keputusan
│   ├── 001-next-js.md
│   ├── 002-hono-js.md
│   ├── 003-supabase.md
│   ├── 004-openrouter.md
│   ├── 005-client-side-ocr.md
│   └── 006-whatsapp-api.md
└── 🔧 mcp.json                 ← MCP server config (TestSprite)
```

**Cara pakai:** Baca `INSTRUCTIONS.md` → Review `MASTER_PLAN.md` → Ikuti sprint checklist

---

## 🗓️ Sprint Timeline

### Sprint 1: Foundation (Week 1-2)

| # | Task | Priority | Status | Depends On |
|---|------|----------|--------|------------|
| 1.1 | Project setup (Next.js 15 + Tailwind v4) | 🔴 Critical | ☐ | — |
| 1.2 | Supabase setup (DB + Auth + RLS) | 🔴 Critical | ☐ | — |
| 1.3 | Database schema migration (7 tables) | 🔴 Critical | ☐ | 1.2 |
| 1.4 | Auth flow (magic link + Google OAuth) | 🔴 Critical | ☐ | 1.2 |
| 1.5 | Shadcn UI shell (layout, nav, pages) | 🟡 High | ☐ | 1.1 |
| 1.6 | Landing page (hero, features, pricing) | 🟡 High | ☐ | 1.5 |
| 1.7 | Environment & secrets setup | 🔴 Critical | ☐ | 1.1 |
| 1.8 | CI/CD pipeline (GitHub Actions) | 🟢 Medium | ☐ | 1.1 |

**Sprint 1 Gate:** ✅ User dapat signup → login → lihat dashboard kosong

### Sprint 2: Core Features (Week 3-4)

| # | Task | Priority | Status | Depends On |
|---|------|----------|--------|------------|
| 2.1 | OCR engine (Tesseract.js + preprocessing) | 🔴 Critical | ☐ | 1.1 |
| 2.2 | AI Analyzer (Claude prompt + JSON output) | 🔴 Critical | ☐ | 1.7 |
| 2.3 | Health Scanner flow (upload → OCR → AI → score) | 🔴 Critical | ☐ | 2.1, 2.2 |
| 2.4 | Scam Detector (OJK check + pattern matching + AI) | 🔴 Critical | ☐ | 2.2 |
| 2.5 | Dashboard UI (score display, history, charts) | 🟡 High | ☐ | 2.3 |
| 2.6 | Rate limiting (free tier quotas) | 🟡 High | ☐ | 2.3, 2.4 |
| 2.7 | Redis caching (AI response cache) | 🟡 High | ☐ | 2.2 |
| 2.8 | Error handling & Sentry integration | 🟢 Medium | ☐ | 2.3 |

**Sprint 2 Gate:** ✅ User dapat upload bank statement → lihat health score → cek scam

### Sprint 3: Engagement & Monetization (Week 5-6)

| # | Task | Priority | Status | Depends On |
|---|------|----------|--------|------------|
| 3.1 | WhatsApp Business API integration | 🟡 High | ☐ | 1.7 |
| 3.2 | Daily coaching message system (BullMQ) | 🟡 High | ☐ | 3.1 |
| 3.3 | Gamification (badges, streaks) | 🟢 Medium | ☐ | 2.5 |
| 3.4 | Subscription system (Midtrans payment) | 🔴 Critical | ☐ | 1.3 |
| 3.5 | Paywall enforcement (free tier limits) | 🔴 Critical | ☐ | 3.4, 2.6 |
| 3.6 | Beta testing (50 users) | 🔴 Critical | ☐ | 2.3, 2.4 |
| 3.7 | PWA manifest & service worker | 🟢 Medium | ☐ | 1.5 |

**Sprint 3 Gate:** ✅ Beta users membayar premium → menerima WA coaching → gamification jalan

### Sprint 4: Launch (Week 7-8)

| # | Task | Priority | Status | Depends On |
|---|------|----------|--------|------------|
| 4.1 | Performance optimization (Lighthouse >90) | 🟡 High | ☐ | All |
| 4.2 | Security audit (OWASP checklist) | 🔴 Critical | ☐ | All |
| 4.3 | SEO optimization | 🟢 Medium | ☐ | 1.6 |
| 4.4 | Analytics setup (Plausible) | 🟢 Medium | ☐ | 1.1 |
| 4.5 | Soft launch (Facebook UMKM groups) | 🔴 Critical | ☐ | 4.2 |
| 4.6 | Public launch (TikTok + press + influencers) | 🔴 Critical | ☐ | 4.5 |
| 4.7 | Monitoring & alerting live | 🟡 High | ☐ | 4.5 |

**Sprint 4 Gate:** ✅ 1,000 users → 100 premium → monitoring aktif → 0 critical bugs

---

## 🔗 Dependency Map

```
Auth (1.4) ──────────────────────────────────────┐
  │                                               │
  ▼                                               ▼
Dashboard (2.5) ◄── Health Scanner (2.3)    Subscription (3.4)
                        │     │                   │
                    OCR (2.1) AI (2.2)       Paywall (3.5)
                              │
                        Scam Detector (2.4)
                              │
                    Redis Cache (2.7)
                              │
                    WhatsApp Bot (3.1) → Coaching (3.2)
                                              │
                                      Gamification (3.3)
```

---

## 🚦 Risk Radar (Current Status)

| Risk | Status | Trend | Action Required |
|------|--------|-------|-----------------|
| OCR accuracy < target | 🟡 Watch | → | Prep manual input fallback |
| AI cost overrun | 🟢 OK | → | Cache strategy designed |
| WhatsApp API approval delay | 🟡 Watch | → | Apply early, prep email fallback |
| Low beta conversion | 🔵 Unknown | → | Strong onboarding + paywall |
| Data breach | 🟢 OK | → | RLS + encryption planned |
| Regulatory (OJK/UU PDP) | 🟡 Watch | → | Legal review before launch |

---

## 📊 KPI Dashboard (Live Tracking)

| Metric | Target M3 | Actual M3 | Target M6 | Actual M6 |
|--------|-----------|-----------|-----------|-----------|
| Total Users | 1,000 | — | 5,000 | — |
| Premium CVR | 10% | — | 16% | — |
| MRR | Rp 2.9M | — | Rp 23.2M | — |
| Scams Prevented | 50+ | — | 300+ | — |
| NPS Score | >40 | — | >50 | — |
| OCR Accuracy | 75% | — | 85% | — |
| Uptime | 99.5% | — | 99.9% | — |

---

## Changelog

| Date | Change | Sprint |
|------|--------|--------|
| 2026-03-12 | Initial master plan created | Pre-Sprint |

---

*Update file ini setiap akhir sprint atau saat milestone tercapai.*
