import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Lock } from "lucide-react";

/**
 * SecurityDisclosure component provides transparency about the AI's limitations,
 * third-party data processing, and legal status of the financial analysis.
 */
export function SecurityDisclosure() {
  return (
    <div className="space-y-4 my-6">
      <Alert variant="destructive" className="border-red-500/50 bg-red-50/10">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold text-red-600">Peringatan Risiko AI & Disclaimer Finansial</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <p>
            1. <strong>Sifat Probabilistik AI</strong>: Analisis deteksi scam dan pola Ponzi dihasilkan oleh kecerdasan buatan yang bersifat probabilistik. Sistem dapat menghasilkan <em>false positives</em> atau <em>false negatives</em>.
          </p>
          <p>
            2. <strong>Bukan Saran Finansial</strong>: Layanan ini disediakan hanya untuk tujuan informasi dan edukasi. SafeWallet tidak memberikan saran investasi, pajak, atau hukum yang diatur oleh Otoritas Jasa Keuangan (OJK).
          </p>
          <p>
            3. <strong>Keputusan Mandiri</strong>: Pengguna bertanggung jawab penuh atas keputusan finansial yang diambil. Jangan mengambil tindakan finansial hanya berdasarkan output dari sistem ini tanpa verifikasi manusia yang kompeten.
          </p>
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-500/50 bg-blue-50/10">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-bold text-blue-600">Transparansi Privasi Data</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <p>
            Kami berkomitmen menjaga privasi Anda dengan langkah-langkah berikut:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Redaksi PII</strong>: Data pribadi sensitif (seperti NIK, Email, No. HP) disamarkan secara otomatis sebelum diproses.</li>
            <li><strong>Retensi OCR Terenkripsi</strong>: Teks OCR mentah tidak disimpan dalam bentuk plaintext; jika retensi diperlukan, data disimpan dengan AES-256-GCM.</li>
            <li><strong>Pemrosesan Pihak Ketiga</strong>: Analisis utama diproses melalui Groq API, sedangkan Gemini API dapat digunakan untuk embedding RAG OJK. Penggunaan layanan ini tunduk pada kebijakan privasi penyedia masing-masing.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
