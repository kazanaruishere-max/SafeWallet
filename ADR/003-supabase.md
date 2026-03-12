# ADR-003: Supabase over Firebase/PlanetScale

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
Butuh database + auth + storage + realtime dalam satu platform. Budget: Rp 0 (free tier). Data model relasional (users → scans → badges — many foreign keys).

## Options Considered

| Criteria | Supabase | Firebase | PlanetScale |
|----------|----------|----------|-------------|
| Database | ✅ PostgreSQL (relational) | ❌ Firestore (NoSQL) | ✅ MySQL (relational) |
| Auth built-in | ✅ Magic link + OAuth | ✅ Firebase Auth | ❌ No auth |
| RLS (row-level security) | ✅ Native PostgreSQL | ⚠️ Firestore rules | ❌ Not available |
| Storage | ✅ S3-compatible | ✅ Cloud Storage | ❌ No storage |
| Realtime | ✅ WebSocket | ✅ Real-time listeners | ❌ No realtime |
| Free tier DB size | ✅ 500MB | ✅ 1GB | ✅ 5GB |
| Free tier bandwidth | ✅ 2GB/month | ⚠️ Generous but complex pricing | ✅ 1B row reads |
| SQL support | ✅ Full SQL | ❌ Query API only | ✅ Full SQL |
| Open source | ✅ Yes | ❌ No | ❌ No (was, now closed) |

## Decision
**Supabase** — PostgreSQL relational model sesuai kebutuhan, auth + RLS + storage + realtime all-in-one, dan open source.

## Consequences
**Positive:** Single platform for DB + Auth + Storage + Realtime, PostgreSQL is battle-tested, RLS untuk data isolation tanpa code changes, open source (bisa self-host jika perlu).
**Negative:** Free tier 500MB lebih kecil dari Firebase, cold start pada free tier (~2-3s setelah inactivity).
**Risks:** Supabase free project auto-pause setelah 7 hari inactivity — perlu health check cron atau upgrade sebelum production.
