"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Database, Lock, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0A08] text-white selection:bg-[#F2A971]/30">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3323D2]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#F2A971]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl h-12">
              <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="bg-[#1A1D24]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
            <div className="w-16 h-16 bg-[#F2A971]/10 border border-[#F2A971]/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#F2A971]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Kebijakan Privasi</h1>
              <p className="text-white/50 text-sm mt-1">Terakhir Diperbarui: 13 Maret 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none text-white/70 leading-relaxed font-light text-base md:text-lg">
            
            <p className="font-medium text-white/90">
              Platform SafeWallet ("kami", "milik kami", atau "SafeWallet") menghormati privasi Anda dan berkomitmen teguh untuk melindungi data pribadi dan informasi finansial Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, memproses, dan melindungi informasi Anda sejalan dengan **Undang-Undang Pelindungan Data Pribadi (UU PDP)** Republik Indonesia.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-[#8B7DFF]" /> 1. Pengumpulan dan Pemrosesan Data
            </h2>
            <p>
              Saat Anda menggunakan layanan Health Scanner dan integrasi Bot Saku AI di aplikasi SafeWallet, algoritma kami bekerja dengan prinsip perlindungan data minimum (<em>Data Minimization</em>).
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#F2A971]">
              <li><strong>Informasi Dasar:</strong> Saat mendaftar via email (Magic Link) atau OAuth, kami menyimpan nama dan alamat email. Nomor ponsel (Telegram/WhatsApp) bersifat opsional.</li>
              <li><strong>Data Mutasi Finansial (Zero-Retention Pattern):</strong> File PDF mutasi bank atau screenshot yang Anda unggah ke sistem Health Scanner diproses sementara hanya pada Random Access Memory (RAM) server tersandikan (End-to-End Encryption). File Asli (Raw File) tersebut <strong>TIDAK PERNAH DISIMPAN</strong> ke dalam database kami.</li>
              <li><strong>Data Turunan:</strong> Kami hanya menyimpan hasil analisis berbentuk matriks kategori JSON (misal: "Pemasukan", "Pengeluaran Cicilan") untuk tujuan kalkulasi <em>Health Score</em> dan <em>Debt-to-Income Ratio</em>.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#8B7DFF]" /> 2. Keamanan dan Insulasi Data (RLS)
            </h2>
            <p>
              Kami mengimplementasikan keamanan tingkat Enterprise (*Enterprise-grade Security*):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#F2A971]">
              <li>Seluruh basis data operasi mengandalkan PostgreSQL dengan <strong>Row-Level Security (RLS)</strong> yang 100% diaktifkan. Hal ini secara struktural mencegah kebocoran data silang—server kami tidak bisa membocorkan riwayat scan Anda kepada pengguna lain meski sistem berhasil ditembus (<em>breached</em>).</li>
              <li>Penggunaan Content Security Policy (CSP) untuk memerangi serangan <em>Cross-Site Scripting (XSS)</em>.</li>
              <li>Sistem tidak akan membaca atau mentransmisikan data ke sistem AI Generatif tanpa enkripsi data <em>in-transit</em> dan <em>at-rest</em> (TLS 1.3).</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-[#8B7DFF]" /> 3. Hak Anda Sebagai Subjek Data
            </h2>
            <p>
              Sejalan dengan regulasi perlindungan data yang berlaku, Anda memegang otonomi mutlak atas jejak digital Anda di SafeWallet:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4 marker:text-[#F2A971] font-medium text-white/80">
              <li><strong>Hak Akses (Right to Access):</strong> Anda berhak mendapatkan salinan data yang Anda berikan. Anda dapat menggunakan fitur "Unduh Rekam Jejak (JSON)" di menu Profil.</li>
              <li><strong>Hak Penghapusan (Right to Erasure/Right to be Forgotten):</strong> Anda dapat menghapus akun beserta seluruh data mutasi, analisis AI, dan kredensial seketika langsung melalui menu Pengaturan Profil kami (Fitur "Hapus Akun Permanen"). Data Anda akan dibersihkan dari server dalam rentang 1-30 hari sesuai protokol sistem.</li>
              <li><strong>Hak Perbaikan (Right to Rectification):</strong> Pilihan untuk merevisi preferensi Telegram Bot dan gaji bulanan Anda kapan saja.</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Kebijakan Anti-Penjualan Data</h2>
            <p className="border-l-4 border-[#F2A971] pl-6 py-2 bg-[#F2A971]/5 rounded-r-lg">
              Kami mendeklarasikan secara eksplisit: <strong>SafeWallet TIDAK PERNAH dan TIDAK AKAN PERNAH menjual, menukar, menyewakan, maupun mengambil profit dari komersialisasi agregat data finansial perorangan</strong> kepada entitas pinjaman online, bank, maupun pihak ketiga lainnya demi keuntungan bisnis.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Kontak Privasi</h2>
            <p>
              Apabila terdapat keraguan, pertanyaan, maupun laporan pelanggaran privasi (<em>breach report</em>), Petugas Pelindungan Data (<em>Data Protection Officer</em>) kami siap melayani Anda melalui: <br/>
              <strong>Email:</strong> <code>privacy@safewallet.id</code><br/>
              <strong>Telegram Bot Bantuan:</strong> <code>@SakuSafeBot /support</code>
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
