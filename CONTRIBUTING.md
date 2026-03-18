# Panduan Kontribusi SafeWallet

Terima kasih telah tertarik untuk berkontribusi di SafeWallet! Sebagai proyek yang berfokus pada keamanan finansial, kami sangat menghargai setiap kontribusi yang membantu kami membangun alat yang lebih aman dan transparan bagi masyarakat.

## 1. Memulai Kontribusi

### Fork & Clone
1.  **Fork** repository ini ke akun GitHub pribadi Anda.
2.  **Clone** hasil fork tersebut ke mesin lokal Anda:
    ```bash
    git clone https://github.com/username/SafeWallet.git
    cd SafeWallet
    ```

### Setup Lingkungan Pengembangan
1.  Pastikan Anda memiliki Node.js (v20+) dan npm terinstal.
2.  Instal dependensi:
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Salin file lingkungan contoh:
    ```bash
    cp .env.example .env.local
    ```
    Isi nilai yang diperlukan untuk Supabase dan Google Gemini API.

## 2. Proses Kerja (Workflow)

### Membuat Branch
Selalu buat branch baru untuk setiap fitur atau perbaikan bug yang Anda kerjakan:
```bash
git checkout -b feature/nama-fitur-anda
# atau
git checkout -b fix/nama-bug-anda
```

### Commit & Push
Gunakan pesan commit yang deskriptif dan mengikuti konvensi (Conventional Commits):
*   `feat: ...` untuk fitur baru.
*   `fix: ...` untuk perbaikan bug.
*   `docs: ...` untuk perubahan dokumentasi.
*   `refactor: ...` untuk perubahan kode yang tidak mengubah fungsionalitas.

```bash
git add .
git commit -m "feat: deskripsi perubahan anda"
git push origin feature/nama-fitur-anda
```

### Pull Request (PR)
1.  Buka repository asli di GitHub.
2.  Klik tombol **New Pull Request**.
3.  Pilih branch Anda untuk dibandingkan dengan branch `main` kami.
4.  Isi template PR dengan detail perubahan, alasan, dan hasil pengujian.

## 3. Standar Kode & Kualitas

### Gaya Kode
*   Gunakan **TypeScript** untuk semua logika baru.
*   Ikuti konfigurasi **ESLint** dan **Prettier** yang sudah ada.
*   Berikan komentar pada logika yang kompleks.

### Pengujian (Testing)
Setiap fitur baru atau perbaikan bug **wajib** menyertakan unit test menggunakan Vitest:
```bash
npm run test
```
Pastikan semua tes lulus sebelum membuat Pull Request.

## 4. Proses Review
Tim pengelola akan meninjau PR Anda dalam waktu 3-5 hari kerja. Kami mungkin akan meminta perubahan atau klarifikasi sebelum PR disetujui dan digabungkan (merge).

## 5. Definisi Kontribusi yang Diterima
Kami menerima berbagai jenis kontribusi, termasuk:
*   Perbaikan bug keamanan atau fungsionalitas.
*   Peningkatan UI/UX.
*   Penambahan modul edukasi di SafeWallet Academy.
*   Perbaikan dokumentasi atau terjemahan.
*   Optimalisasi performa.

## 6. Pertanyaan?
Jika Anda memiliki pertanyaan tentang proses kontribusi, silakan buka diskusi di GitHub atau hubungi tim pengelola di `dev@safewallet.id`.

---
*SafeWallet - Melindungi Masa Depan Finansial Anda dengan Transparansi.*
