# 🕵️ SafeWallet: Laporan Audit Skalabilitas & Analisis Kerentanan Mendalam

## 1. Pendahuluan
Laporan ini merupakan hasil audit teknis tingkat lanjut untuk SafeWallet v2. Audit dilakukan untuk mengidentifikasi "titik buta" (blind spots) arsitektural yang dapat mengancam integritas sistem saat menghadapi pertumbuhan pengguna (scaling) dan serangan siber yang kompleks.

---

## 2. Analisis Skalabilitas: Titik Kelemahan Arsitektural

### ⚠️ Bottleneck 1: CPU-Bound OCR di Serverless
**Titik Buta**: Penggunaan `Tesseract.js` di dalam Next.js API Route (Serverless).
- **Analisis Kritis**: OCR adalah operasi sinkronus yang sangat menguras CPU. Dalam model Serverless (Vercel/AWS Lambda), resource sangat terbatas.
- **Risiko Skalabilitas**: Jika 50+ pengguna melakukan scan secara bersamaan, sistem akan mengalami *resource exhaustion*, menyebabkan timeout (504 Gateway Timeout) dan kegagalan massal.
- **Rekomendasi**: Offload proses OCR ke dedicated worker (misal: Python FastAPI on GPU) atau gunakan layanan Managed OCR (Google Vision AI/AWS Textract).

### ⚠️ Bottleneck 2: Database Growth & Log Retention
**Titik Buta**: Tabel `audit_logs` dan `usage_counts` tumbuh secara linear terhadap aktivitas user.
- **Analisis Kritis**: Tanpa strategi partisi, query pada tabel ini akan melambat secara eksponensial seiring bertambahnya jutaan baris data.
- **Risiko Skalabilitas**: Penurunan performa dashboard (LCP > 5s) dan kegagalan penulisan audit log.
- **Rekomendasi**: Implementasikan **Table Partitioning** di PostgreSQL berdasarkan bulan/tahun. Gunakan *Cold Storage* (seperti BigQuery/S3) untuk log di atas 90 hari.

### ⚠️ Bottleneck 3: Synchronous Auth Triggers
**Titik Buta**: Trigger `handle_new_user` di Supabase Auth berjalan secara sinkronus.
- **Analisis Kritis**: Jika fungsi ini gagal (misal: DB lock), proses pendaftaran user akan gagal total.
- **Risiko**: Pengalaman onboarding yang buruk saat *peak traffic* pendaftaran.
- **Rekomendasi**: Gunakan model *Event-Driven* (Webhooks) untuk inisialisasi profil user secara asinkronus.

---

## 3. Analisis Keamanan & Potensi Cyberattack

### 🕵️ Blind Spot 1: SSRF (Server-Side Request Forgery) via URL Scan
**Celah**: Fitur Scam Checker yang menerima input URL.
- **Vektor Serangan**: Penyerang dapat memasukkan URL internal (misal: `http://localhost:5432` atau metadata server cloud) untuk memetakan infrastruktur internal.
- **Solusi**: Implementasikan *URL Whitelisting* dan cegah resolusi ke alamat IP privat/lokal.

### 🕵️ Blind Spot 2: Encryption Key Lifecycle
**Celah**: `ENCRYPTION_KEY` bersifat statis di environment variable.
- **Vektor Serangan**: Jika server dikompromi (misal: via dependency vulnerability), seluruh data historis dapat didekripsi seketika.
- **Solusi**: Implementasikan **Key Rotation** menggunakan AWS KMS atau HashiCorp Vault. Gunakan kunci unik per user (Key Derivation Function) untuk isolasi data yang lebih kuat.

### 🕵️ Blind Spot 3: AI Output Manipulation (JSON Injection)
**Celah**: AI terkadang mengembalikan teks tambahan di luar blok JSON.
- **Vektor Serangan**: Penyerang dapat menyisipkan string khusus yang merusak parser `jsonrepair`, menyebabkan API crash.
- **Solusi**: Perketat schema Zod dengan `.strict()` dan implementasikan *Sanity Check* tambahan pada hasil parsing AI sebelum digunakan dalam logika aplikasi.

---

## 4. Bug & Kelemahan Sistem Lainnya

1. **Race Condition pada Quota (Edge Case)**: Meskipun sudah menggunakan RPC, kegagalan jaringan saat commit transaksi dapat menyebabkan *mismatch* antara kuota yang terpakai dan jumlah scan yang tersimpan.
2. **PII Leakage via Error Traces**: Pesan error dari `parseAIResponse` mungkin mencatat data transaksi user yang gagal diproses ke dalam log Sentry.
3. **Missing Rate Limit on Auth**: Endpoint pendaftaran Magic Link memerlukan rate limit di sisi infrastruktur (Cloudflare/WAF) untuk mencegah *Email Bombing*.

---

## 5. Kesimpulan & Skor Kesiapan Produksi

| Kategori | Skor (1-10) | Status |
|---|---|---|
| **Keamanan Data** | 8.5/10 | Baik (E2EE + Blockchain) |
| **Skalabilitas** | 4/10 | **KRITIS** (Masalah OCR & Log) |
| **Resiliensi AI** | 7/10 | Cukup (Fallback tersedia) |
| **Observabilitas** | 7.5/10 | Baik (Audit Log + Tracing) |

**SafeWallet saat ini siap untuk skala menengah (~1.000 user aktif), namun akan menghadapi kegagalan struktural jika dipaksakan ke skala besar (>100.000 user) tanpa migrasi sistem OCR ke asinkronus.**

---
**Audit Oleh:** Tim Senior CyberSecurity & Architect SafeWallet
**Status:** Highly Confidential - v2 Internal Audit
