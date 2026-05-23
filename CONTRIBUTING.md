# Panduan Kontribusi SafeWallet

Terima kasih telah tertarik untuk berkontribusi di SafeWallet! Sebagai platform inovasi *Financial Wellness* dan keamanan finansial dengan arsitektur *Zero-Trust*, kami sangat menghargai setiap *pull request* yang Anda kirimkan.

Untuk menjaga integritas proyek, seluruh kontributor diwajibkan membaca panduan di bawah ini sebelum membuat *Pull Request* (PR).

## 1. Setup Lingkungan Pengembangan

### Fork & Clone
1. **Fork** repository ini ke akun GitHub pribadi Anda.
2. **Clone** hasil fork tersebut ke mesin lokal Anda:
   ```bash
   git clone https://github.com/username/SafeWallet.git
   cd SafeWallet
   ```

### Prasyarat
- **Node.js**: v20 atau lebih baru (Disarankan menggunakan NVM).
- **Package Manager**: npm v10+.
- Akun **Supabase** (tier gratis sudah cukup) untuk *environment* lokal.
- Kunci API **Groq** untuk menjalankan LLM secara lokal.

### Instalasi
1. Instal dependensi:
   ```bash
   npm install
   ```
2. Salin file lingkungan:
   ```bash
   cp .env.example .env.local
   ```
3. Konfigurasikan `.env.local` dengan kredensial dari project Supabase lokal/dev dan Groq API Anda.

---

## 2. Standar Alur Kerja (Git Workflow)

Proyek ini menggunakan model pencabangan (*branching model*) yang terstruktur:
- `main`: Branch produksi yang sudah *deployable*. Tidak menerima commit langsung.
- `feature/*`: Untuk penambahan fitur baru (misal: `feature/telegram-bot`).
- `fix/*`: Untuk perbaikan bug (misal: `fix/ocr-parsing-error`).
- `hotfix/*`: Untuk perbaikan kritis langsung di produksi (sangat jarang, hanya untuk tim inti).
- `docs/*`: Untuk perubahan dokumentasi murni.

### Membuat Branch
Selalu buat branch baru dari `main` terbaru:
```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur-anda
```

### Commit Messages
Gunakan **Conventional Commits**:
- `feat: ...` untuk fitur baru.
- `fix: ...` untuk perbaikan bug.
- `docs: ...` untuk perubahan dokumentasi.
- `refactor: ...` untuk perubahan struktur tanpa mengubah perilaku dasar.
- `test: ...` penambahan atau pembaruan *unit tests*.

---

## 3. CI/CD Requirements (Syarat Lulus Pull Request)

SafeWallet mengimplementasikan *Continuous Integration* yang ketat menggunakan GitHub Actions. Setiap PR akan melewati serangkaian pengecekan otomatis. Anda **diwajibkan** untuk memastikan kode lulus uji lokal sebelum melakukan push:

### Pengecekan Lokal Wajib
1. **Linting (ESLint)**: Pastikan tidak ada *error* atau *warning*.
   ```bash
   npm run lint
   ```
2. **Formatting (Prettier)**: Gunakan Prettier untuk format file konsisten.
   ```bash
   npx prettier --write .
   ```
3. **Type Checking (TypeScript)**: Pastikan tipe data konsisten dan tidak memunculkan `any` *implicit errors*.
   ```bash
   npm run typecheck # Jika ada script tsc
   npx tsc --noEmit
   ```
4. **Unit Tests (Vitest)**: Jika Anda menambah/merubah utilitas, pastikan tes lulus.
   ```bash
   npm run test
   ```
5. **Build Check**: Pastikan Next.js dapat *build* dengan sukses tanpa memecah *Route* atau *Server Actions*.
   ```bash
   npm run build
   ```

Jika PR gagal di pengecekan CI GitHub, perbaiki kode dan perbarui PR Anda. Kami tidak akan *merge* PR yang berstatus merah (gagal).

---

## 4. Aturan Keamanan (Security Rules)

Kepatuhan keamanan adalah **kewajiban utama**. Tolong perhatikan hal-hal berikut saat menulis kode:

1. **JANGAN PERNAH** meletakkan *Secret Key* atau *API Key* di kode sumber (hardcoded). Semuanya harus diakses lewat `process.env`.
2. **Anti-Timebomb**: Jangan menghapus/merubah tipe *return* dari sebuah *Server Action* atau API tanpa mem-verifikasi semua komponen *Frontend* yang mengkonsumsi API tersebut. *Payload change* sering memecahkan aplikasi di tempat yang tidak terduga.
3. **Validasi Input**: Jangan pernah mempercayai input klien. Gunakan Zod untuk memvalidasi *form* dan masukan pengguna.
4. **Privacy First**: Jangan *console.log* atau menyimpan NIK, nomor rekening, nominal uang, atau alamat asli pengguna di file log manapun. Patuhi *PII Stripping Protocol*.
5. Jangan mengubah logika **Supabase RLS** (*Row-Level Security*) tanpa mencantumkan alasan kriptografi dan ancaman (Threat Analysis) di deskripsi PR.

---

## 5. Mengirim Pull Request (PR)

1. *Push* branch Anda ke GitHub.
2. Buka repository SafeWallet asli dan klik **New Pull Request**.
3. Isi deskripsi secara mendetail.
4. Lampirkan tangkapan layar (jika PR merubah UI).
5. Tunggu *review* dari *Maintainer* (estimasi 3-5 hari kerja).

Terima kasih atas kontribusi Anda dalam menjaga masyarakat dari penipuan finansial!
