# SafeWallet

![SafeWallet Banner](https://via.placeholder.com/1200x400/101218/00E573?text=SafeWallet+-+AI+Driven+Financial+Recovery+%26+Scam+Protection)

**SafeWallet** adalah platform pemulihan kesehatan finansial dan pelacak investasi bodong (scam) berbasis Artificial Intelligence (AI) terdepan di Indonesia. Dibangun dengan fokus utama pada pemulihan korban jeratan Pinjol & Paylater, serta perlindungan preventif terhadap skema Ponzi investasi bodong.

## 🌟 Fitur Utama

- **🧠 Saku AI Assistant & Health Scanner**: AI canggih yang membedah riwayat transaksi mutasi bank Anda secara mendalam, menilai *Debt-to-Income (DTI) ratio*, pengeluaran impulsive berbunga tinggi, untuk memberikan **Health Score**.
- **🚨 Scam & Investasi Bodong Checker**: Sistem yang dapat memindai URL atau deskripsi promosi investasi untuk mendeteksi *Red Flags* (ponzi, ketiadaan izin OJK, return tidak wajar).
- **🔒 Pinjol Rescue & Academy Lock**: Sistem penguncian otomatis (Lock Screen) jika DTI pengguna menembus ambang kritis (>35%). Pengguna wajib membaca dan memahami materi *Debt Snowball* sebelum fitur di-unlock.
- **🤖 Integrasi Telegram Bot 24/7**: Asisten finansial Saku (@SakuSafeBot) yang terhubung end-to-end secara aman dengan akun SafeWallet, memberikan evaluasi mingguan dan *coaching* finansial langsung di tangan pengguna.
- **💎 Premium Glassmorphism UI**: Desain antarmuka kelas Enterprise (Neo-Brutalism x Glassmorphism) berbasis pada warna tematik *Dark Onyx*, *Deep Iris*, dan *Neon Emerald* untuk memberikan pengalaman pengguna yang sangat modern, bersih, dan menumbuhkan rasa perlindungan psikologis.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS Policies + Magic Link Auth)
- **AI Engine**: Google Gemini API (via `@google/genai`)
- **Deployment**: [Vercel](https://vercel.com)

## 🛡️ Keamanan & Privasi

Keamanan dan privasi data pengguna adalah tulang punggung SafeWallet:
- **Zero-knowledge Processing**: File mutasi PDF & Mutasi gambar diproses sementara di Edge Server dan tidak akan pernah disimpan ke database. Algoritma mengekstrak metadata JSON tanpa menyimpan raw data.
- **Strict Content Security Policy (CSP)**: Dimplementasikan keras untuk menjegal instruksi Remote Code Execution (RCE) / XSS.
- **100% RLS Coverage**: Supabase beroperasi pada row-level-security penuh di mana pengguna A secara sistem matematis tidak dapat membongkar tabel laporan kesehatan pengguna B.
- Laporan Keamanan Lengkap tersedia di `AUDIT_REPORT.md` dan `SECURITY.md`.

## 📦 Instalasi & Menjalankan Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/kazanaruishere-max/SafeWallet.git
   cd SafeWallet
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Duplikat `.env.example` ke `.env.local` dan isi nilainya:**
   ```bash
   cp .env.example .env.local
   ```
   *Penting: Anda membutuhkan kunci API dari Supabase (URL & Anon Key), Google Gemini API, dan Token Telegram Bot.*

4. **Jalankan database migration (Supabase):**
   ```bash
   npx supabase link --project-ref your-project-id
   npx supabase db push
   ```

5. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

## 📖 Syarat dan Ketentuan & Kebijakan Privasi
SafeWallet tunduk dan mematuhi pilar Undang-Undang Pelindungan Data Pribadi (UU PDP). Silakan baca selengkapnya pada halaman `/syarat-ketentuan` dan `/kebijakan-privasi` di dalam platform.

## 🤝 Kontribusi

Kami sangat terbuka untuk *pull request*. Untuk *major changes*, silakan buka *issue* terlebih dahulu untuk mendiskusikan apa yang spesifik ingin Anda ubah.

## 📄 Lisensi

Berlisensi di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detailnya.

---
*Dibuat untuk mendorong pemulihan ekonomi generasi muda Indonesia.*
