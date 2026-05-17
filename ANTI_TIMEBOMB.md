# 💣 Anti-Timebomb & Maintenance Guide
**SafeWallet Project**

Dokumen ini adalah panduan wajib baca bagi semua AI (Gemini, Claude, dll) dan Developer sebelum melakukan *maintenance*, penambahan fitur, atau refactor di SafeWallet. Tujuannya adalah **mencegah bom waktu (Time Bombs)** — yaitu bug tersembunyi, kebocoran memori, atau *breaking changes* yang baru meledak di kemudian hari.

---

## 🛑 Aturan Emas (The Golden Rules)

### 1. JANGAN PERNAH Mengubah "Kontrak" Tanpa Menyelidiki Dampaknya
Jika Anda mengubah struktur *return* dari sebuah *Function*, API Route, atau Skema Database, Anda **WAJIB** melacak (`grep_search`) setiap *file* lain yang memanggil fungsi tersebut.
* **Contoh Bahaya:** Menambahkan atribut baru pada respons `callAI` dari `client.ts` tanpa mengecek bagaimana `scam-check/route.ts` melakukan `parseAIResponse`.
* **Aturan:** *Backward compatibility is king.* Jika ragu, buat rute/fungsi versi baru (misal: `parseFileV2`) daripada merusak yang sudah berjalan.

### 2. Peringatan: React Stale Closures (Bom Waktu UI)
Ini adalah penyebab 90% bug misterius di UI.
* **Aturan:** Setiap kali Anda memodifikasi atau menambahkan state (`useState`) yang digunakan di dalam `useCallback`, `useEffect`, atau `useMemo`, Anda **WAJIB** memastikan *dependency array* diperbarui.
* **Tanda Bahaya:** `useCallback(..., [])` namun memanggil variabel *state* di dalamnya.

### 3. Peringatan: Phantom Dependencies & Turbopack
Turbopack sangat ketat terhadap resolusi *module*. 
* **Aturan:** Jangan pernah mengasumsikan sebuah *library* bisa di-*import* langsung jika belum ada di `package.json`.
* **Aturan:** Jangan menghapus file konfigurasi ekosistem (`.eslintrc.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.mjs`) tanpa alasan yang sangat, sangat darurat.

### 4. Peringatan: Keamanan & Rate Limit (Bom Waktu Infrastruktur)
* **Aturan:** Jangan pernah melakukan iterasi/looping pemanggilan pihak ketiga (seperti `callAI` atau Supabase Insert) di dalam `map` atau `forEach` tanpa batas (unbounded). Gunakan `Promise.all` dengan *batching* atau *rate limiter* (seperti p-limit).
* **Aturan:** Operasi krusial yang berhubungan dengan kuota user (seperti `increment_quota`) **WAJIB** menggunakan pemanggilan Atomic SQL/RPC (`increment_quota_atomic`), JANGAN melakukan skema "baca-lalu-tulis" (*Read-Modify-Write*) di client/server biasa karena akan hancur saat terjadi *Race Condition* (traffic tinggi).

### 5. Peringatan: Fallback Models & Graceful Degradation
* **Aturan:** Jika sistem utama mati (contoh: RAG Vector DB *down* atau API OJK *down*), fungsi utama (seperti Scam Checker) **TIDAK BOLEH** ikut hancur.
* **Tanda Bahaya:** Melempar `throw new Error` di fungsi pendukung tanpa *try-catch* di fungsi utama.
* **Solusi:** Sistem pendukung harus selalu memiliki *Fallback* (contoh: Kembalikan string kosong `""` jika RAG gagal, biarkan AI menjawab berdasarkan *general knowledge*).

---

## 🛠 Prosedur Update Fitur (SOP)

Jika Anda (AI) diminta untuk "Tambahkan fitur X", ikuti langkah ini:
1. **Analisa Ketergantungan (Dependency Audit):** Cek *file* apa saja yang akan terpengaruh.
2. **Kembangkan secara Modular (Siloed Dev):** Buat komponen baru atau *helper* baru daripada menyuntikkan ribuan baris kode ke *file* yang sudah padat.
3. **Pikirkan Skala (Scale Thinking):** "Apakah kode ini akan hancur jika ukuran file yang di-*upload* mencapai 50MB? Apakah akan *timeout* jika AI Groq membalas lebih dari 30 detik?"
4. **Validasi (Validation):** Pastikan Zod Schemas di-*update* jika ada atribut baru.

> **Pesan untuk AI Assistant:**
> *“Do No Harm. Jangan memperbaiki sesuatu yang tidak rusak kecuali diminta secara spesifik. Setiap baris kode yang Anda hapus berpotensi menjadi bom waktu jika Anda tidak tahu konteks lengkapnya.”*
