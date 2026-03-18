"use client";

import { ShieldCheck, Lock, Cpu, Globe, AlertTriangle } from "lucide-react";

// Inline GlassCard component since it's not exported from @/components/ui/card
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1A1D24]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

export function SecurityDisclosure() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">SafeWallet v2 Security Engine</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">AES-256-GCM Encryption</h3>
              <p className="text-sm text-white/60">
                Data sensitif Anda (mutasi rekening, teks scam) dienkripsi menggunakan standar industri sebelum disimpan di database kami.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-blue-500/20 bg-blue-500/5">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Proof-of-Integrity</h3>
              <p className="text-sm text-white/60">
                Setiap hasil analisis diverifikasi dengan hash SHA-256 yang dicatat secara immutable untuk menjamin data tidak dimanipulasi oleh pihak mana pun.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-purple-500/20 bg-purple-500/5">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Zero-Trust AI Pipeline</h3>
              <p className="text-sm text-white/60">
                PII (Personally Identifiable Information) disamarkan secara otomatis di sisi server sebelum dikirim ke model AI eksternal.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-amber-500/20 bg-amber-500/5">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">AI Probabilistic Analysis</h3>
              <p className="text-sm text-white/60">
                Analisis AI bersifat probabilistik. Deteksi scam atau pola pengeluaran mungkin memiliki false positive/negative.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="p-6 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20">
        <div className="flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
          <div className="space-y-3">
            <h4 className="font-bold text-white">PENTING: Batasan Layanan & Risiko</h4>
            <ul className="text-sm text-white/70 space-y-2 list-disc pl-4">
              <li><strong>Bukan Nasihat Keuangan:</strong> SafeWallet hanyalah alat bantu analisis edukatif. Kami TIDAK memberikan nasihat keuangan resmi (Financial Advice).</li>
              <li><strong>Risiko Data AI:</strong> Meskipun kami menyamarkan PII, data Anda diproses oleh Google Gemini. Jangan gunakan file yang berisi informasi sangat rahasia di luar transaksi keuangan standar.</li>
              <li><strong>Tanggung Jawab Pengguna:</strong> Seluruh keputusan finansial adalah tanggung jawab Anda sepenuhnya. SafeWallet tidak bertanggung jawab atas kerugian materiil atau immateriil.</li>
              <li><strong>Kepatuhan Regulasi:</strong> Layanan ini belum diaudit secara resmi oleh OJK atau otoritas keuangan lainnya.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
