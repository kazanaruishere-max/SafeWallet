# 🌐 SafeWallet V3: i18n Internationalization Update Guide

Panduan ini mendokumentasikan langkah-langkah aman, terstruktur, dan teruji untuk mengimplementasikan dukungan multi-bahasa pada SafeWallet V3 tanpa mengorbankan keamanan (*Zero-Trust*), performa (*LCP*), atau stabilitas sistem.

---

## **1. Persiapan & Backup (Pre-Update)**

Sebelum melakukan perubahan apa pun pada basis kode, lakukan langkah mitigasi berikut:

- **Git Branching**: Jangan pernah bekerja langsung di branch `main`. Buat branch fitur khusus:
  ```bash
  git checkout -b feature/i18n-security-first
  ```
- **Dependency Snapshot**: Pastikan file [package-lock.json](file:///c:/Users/Lenovo/PROJECT/SafeWallet/package-lock.json) dalam kondisi bersih. **Dilarang keras** menyertakan `bun.lock` jika menggunakan `npm` untuk mencegah konflik infrastruktur CI/CD.
- **Database Backup**: Lakukan snapshot pada skema [database_v3.sql](file:///c:/Users/Lenovo/PROJECT/SafeWallet/v3/database_v3.sql) jika ada penambahan kolom `preferred_locale` pada tabel `users`.

---

## **2. Analisis Dampak (Impact Analysis)**

Audit area-area kritis berikut sebelum implementasi:

- **Security (PII Redaction)**: Modul [sanitize.ts](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/lib/sanitize.ts) harus diperbarui untuk mengenali pengenal internasional (e.g., "Mr.", "Street", "Ave"). Kegagalan audit ini akan menyebabkan kebocoran data sensitif ke Gemini API.
- **Performance (LCP)**: Hindari penggunaan *Global Client-Side Context* yang berlebihan. Gunakan *Server-Side i18n* (Next.js 15 App Router) untuk menjaga komponen tetap sebagai *Server Components*.
- **SEO & Metadata**: Pastikan tag `lang` di [layout.tsx](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/app/layout.tsx) berubah secara dinamis berdasarkan locale untuk mencegah penalti SEO.

---

## **3. Implementasi Atomik & Reversible**

Gunakan teknik implementasi bertahap untuk meminimalkan risiko:

### **Fase 1: Globalisasi Keamanan (Mandatori)**
Update regex pada [sanitize.ts](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/lib/sanitize.ts) agar mendukung pola alamat dan nama global.

### **Fase 2: Struktur File i18n (Schema-Based)**
- Gunakan format JSON untuk file terjemahan di direktori `messages/`.
- Validasi format file menggunakan skema TypeScript untuk memastikan tidak ada kunci yang hilang (*missing keys*).

### **Fase 3: Middleware & Routing**
- Implementasikan middleware i18n yang efisien.
- Gunakan teknik **Lazy Loading** untuk memuat resource bahasa hanya saat dibutuhkan.

---

## **4. Strategi Testing & Validasi**

Setiap perubahan i18n wajib melewati rangkaian tes berikut:

- **Unit Testing (Security)**: Tambahkan test case di [sanitize.test.ts](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/test/sanitize.test.ts) untuk input bahasa Inggris.
- **Backward Compatibility**: Pastikan sistem tetap berfungsi normal (default ke Bahasa Indonesia) jika file bahasa Inggris tidak ditemukan atau terjadi error pada deteksi locale.
- **Hydration Check**: Verifikasi tidak ada *Hydration Mismatch* pada komponen UI seperti [button.tsx](file:///c:/Users/Lenovo/PROJECT/SafeWallet/src/components/ui/button.tsx).

---

## **5. Prosedur Rollback yang Aman**

Jika ditemukan bug fungsional atau degradasi performa di lingkungan staging:

1. **Git Revert**: Lakukan revert pada commit i18n secara atomik.
2. **Feature Flag**: Gunakan *environment variable* `ENABLE_I18N=false` untuk mematikan fitur secara instan di production tanpa perlu melakukan redeploy penuh.
3. **Cache Clearing**: Bersihkan cache CDN (Vercel/Edge) untuk memastikan user mendapatkan kembali versi bahasa tunggal yang stabil.

---

## **6. Checklist Verifikasi Akhir (Final Verification)**

| Kriteria | Status | Deskripsi |
| :--- | :---: | :--- |
| **Zero-Trust PII** | ⬜ | Sanitizer mampu memfilter "Mr. John Doe" dan "Wall Street". |
| **LCP Performance** | ⬜ | Skor LCP tetap di bawah 1.2 detik (Audit Lighthouse). |
| **Bundle Size** | ⬜ | Ukuran bundle tidak bertambah > 20KB (exclude JSON messages). |
| **No Bun Conflict** | ⬜ | File `bun.lock` tidak ada dalam repositori. |
| **Test Coverage** | ⬜ | Test coverage i18n minimal 85%. |

---
**SafeWallet Principal Engineering — 2026**
