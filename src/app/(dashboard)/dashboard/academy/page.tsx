"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen, CheckCircle2, Loader2, PlayCircle, ShieldIcon } from "lucide-react";
import { toast } from "sonner";

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1A1D24]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function AcademyPage() {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/user/complete-module", { method: "POST" });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Edukasi Selesai! Akses Health Scanner telah dibuka.");
        setTimeout(() => {
          router.push("/dashboard/scan");
        }, 1500);
      } else {
        toast.error(json.error?.message ?? "Gagal menyelesaikan modul.");
      }
    } catch {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="text-center space-y-4 mb-12">
        <div className="mx-auto bg-gradient-to-br from-[#3323D2] to-[#8B7DFF] w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-[#3323D2]/30 rotate-3 transition-transform hover:rotate-6">
          <BookOpen className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Saku Academy</h1>
        <p className="text-[#8B7DFF] font-bold text-lg uppercase tracking-widest">
          Modul Wajib: Pertolongan Pertama Jeratan Pinjol
        </p>
      </div>

      <GlassCard className="p-1 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <div className="bg-amber-500/10 rounded-[1.8rem] p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 shrink-0 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-xl font-bold text-amber-500">Kenapa akun Anda terkunci di halaman ini?</h3>
            <p className="text-amber-500/80 leading-relaxed text-sm md:text-base">
              Sistem AI SafeWallet mendeteksi bahwa <strong className="text-amber-400">rasio utang Anda melampaui 35%</strong> dari total pendapatan bulan ini. Secara statistik, angka ini adalah batas kritis sebelum kehilangan kendali finansial. Kami mengunci fitur Scan sementara agar Anda fokus pada metodologi penyelesaian masalah utang jangka pendek berikut ini.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6 mt-12">
        {/* Module 1 */}
        <GlassCard className="p-8 group hover:border-[#3323D2]/50 transition-colors">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/50 group-hover:bg-[#3323D2] group-hover:text-white group-hover:border-[#3323D2] transition-colors">1</div>
            <h2 className="text-2xl font-bold text-white">Bunga Pinjol: Ilusi Kecepatan</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="prose prose-invert max-w-none text-white/60 text-base leading-relaxed">
              <p>
                Berbeda dengan pinjaman bank, aplikasi pinjol dan paylater sering membebankan biaya secara harian yang jika ditotal bisa mencapai <span className="text-red-400 font-bold">24% - 36% per tahun!</span>
              </p>
              <p>
                Utang Rp 5.000.000 dengan bunga 2% per bulan akan membengkak tanpa disadari, memicu siklus "gali lubang tutup lubang".
              </p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#0B0A08] group-hover:border-[#3323D2]/30 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <PlayCircle className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform group-hover:text-[#8B7DFF]" />
              </div>
              <div className="absolute bottom-4 left-4 z-20">
                <Badge className="bg-[#3323D2] border-none text-white">Materi Video</Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Module 2 */}
        <GlassCard className="p-8 group hover:border-[#F2A971]/50 transition-colors">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/50 group-hover:bg-[#F2A971] group-hover:text-[#0B0A08] group-hover:border-[#F2A971] transition-colors">2</div>
            <h2 className="text-2xl font-bold text-white">Metode: Algoritma Debt Snowball</h2>
          </div>
          <p className="text-white/60 mb-6 text-base">Berhentilah meminjam di aplikasi B untuk menutup aplikasi A. Terapkan strategi klasik <strong>Debt Snowball</strong> berikut:</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "List Semua Hutang", desc: "Catat semua sisa cicilan dari saldo terkecil hingga terbesar, tanpa melihat bunganya." },
              { title: "Bayar Minimum", desc: "Bayar minimum untuk semua hutang, KECUALI hutang dengan saldo terkecil di list." },
              { title: "Serang yang Terkecil", desc: "Fokuskan seluruh sisa uang untuk melunasi hutang terkecil tersebut sampai lunas." },
              { title: "Gulung Bola Salju", desc: "Setelah hutang terkecil lunas, alihkan uang cicilannya untuk menggempur hutang berikutnya." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-[#F2A971]/70 font-mono">0{idx + 1}</span> {step.title}
                </h4>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Module 3 */}
        <GlassCard className="p-8 group hover:border-white/20 transition-colors">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/50 group-hover:bg-white group-hover:text-[#0B0A08] transition-colors">3</div>
            <h2 className="text-2xl font-bold text-white">Sabotase Diri Secara Positif</h2>
          </div>
          <div className="bg-[#0B0A08] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-24 h-24 shrink-0 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <ShieldIcon className="w-12 h-12 text-red-500" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-white/70 text-base leading-relaxed mb-4">
                Langkah pertama menuju pemulihan bukanlah mencari lebih banyak uang, melainkan <strong className="text-white">berhenti menambah utang baru malam ini juga</strong>.
              </p>
              <p className="text-amber-400/80 font-medium bg-amber-500/10 px-4 py-2 rounded-lg inline-block text-sm">
                Aksi Segera: Hapus & Uninstall seluruh aplikasi e-commerce dan pinjaman dari HP Anda.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col items-center pt-8 pb-12 space-y-6">
        <div className="bg-[#1A1D24] border border-white/10 rounded-2xl p-6 text-center max-w-2xl w-full">
          <p className="text-sm font-medium text-white/60 leading-relaxed mb-6">
            Dengan menekan tombol di bawah, saya sadar letak masalah finansial saya dan berkomitmen untuk menekan rem dan tidak membuat utang baru.
          </p>
          <Button 
            className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-[#F2A971] text-[#0B0A08] font-black text-lg shadow-[0_0_30px_rgba(242,169,113,0.3)] hover:shadow-[0_0_40px_rgba(242,169,113,0.5)] hover:-translate-y-1 transition-all" 
            onClick={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Sedang Membuka Kunci Akun...</>
            ) : (
              <><CheckCircle2 className="mr-3 h-6 w-6" /> Saya Berkomitmen & Buka Kunci</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
