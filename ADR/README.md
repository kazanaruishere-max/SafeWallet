# 📁 Architectural Decision Records (ADR)

> Setiap keputusan arsitektur penting didokumentasikan di sini.
> Format: [ADR Template by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

## Index

| # | Decision | Status | Date |
|---|----------|--------|------|
| [001](001-next-js.md) | Next.js 15 over Remix/Vite | ✅ Accepted | 2026-03-12 |
| [002](002-hono-js.md) | Hono.js over Express/Fastify | ✅ Accepted | 2026-03-12 |
| [003](003-supabase.md) | Supabase over Firebase/PlanetScale | ✅ Accepted | 2026-03-12 |
| [004](004-openrouter.md) | OpenRouter over Direct Anthropic API | ✅ Accepted | 2026-03-12 |
| [005](005-client-side-ocr.md) | Client-side OCR over Server-side | ✅ Accepted | 2026-03-12 |
| [006](006-whatsapp-api.md) | WhatsApp over Telegram/SMS | ✅ Accepted | 2026-03-12 |

## How to Add New ADR

1. Buat file `ADR/NNN-<title>.md`
2. Gunakan template di bawah
3. Update index di README.md ini
4. Status: `Proposed` → `Accepted` / `Rejected` / `Superseded`

## Template

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Rejected | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** [names]

## Context
[Masalah apa yang dihadapi?]

## Options Considered
1. **Option A** — description
2. **Option B** — description

## Decision
[Pilihan yang diambil dan alasannya]

## Consequences
**Positive:** [Keuntungan dari keputusan ini]
**Negative:** [Trade-off yang diterima]
**Risks:** [Risiko yang perlu dimonitor]
```
