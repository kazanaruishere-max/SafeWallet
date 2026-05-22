import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | SafeWallet",
  description: "Syarat dan ketentuan penggunaan SafeWallet",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Syarat & Ketentuan SafeWallet</h1>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-gray-600 mb-8">
          <strong>Terakhir diperbarui:</strong> 22 Mei 2026<br />
          <strong>Versi:</strong> 1.0
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Penerimaan Syarat</h2>
          <p>
            Dengan mengakses dan menggunakan SafeWallet ("Layanan"), Anda
            menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda
            tidak setuju, mohon tidak menggunakan Layanan kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Deskripsi Layanan</h2>
          <p>
            SafeWallet adalah platform analisis kesehatan finansial berbasis AI
            yang menyediakan:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Health Scanner: Analisis mutasi bank untuk skor kesehatan finansial</li>
            <li>Scam Checker: Deteksi penipuan investasi dan finansial</li>
            <li>AI Pengacara: Bantuan pembuatan dokumen legal</li>
          </ul>
          <p className="mt-4 font-semibold text-red-600">
            DISCLAIMER: SafeWallet adalah alat bantu edukasi dan analisis. Hasil
            analisis BUKAN merupakan nasihat finansial, hukum, atau investasi
            profesional. Selalu konsultasikan dengan ahli berlisensi untuk
            keputusan penting.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Akun Pengguna</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Registrasi</h3>
          <ul className="list-disc pl-6">
            <li>Anda harus berusia minimal 18 tahun untuk menggunakan Layanan</li>
            <li>Informasi yang Anda berikan harus akurat dan terkini</li>
            <li>Anda bertanggung jawab menjaga kerahasiaan akun Anda</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Keamanan Akun</h3>
          <ul className="list-disc pl-6">
            <li>Jangan membagikan password Anda kepada siapa pun</li>
            <li>Laporkan segera jika akun Anda diakses tanpa izin</li>
            <li>Kami tidak bertanggung jawab atas kerugian akibat kelalaian Anda</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Penggunaan yang Dilarang</h2>
          <p>Anda TIDAK DIPERBOLEHKAN:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Menggunakan Layanan untuk aktivitas ilegal atau penipuan</li>
            <li>Mengunggah malware, virus, atau kode berbahaya</li>
            <li>Melakukan reverse engineering atau scraping data</li>
            <li>Menyalahgunakan API atau mencoba bypass rate limiting</li>
            <li>Menggunakan bot atau automated tools tanpa izin</li>
            <li>Mengunggah data orang lain tanpa persetujuan mereka</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Hak Kekayaan Intelektual</h2>
          <p>
            Semua konten, desain, logo, dan teknologi SafeWallet adalah milik
            kami dan dilindungi oleh hukum hak cipta Indonesia dan internasional.
          </p>
          <p className="mt-2">
            Anda diberikan lisensi terbatas untuk menggunakan Layanan untuk
            keperluan pribadi non-komersial.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Langganan & Pembayaran</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">6.1 Tier Gratis</h3>
          <ul className="list-disc pl-6">
            <li>5 scan kesehatan finansial per bulan</li>
            <li>10 cek scam per bulan</li>
            <li>Fitur dasar AI Pengacara</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">6.2 Tier Premium</h3>
          <ul className="list-disc pl-6">
            <li>Unlimited scan dan cek scam</li>
            <li>Analisis lebih detail dan rekomendasi personal</li>
            <li>Prioritas customer support</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">6.3 Pembayaran</h3>
          <ul className="list-disc pl-6">
            <li>Pembayaran diproses melalui Midtrans (aman dan terenkripsi)</li>
            <li>Langganan diperpanjang otomatis kecuali dibatalkan</li>
            <li>Refund hanya diberikan dalam 7 hari pertama jika tidak ada penggunaan</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Batasan Tanggung Jawab</h2>
          <p className="font-semibold text-red-600 mb-4">
            PENTING: BACA BAGIAN INI DENGAN SEKSAMA
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Akurasi AI:</strong> Hasil analisis AI dapat mengandung
              kesalahan. Kami tidak menjamin 100% akurasi.
            </li>
            <li>
              <strong>Keputusan Finansial:</strong> Anda sepenuhnya bertanggung
              jawab atas keputusan finansial Anda. SafeWallet hanya alat bantu.
            </li>
            <li>
              <strong>Kerugian:</strong> Kami tidak bertanggung jawab atas
              kerugian finansial, kehilangan data, atau kerusakan yang timbul
              dari penggunaan Layanan.
            </li>
            <li>
              <strong>Downtime:</strong> Kami berusaha menjaga uptime 99.9%,
              namun tidak menjamin Layanan selalu tersedia.
            </li>
            <li>
              <strong>Pihak Ketiga:</strong> Kami tidak bertanggung jawab atas
              layanan pihak ketiga (Groq AI, Supabase, dll).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Penghentian Layanan</h2>
          <p>Kami berhak menghentikan akses Anda jika:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Anda melanggar syarat dan ketentuan ini</li>
            <li>Anda melakukan aktivitas yang merugikan pengguna lain</li>
            <li>Anda tidak membayar langganan yang jatuh tempo</li>
            <li>Kami mendeteksi aktivitas mencurigakan atau fraud</li>
          </ul>
          <p className="mt-4">
            Anda dapat menghapus akun Anda kapan saja melalui Settings. Data
            Anda akan dihapus dalam 30 hari sesuai kebijakan privasi.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Perubahan Syarat</h2>
          <p>
            Kami dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu.
            Perubahan material akan diberitahukan melalui email atau notifikasi
            di aplikasi minimal 30 hari sebelum berlaku.
          </p>
          <p className="mt-2">
            Penggunaan Layanan setelah perubahan berlaku berarti Anda menyetujui
            syarat yang baru.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Hukum yang Berlaku</h2>
          <p>
            Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.
            Setiap sengketa akan diselesaikan melalui:
          </p>
          <ol className="list-decimal pl-6 mt-2">
            <li>Mediasi (upaya penyelesaian damai)</li>
            <li>Arbitrase BANI (Badan Arbitrase Nasional Indonesia)</li>
            <li>Pengadilan Negeri Jakarta Selatan (jika arbitrase gagal)</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini:
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p><strong>SafeWallet Support</strong></p>
            <p>Email: <a href="mailto:support@safewallet.id" className="text-blue-600">support@safewallet.id</a></p>
            <p>Legal: <a href="mailto:legal@safewallet.id" className="text-blue-600">legal@safewallet.id</a></p>
            <p>Alamat: [Alamat kantor Anda]</p>
          </div>
        </section>

        <div className="mt-12 p-6 bg-yellow-50 border-l-4 border-yellow-600 rounded">
          <p className="font-semibold text-yellow-900">
            Dengan menggunakan SafeWallet, Anda menyatakan telah membaca,
            memahami, dan menyetujui syarat dan ketentuan ini.
          </p>
        </div>
      </div>
    </div>
  );
}
