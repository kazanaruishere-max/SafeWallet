# 📖 INSTRUCTIONS.md — SafeWallet Developer Guide

> **Baca file ini pertama kali** sebelum memulai development.
> Berlaku untuk human developer maupun AI coding assistant.

---

## 1. Project Philosophy

### Core Principles

| # | Principle | Artinya |
|---|-----------|---------|
| 1 | **Edge-first** | Semua API di Cloudflare Workers (<50ms global) |
| 2 | **Async-heavy** | OCR & AI diproses via job queue, jangan block request |
| 3 | **Cache-aggressive** | Redis cache 60%+ hit rate, hemat biaya AI |
| 4 | **Mobile-first** | 90% user di mobile — desain PWA responsive |
| 5 | **Privacy-first** | OCR client-side, minimal data collection |
| 6 | **Token-efficient docs** | Setiap file dokumentasi padat informasi, zero filler |

### Mantra Development
```
"Build for 270 million. Start with 50 beta users."
"If it can run on free tier, it should."
"Every rupiah saved from scams is a win."
```

---

## 2. Documentation Navigation

### Urutan Baca (Chronological)

```
1. INSTRUCTIONS.md        ← ANDA DI SINI — filosofi & setup
2. MASTER_PLAN.md         ← Timeline & progress — tahu kita di mana
3. SafeWallet-PRD-v2.md   ← APA yang dibangun — requirements
4. CONVENTIONS.md         ← BAGAIMANA menulis code — style guide
5. API_SPECIFICATION.md   ← API contract — endpoint & schema
6. SECURITY_GUIDELINES.md ← Security rules — wajib sebelum coding
7. SafeWallet-DesignDoc.md ← Architecture & code patterns
8. SafeWallet-TechStack.md ← Setup commands & infra detail
9. TESTING_STRATEGY.md    ← Testing plan — jalankan sebelum PR
10. ADR/                   ← Keputusan arsitektur — baca jika butuh context
```

### Kapan Baca Apa?

| Situasi | Baca |
|---------|------|
| Baru join / baru mulai | `INSTRUCTIONS.md` → `MASTER_PLAN.md` |
| Mau bikin feature baru | `PRD-v2` → `API_SPECIFICATION` → `CONVENTIONS` |
| Mau handle user data | `SECURITY_GUIDELINES` (wajib!) |
| Bingung kenapa pakai tech X | `ADR/` folder |
| Mau deploy / PR | `TESTING_STRATEGY` → `MASTER_PLAN` (update progress) |
| AI assistant context | Load: `INSTRUCTIONS` + `PRD-v2` + `CONVENTIONS` |

---

## 3. Quick Start

### Prerequisites
```
Node.js >= 20.x
pnpm >= 9.x (preferred) atau npm >= 10.x
Git
Akun: Supabase, Cloudflare, OpenRouter, Vercel
```

### Setup (5 menit)
```bash
# 1. Clone & install
git clone <repo-url> safewallet
cd safewallet
pnpm install

# 2. Environment setup
cp .env.example .env.local
# Isi credentials: SUPABASE_URL, SUPABASE_ANON_KEY, OPENROUTER_API_KEY, dll
# Lihat SafeWallet-TechStack.md § Environment Variables untuk daftar lengkap

# 3. Database setup
# Jalankan SQL migration di Supabase Dashboard
# Lihat SafeWallet-PRD-v2.md § Data Model untuk schema

# 4. Run development server
pnpm dev
# Buka http://localhost:3000

# 5. Run tests
pnpm test        # Unit tests (Vitest)
pnpm test:e2e    # E2E tests (Playwright)
```

---

## 4. Development Workflow

### Branch Strategy
```
main ─────────────────────────────── production
  │
  ├── dev ────────────────────────── staging (auto-deploy preview)
  │     │
  │     ├── feat/health-scanner ──── feature branch
  │     ├── feat/scam-detector
  │     ├── fix/ocr-accuracy
  │     └── chore/update-deps
  │
  └── hotfix/critical-bug ────────── emergency fix → main
```

### Workflow per Task
```
1. Ambil task dari MASTER_PLAN.md (update status ke ☐ → 🔄)
2. Buat branch: git checkout -b feat/<task-name>
3. Code mengikuti CONVENTIONS.md
4. Validasi keamanan: cek SECURITY_GUIDELINES.md
5. Test: pnpm test && pnpm test:e2e
6. Commit: ikuti format di CONVENTIONS.md § Git Commits
7. PR → review → merge ke dev
8. Update MASTER_PLAN.md (status task → ✅)
```

---

## 5. Folder Structure

```
safewallet/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Route group: login, signup
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/          # Route group: authenticated pages
│   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   ├── page.tsx          # Dashboard home
│   │   ├── scan/page.tsx     # Health Scanner
│   │   ├── scam/page.tsx     # Scam Detector
│   │   └── profile/page.tsx  # User profile
│   ├── api/                  # API routes (Next.js)
│   │   ├── scan/route.ts
│   │   ├── scam-check/route.ts
│   │   └── webhooks/
│   │       ├── whatsapp/route.ts
│   │       └── midtrans/route.ts
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
│
├── components/
│   ├── ui/                   # Shadcn UI (auto-generated)
│   ├── features/             # Feature-specific components
│   │   ├── health-scanner/
│   │   ├── scam-detector/
│   │   └── dashboard/
│   └── shared/               # Shared components (header, footer, etc)
│
├── lib/                      # Core business logic
│   ├── ai.ts                 # Claude AI client
│   ├── ocr.ts                # Tesseract OCR
│   ├── scam.ts               # Scam detection logic
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── middleware.ts     # Auth middleware
│   ├── redis.ts              # Upstash Redis client
│   ├── whatsapp.ts           # WhatsApp API client
│   └── utils.ts              # Shared utilities
│
├── hooks/                    # Custom React hooks
│   ├── use-auth.ts
│   ├── use-scan.ts
│   └── use-subscription.ts
│
├── stores/                   # Zustand stores
│   ├── auth-store.ts
│   └── ui-store.ts
│
├── types/                    # TypeScript types
│   ├── database.ts           # Supabase generated types
│   ├── api.ts                # API request/response types
│   └── index.ts              # Shared types
│
├── workers/                  # Background job processors
│   └── whatsapp-worker.ts    # BullMQ worker
│
├── __tests__/                # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   └── icons/
│
├── docs/                     # All documentation → symlink or copy
└── ADR/                      # Architectural Decision Records
```

---

## 6. AI Assistant Instructions

### Untuk Claude / AI Coding Assistant

Saat bekerja dengan codebase SafeWallet, ikuti panduan ini:

**Context loading priority:**
```
1. INSTRUCTIONS.md (ini) → pahami filosofi & workflow
2. CONVENTIONS.md → ikuti style guide saat menulis code
3. SafeWallet-PRD-v2.md → pahami requirements & data model
4. API_SPECIFICATION.md → ikuti API contract
5. SECURITY_GUIDELINES.md → jangan langgar security rules
```

**Rules untuk AI:**
1. **SELALU** gunakan TypeScript strict mode
2. **SELALU** validasi input dengan Zod sebelum proses
3. **JANGAN** hardcode secrets — gunakan environment variables
4. **JANGAN** skip error handling — setiap async call perlu try/catch
5. **SELALU** check rate limit sebelum call AI API
6. **SELALU** ikuti naming convention di `CONVENTIONS.md`
7. **JANGAN** store raw bank statement images di server — OCR client-side
8. **SELALU** gunakan Supabase RLS — jangan bypass via service key tanpa alasan

**Response format preference:**
- Code blocks dengan filepath comment di baris pertama
- Bahasa Indonesia untuk comments, English untuk code
- Jelaskan "kenapa" bukan hanya "apa" saat ada keputusan arsitektur

---

## 7. Environment Variables Checklist

```bash
# ✅ Wajib untuk development
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase public key
SUPABASE_SERVICE_ROLE_KEY=      # Server-side only (NEVER expose)
OPENROUTER_API_KEY=             # AI API key

# ✅ Wajib untuk fitur lengkap
UPSTASH_REDIS_REST_URL=         # Redis cache
UPSTASH_REDIS_REST_TOKEN=       # Redis auth
WHATSAPP_PHONE_ID=              # WA Business API
WHATSAPP_TOKEN=                 # WA auth token

# ⚡ Optional (production)
NEXT_PUBLIC_SENTRY_DSN=         # Error tracking
SENTRY_AUTH_TOKEN=              # Sentry CI
MIDTRANS_SERVER_KEY=            # Payment gateway
MIDTRANS_CLIENT_KEY=            # Payment gateway (client)
NEXT_PUBLIC_APP_URL=            # Production URL

# 🧪 Testing
TESTSPRITE_API_KEY=             # TestSprite MCP (lihat mcp.json)
```

---

*Terakhir diperbarui: 2026-03-12*
*Sesuaikan file ini saat ada perubahan workflow atau tool baru.*
