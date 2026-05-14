"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, AlertOctagon, FileText, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0B0A08] text-white selection:bg-[#3323D2]/30">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#3323D2]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

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
            <div className="w-16 h-16 bg-[#3323D2]/20 border border-[#3323D2]/30 rounded-2xl flex items-center justify-center shrink-0">
              <Scale className="w-8 h-8 text-[#8B7DFF]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Syarat & Ketentuan Layanan</h1>
              <p className="text-white/50 text-sm mt-1">Berlaku Efektif: 13 Maret 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-indigo max-w-none text-white/70 leading-relaxed font-light text-base md:text-lg">
            
            <p className="font-medium text-white/90">
              Selamat datang di SafeWallet. Harap membaca dokumen Syarat dan Ketentuan (<em>Terms of Service</em>) ini dengan saksama. Dengan mengakses atau menggunakan aplikasi SafeWallet, Anda menyetujui persyaratan berikut yang mengikat secara hukum.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#F2A971]" /> 1. Deskripsi Layanan Platform
            </h2>
            <p>
              SafeWallet menyajikan fitur-fitur analisis finansial dan pencegahan investasi bodong yang digerakkan oleh Artificial Intelligence (AI). Output analisis, *Debt-to-Income Ratio*, tingkat bahaya, dan *Scam Verifications* adalah representasi sistem berdasarkan pengolahan data dokumen (mutasi bank) atau input deskriptif yang Pengguna berikan.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 text-amber-500" /> 2. Batasan Tanggung Jawab & Penyangkalan (Disclaimer)
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-amber-500/90 font-medium mb-6">
              SafeWallet DAN BOT TELEGRAM (@SakuSafeBot) BUKANLAH PENASIHAT KEUANGAN TERDAFTAR (LICENSED FINANCIAL ADVISOR) ATAU LEMBAGA HUKUM.
            </div>
            <ul className="list-disc pl-6 space-y-2 marker:text-[#3323D2]">
              <li>Segala bentuk <em>Health Score</em>, rekomendasi, algoritma *Debt Snowball*, dan pengkategorian "Aman/Hati-hati/Berbahaya" hanya bersifat edukasi (<em>informational and educational purposes only</em>).</li>
              <li>SafeWallet tidak menjamin keakuratan absolut 100% dari analisis bot. Semua keputusan finansial yang Anda buat berdasarkan instrumen SafeWallet sepenuhnya ada di tangan dan risiko Anda sendiri.</li>
              <li>Platform ini berintegrasi dengan pihak/sistem eksternal seperti OJK (Otoritas Jasa Keuangan) Scrapping API dan Generative AI. SafeWallet lepas tangan apabila terdapat gangguan layanan dari pihak ke-tiga tersebut.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#F2A971]" /> 3. Kuota Penggunaan & Sistem Subscription
            </h2>
            <p>
              SafeWallet menerapkan mode proteksi sistem melalui batasan penggunaan harian (<em>Rate Limiting</em>) dan kuota analisis per bulan.
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-[#3323D2]">
              <li>Pengguna <strong>Basic (Gratis)</strong> terikat pada kuota komputasi rendah (misalnya: 5 file upload mutasi/bulan).</li>
              <li>Pengguna dapat mengalihkan hak ke versi <strong>Premium</strong> dengan membayar biaya langganan via gerbang pembayaran yang tersertifikasi (Midtrans). Biaya ini tidak dapat di-*refund* begitu diaktivasi, kecuali terdapat putusan teknis internal.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Penguncian Paksa (Academy Lock Screen)</h2>
            <p>
              Dalam model etika *Pinjol Rescue*, SafeWallet mencadangkan hak fungsional penuh (Hak Prerogatif Platform) untuk mengunci sementara menu Health Scanner apabila AI mendeteksi rasio utang/pendapatan Pengguna menyentuh angka fatal (umumnya &gt;35%). Fitur akan di *unlock* begitu Pengguna mengafirmasi langkah-langkah *crisis management* di antarmuka Academy.
            </p>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Perubahan Ketentuan</h2>
            <p>
              SafeWallet dapat setiap waktu merevisi, menambah, atau mengurangi pasal di dalam Syarat & Ketentuan ini. Perubahan akan dicantumkan dan diberitahukan via *email* jika bersifat krusial. Dengan terus menggunakan platform SafeWallet, Anda bersepakat pada versi regulasi yang paling <em>up-to-date</em>.
            </p>
            
          </div>
        </div>
      </main>
    </div>
  );
}
