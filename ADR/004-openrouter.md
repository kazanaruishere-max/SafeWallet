# ADR-004: OpenRouter over Direct Anthropic API

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
Butuh akses ke Claude 3.5 Sonnet untuk AI analysis (health score, scam detection). Pilihan: langsung via Anthropic API atau melalui proxy OpenRouter.

## Options Considered

| Criteria | OpenRouter | Direct Anthropic | OpenAI |
|----------|-----------|-----------------|--------|
| Model access | ✅ Multi-model (Claude, GPT, llama) | ⚠️ Claude only | ⚠️ GPT only |
| Fallback model | ✅ Auto-switch if primary down | ❌ No fallback | ❌ No fallback |
| Free credits | ✅ $5 on signup | ❌ None | ❌ None |
| Pricing | ✅ Same price, sometimes cheaper | ✅ Direct pricing | ⚠️ More expensive |
| Rate limits | ✅ Generous | ⚠️ Stricter for new accounts | ⚠️ Tier-based |
| SDK compatibility | ✅ Anthropic SDK (baseURL swap) | ✅ Native | ❌ Different SDK |

## Decision
**OpenRouter** — multi-model access dengan satu API key, fallback capability jika Claude down, $5 free credits cukup untuk MVP testing. Tetap pakai Anthropic SDK (hanya ganti baseURL).

## Consequences
**Positive:** Model flexibility (bisa switch ke Haiku untuk query sederhana, hemat biaya), $5 free credits, auto-fallback.
**Negative:** Extra dependency (proxy layer), sedikit tambahan latency (~50ms).
**Risks:** Jika OpenRouter down, semua AI features terdampak — mitigasi: implement direct Anthropic fallback.
