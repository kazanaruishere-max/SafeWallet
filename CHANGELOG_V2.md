# SafeWallet v2: Production Stability Update (Changelog)

## 🛡️ Security & Privacy (P0)
- **Zero-Trust Server OCR**: Moved OCR and file parsing from the client to the server. `ocr_text` is no longer accepted via API to prevent trust boundary violations.
- **Advanced PII Redaction**: Enhanced regex-based sanitization for Indonesian identifiers (NIK, Rekening, Alamat) before sending data to AI.
- **Atomic Quota System**: Replaced sequential quota checks with a PostgreSQL Atomic RPC (`increment_quota_atomic`) to prevent race conditions.
- **AES-256-GCM Encryption**: All sensitive financial data is now encrypted before storage in Supabase.

## 🚀 Performance & Scalability (P1)
- **Parallel API Execution**: Optimized Dashboard API to use `Promise.all` for all database queries.
- **Dynamic Component Loading**: Implemented `next/dynamic` for heavy 3D and WebGL components to improve mobile LCP.
- **Structured Audit Logging**: New UUID-based request tracing and structured JSON logs for better production observability.

## 📱 User Experience (UX)
- **Unified Loading States**: Added `loading.tsx` for the dashboard to eliminate layout shifts during data fetching.
- **V2 Security Indicators**: Added "Proof-of-Health" and "Integrity Verified" badges in the Scan result and History pages.
- **Improved Mobile UI**: Refined touch targets and optimized scroll performance using `Lenis`.

---
*SafeWallet v2: Code is a shield. Technology is a tool for justice.*
