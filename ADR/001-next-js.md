# ADR-001: Next.js 15 over Remix/Vite

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
Butuh frontend framework yang mendukung SSR, SEO, PWA, dan ekosistem UI component library (Shadcn). Target: 90% user mobile di Indonesia dengan koneksi bervariasi.

## Options Considered

| Criteria | Next.js 15 | Remix | Vite + React |
|----------|-----------|-------|-------------|
| SSR/SSG | ✅ RSC + ISR | ✅ Loader-based | ❌ CSR only (plugin needed) |
| PWA | ✅ next-pwa | ⚠️ Requires manual setup | ⚠️ vite-plugin-pwa |
| Shadcn UI | ✅ First-class | ⚠️ Supported | ⚠️ Supported |
| Vercel Deploy | ✅ Zero-config | ⚠️ Adapter needed | ⚠️ Static adapter |
| Community | ✅ Largest | 🟡 Growing | ✅ Large |
| Learning curve | 🟡 App Router complex | ✅ Simple mental model | ✅ Simple |

## Decision
**Next.js 15** — best trade-off antara fitur, ekosistem, dan deployment simplicity.

## Consequences
**Positive:** RSC reduces client bundle, Vercel zero-config deploy, Shadcn UI native support, strong SEO.
**Negative:** App Router learning curve, vendor lock-in tendency ke Vercel.
**Risks:** Jika Vercel pricing naik, migrasi ke self-hosted butuh effort.
