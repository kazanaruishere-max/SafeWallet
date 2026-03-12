# ADR-005: Client-side OCR over Server-side Processing

**Status:** ✅ Accepted
**Date:** 2026-03-12
**Deciders:** Solo developer

## Context
Health Scanner perlu OCR untuk membaca bank statement. Data bank statement adalah data finansial sensitif (🔴 Critical). Pilihan: OCR di browser (client-side) atau kirim image ke server untuk OCR.

## Options Considered

| Criteria | Client-side (Tesseract.js) | Server-side OCR | Google Cloud Vision |
|----------|---------------------------|-----------------|-------------------|
| Privacy | ✅ Image stays in browser | ❌ Image uploaded to server | ❌ Image sent to Google |
| Cost | ✅ Free (user's CPU) | ⚠️ Server CPU cost | ❌ $1.50/1K images |
| Accuracy | 🟡 75-80% (can improve) | 🟡 75-80% (Tesseract) | ✅ 95%+ |
| Speed | ⚠️ 3-5s (depends on device) | ✅ 1-2s (server GPU) | ✅ <1s |
| Offline | ✅ Works offline | ❌ Needs connection | ❌ Needs connection |
| UU PDP | ✅ No data transfer needed | ⚠️ Need consent for upload | ⚠️ Data leaves Indonesia |

## Decision
**Client-side Tesseract.js** — privacy-first approach. Bank statement image TIDAK PERNAH meninggalkan device user. Hanya teks hasil OCR yang dikirim ke server untuk AI analysis.

## Consequences
**Positive:** Maximum privacy (zero image upload), zero server cost for OCR, works offline, UU PDP compliant by design.
**Negative:** Accuracy lebih rendah (75% vs 95%), speed tergantung device user (slow on old phones), ~2MB WASM download pertama kali.
**Risks:** Low-end Android devices mungkin hang — mitigasi: loading indicator + Web Worker agar tidak block UI, manual input fallback jika OCR gagal.
