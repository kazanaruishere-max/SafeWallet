# ADR-002: Hono.js on Cloudflare Workers over Express/Fastify

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
API layer perlu low-latency global (user di seluruh Indonesia dari Aceh ke Papua), ringan, dan free to run. Traditional Node.js servers (Express) butuh VPS yang mahal.

## Options Considered

| Criteria | Hono.js + CF Workers | Express + VPS | Fastify + VPS |
|----------|---------------------|---------------|---------------|
| Latency global | ✅ <50ms (edge) | ❌ 200-500ms (single region) | ❌ 200-500ms |
| Free tier | ✅ 100K req/day | ❌ ~$5/mo VPS minimum | ❌ ~$5/mo |
| Cold start | ✅ ~0ms | N/A (always running) | N/A |
| TypeScript | ✅ Native | ⚠️ Setup needed | ✅ Native |
| Bundle size | ✅ <1MB | ❌ 50MB+ node_modules | ❌ 30MB+ |
| Web Standard API | ✅ Fetch API native | ❌ req/res (Node) | ❌ req/res |

## Decision
**Hono.js on Cloudflare Workers** — edge computing gratis, global low latency, Web Standard API compatible.

## Consequences
**Positive:** Zero server cost, global <50ms, tiny bundle, TypeScript-first.
**Negative:** No long-running processes (Workers max 30s CPU), limited Node.js API compatibility.
**Risks:** BullMQ (job queue) butuh separate Node.js runtime — mungkin perlu Vercel serverless function atau Railway untuk worker pengelola queue.
