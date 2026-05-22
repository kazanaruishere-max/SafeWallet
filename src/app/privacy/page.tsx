import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | SafeWallet",
  description: "Kebijakan privasi dan perlindungan data SafeWallet",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Kebijakan Privasi SafeWallet</h1>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-gray-600 mb-8">
          <strong>Terakhir diperbarui:</strong> 22 Mei 2026<br />
          <strong>Versi:</strong> 1.0
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Pendahuluan</h2>
          <p>
            SafeWallet ("kami", "aplikasi") adalah platform analisis kesehatan
            finansial berbasis AI yang berkomitmen melindungi privasi dan data
            pribadi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan,
            menggunakan, dan melindungi informasi Anda sesuai dengan:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia</li>
            <li>Peraturan OJK tentang Perlindungan Konsumen</li>
            <li>GDPR (untuk pengguna di Uni Eropa)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Data yang Kami Kumpulkan</h2>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Data Akun</h3>
          <ul className="list-disc pl-6">
            <li><strong>Email:</strong> Untuk autentikasi dan komunikasi</li>
            <li><strong>Nomor Telepon:</strong> Opsional, untuk verifikasi akun</li>
            <li><strong>Pendapatan Bulanan:</strong> Untuk personalisasi rekomendasi</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Data Finansial</h3>
          <ul className="list-disc pl-6">
            <li>
              <strong>Screenshot/Foto Mutasi Bank:</strong> Diproses dengan OCR
              untuk ekstraksi data transaksi
            </li>
            <li>
              <strong>Teks OCR:</strong> Disimpan dalam bentuk{" "}
              <strong>terenkripsi AES-256-GCM</strong>, TIDAK dalam plaintext
            </li>
            <li>
              <strong>Skor Kesehatan Finansial:</strong> Hasil analisis AI (0-100)
            </li>
            <li>
              <strong>Kategori Pengeluaran:</strong> Agregat kategori (bukan detail transaksi)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">2.3 Data Teknis</h3>
          <ul className="list-disc pl-6">
            <li><strong>Alamat IP:</strong> Untuk keamanan dan deteksi fraud</li>
            <li><strong>User Agent:</strong> Untuk kompatibilitas browser</li>
            <li><strong>Log Aktivitas:</strong> Timestamp akses, fitur yang digunakan</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Bagaimana Kami Menggunakan Data</h2>
          <ul className="list-disc pl-6">
            <li>
              <strong>Analisis Kesehatan Finansial:</strong> Memproses data OCR
              dengan AI (Groq LLaMA 3.3) untuk memberikan skor dan rekomendasi
            </li>
            <li>
              <strong>Deteksi Penipuan:</strong> Membandingkan input dengan
              database OJK menggunakan vector search (pgvector)
            </li>
            <li>
              <strong>Personalisasi:</strong> Menyesuaikan rekomendasi berdasarkan
              profil dan riwayat Anda
            </li>
            <li>
              <strong>Keamanan:</strong> Monitoring aktivitas mencurigakan dan
              pencegahan penyalahgunaan
            </li>
            <li>
              <strong>Compliance:</strong> Mematuhi kewajiban hukum dan regulasi
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Keamanan Data</h2>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Enkripsi</h3>
          <ul className="list-disc pl-6">
            <li>
              <strong>Data at Rest:</strong> Semua data OCR dienkripsi dengan
              AES-256-GCM sebelum disimpan di database
            </li>
            <li>
              <strong>Data in Transit:</strong> Semua komunikasi menggunakan
              TLS 1.3 (HTTPS)
            </li>
            <li>
              <strong>Key Management:</strong> Encryption key disimpan terpisah
              dari database dan dirotasi setiap 90 hari
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Akses Kontrol</h3>
          <ul className="list-disc pl-6">
            <li>
              <strong>Row Level Security (RLS):</strong> Setiap user hanya dapat
              mengakses data mereka sendiri
            </li>
            <li>
              <strong>Role-Based Access:</strong> Tim internal hanya memiliki
              akses minimal yang diperlukan
            </li>
            <li>
              <strong>Audit Logging:</strong> Semua akses data sensitif dicatat
              dan dimonitor
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Retensi Data</h3>
          <ul className="list-disc pl-6">
            <li>
              <strong>Data OCR Plaintext:</strong> TIDAK PERNAH disimpan (langsung
              dienkripsi atau dihapus)
            </li>
            <li>
              <strong>Data Terenkripsi:</strong> Disimpan selama akun aktif + 30
              hari setelah penghapusan
            </li>
            <li>
              <strong>Audit Logs:</strong> Disimpan 1 tahun untuk compliance
            </li>
            <li>
              <strong>Backup:</strong> Encrypted backup disimpan 90 hari
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Berbagi Data dengan Pihak Ketiga</h2>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Service Providers</h3>
          <p>Kami menggunakan layanan pihak ketiga berikut:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Supabase (Database):</strong> Data disimpan di server
              Supabase dengan enkripsi. Lokasi: Singapore (AWS ap-southeast-1)
            </li>
            <li>
              <strong>Groq (AI Processing):</strong> Data OCR dikirim ke Groq
              untuk analisis. Groq TIDAK menyimpan data user untuk training.
            </li>
            <li>
              <strong>Vercel (Hosting):</strong> Aplikasi di-host di Vercel Edge
              Network. Tidak menyimpan data user.
            </li>
            <li>
              <strong>Upstash (Rate Limiting):</strong> Hanya menyimpan counter
              usage, bukan data finansial.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Tidak Dijual ke Pihak Ketiga</h3>
          <p className="font-semibold text-red-600">
            Kami TIDAK PERNAH menjual, menyewakan, atau membagikan data pribadi
            Anda kepada pihak ketiga untuk tujuan marketing atau komersial.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Hak Anda</h2>
          <p>Sesuai UU PDP dan GDPR, Anda memiliki hak untuk:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Akses:</strong> Melihat data pribadi yang kami simpan
              (tersedia di Dashboard)
            </li>
            <li>
              <strong>Koreksi:</strong> Memperbarui data yang tidak akurat
            </li>
            <li>
              <strong>Penghapusan:</strong> Menghapus akun dan semua data Anda
              (tombol "Hapus Akun" di Settings)
            </li>
            <li>
              <strong>Portabilitas:</strong> Mengekspor data Anda dalam format
              JSON (fitur "Export Data")
            </li>
            <li>
              <strong>Penarikan Consent:</strong> Mencabut persetujuan pemrosesan
              data (akan menonaktifkan fitur tertentu)
            </li>
            <li>
              <strong>Keberatan:</strong> Menolak pemrosesan data untuk tujuan
              tertentu
            </li>
          </ul>
          <p className="mt-4">
            Untuk menggunakan hak-hak ini, hubungi:{" "}
            <a href="mailto:privacy@safewallet.id" className="text-blue-600 underline">
              privacy@safewallet.id
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies dan Tracking</h2>
          <p>SafeWallet menggunakan cookies minimal:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Session Cookie:</strong> Untuk autentikasi (Supabase Auth)
            </li>
            <li>
              <strong>Consent Cookie:</strong> Untuk menyimpan preferensi consent
              Anda
            </li>
            <li>
              <strong>Analytics (Opsional):</strong> Jika Anda setuju, kami
              menggunakan analytics untuk meningkatkan layanan
            </li>
          </ul>
          <p className="mt-2">
            Anda dapat menghapus cookies melalui pengaturan browser Anda.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Keamanan Anak-Anak</h2>
          <p>
            SafeWallet tidak ditujukan untuk anak-anak di bawah 18 tahun. Kami
            tidak secara sengaja mengumpulkan data dari anak-anak. Jika Anda
            adalah orang tua dan mengetahui anak Anda memberikan data kepada
            kami, hubungi kami untuk penghapusan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan
            material akan diberitahukan melalui email atau notifikasi di aplikasi.
            Versi terbaru selalu tersedia di halaman ini dengan tanggal pembaruan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau
            ingin menggunakan hak-hak Anda:
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p><strong>Data Protection Officer</strong></p>
            <p>Email: <a href="mailto:privacy@safewallet.id" className="text-blue-600">privacy@safewallet.id</a></p>
            <p>Alamat: [Alamat kantor Anda]</p>
            <p>Telepon: [Nomor telepon]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Yurisdiksi dan Hukum yang Berlaku</h2>
          <p>
            Kebijakan ini diatur oleh hukum Republik Indonesia. Setiap sengketa
            akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan.
          </p>
        </section>

        <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-600 rounded">
          <p className="font-semibold text-blue-900">
            Dengan menggunakan SafeWallet, Anda menyatakan telah membaca,
            memahami, dan menyetujui kebijakan privasi ini.
          </p>
        </div>
      </div>
    </div>
  );
}
