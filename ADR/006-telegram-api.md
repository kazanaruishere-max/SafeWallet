# ADR-006: WhatsApp Business API over Telegram/SMS

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
AI Coach perlu delivery channel untuk daily financial nudges ke user Indonesia. Pemilihan messaging platform sangat kritis karena menentukan engagement dan reach.

## Options Considered

| Criteria | WhatsApp Business | Telegram Bot | SMS | Push Notification |
|----------|------------------|-------------|-----|-------------------|
| Indonesia penetration | ✅ 87% (112M users) | ❌ 5-8% | ✅ 100% | ⚠️ App install needed |
| Cost/message | ⚠️ Rp 300-500/conversation | ✅ Free | ❌ Rp 350/SMS | ✅ Free |
| Rich content | ✅ Buttons, images, lists | ✅ Rich media | ❌ Text only (160 chars) | ⚠️ Limited |
| Setup complexity | ⚠️ Meta Business approval (2-4 week) | ✅ Instant | ✅ Instant | ✅ Instant |
| Open rate | ✅ 98% | 🟡 70-80% | ✅ 98% | 🟡 50-60% |
| Two-way chat | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No |
| Bot API quality | ✅ Good (Cloud API) | ✅ Excellent | N/A | ✅ Web Push API |

## Decision
**WhatsApp Business API** sebagai primary channel, **push notification** sebagai fallback.
- 87% orang Indonesia pakai WhatsApp — reach terluas
- 98% open rate — engagement hampir pasti
- Supports rich content (buttons, quick replies) untuk interactive coaching

## Consequences
**Positive:** Maximum reach (87% ID), highest open rate (98%), rich content, two-way interaction.
**Negative:** Setup complex (Meta Business approval 2-4 minggu), biaya per conversation (~Rp 300-500), rate limits ketat untuk akun baru.
**Risks:** Meta bisa ubah pricing/policy kapan saja — mitigasi: push notification fallback, email sebagai backup. Apply Meta Business verification secepatnya (Sprint 1).

## Implementation Note
Untuk MVP, gunakan provider lokal (Fonnte/Wablas) yang lebih mudah setup. Migrasi ke official Cloud API saat scale.
