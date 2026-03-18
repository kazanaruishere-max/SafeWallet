"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Scan,
  FileImage,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  File,
  Lock,
  ArrowRight
} from "lucide-react";
import type { ScanResult } from "@/types/api";
import {
  parseFile,
  getFileFormat,
  getSupportedExtensions,
  getFormatLabel,
  type ParsedFile,
} from "@/lib/file-parser";
import { useRouter } from "next/navigation";

import { SecurityDisclosure } from "@/components/security-disclosure";

// --- Components ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1A1D24]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

type ScanState = "idle" | "parsing" | "analyzing" | "done" | "error";

export default function ScanPage() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<ParsedFile["format"] | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.needs_education_lock) {
          setIsLocked(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(async (file: File) => {
    const format = getFileFormat(file);
    if (!format) {
      setError("Format tidak didukung. Gunakan: JPEG, PNG, PDF, Excel (.xlsx/.xls), CSV, atau TXT.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimum 20MB.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileFormat(format);

    if (format === "image") {
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } else {
      setPreview(null);
    }

    setState("analyzing");
    setProgress(0);
    setProgressMsg("Mengunggah dan Menganalisis (Server-Side Security)...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Gagal menganalisis. Coba lagi.");
        setState("error");
        return;
      }

      if (json.meta?.needs_education_lock) {
        setIsLocked(true);
      }

      setResult(json.data as ScanResult);
      setState("done");
    } catch {
      setError("Gagal terhubung ke server.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const getFormatIcon = (fmt: ParsedFile["format"] | null) => {
    switch (fmt) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
      case "excel": return <FileSpreadsheet className="h-5 w-5 text-[#F2A971]" />;
      case "csv": return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
      case "text": return <File className="h-5 w-5 text-gray-500" />;
      default: return <FileImage className="h-5 w-5 text-[#F2A971]" />;
    }
  };

  const resetScan = () => {
    setState("idle");
    setResult(null);
    setPreview(null);
    setFileName(null);
    setFileFormat(null);
    setProgress(0);
    setProgressMsg("");
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center min-h-[60vh] items-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#F2A971]" />
      </div>
    );
  }

  // Pinjol Rescue Lock Screen (Academy Lock)
  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
        <GlassCard className="max-w-xl p-10 border-amber-500/30">
          <div className="mx-auto w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-4">Akses Scanner Terkunci Beban Hutang</h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Sistem mendeteksi rasio Cicilan/Pendapatan Anda berada di <span className="text-amber-500 font-bold">Zona Bahaya (&gt;35%)</span>. Ini membuat Anda sangat rentan terhadap jebakan gagal bayar Pinjol predator.
          </p>
          <div className="bg-[#0B0A08]/50 border border-white/5 rounded-2xl p-6 mb-8 text-left">
            <p className="text-sm text-white/80 font-medium mb-3">Tindakan Wajib:</p>
            <p className="text-sm text-white/50 mb-4">Anda harus menyelesaikan modul mitigasi darurat sebelum memindai mutasi lagi.</p>
            <Button onClick={() => router.push("/dashboard/academy")} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-[#0B0A08] font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Buka Modul SafeWallet Academy <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Background Gradients for Scan Page */}
      <div className="absolute -top-40 -left-64 w-[600px] h-[600px] bg-[#3323D2]/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#F2A971]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Health Scanner</h1>
        <p className="mt-2 text-white/50 text-lg">
          Upload file mutasi bank. Biarkan AI kami menganalisis jejak pengeluaranmu.
        </p>
      </div>

      {state === "idle" || state === "error" ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
              <p className="font-medium flex-1">{error}</p>
              <Button variant="outline" size="sm" className="border-red-500/30 hover:bg-red-500/20 text-red-200" onClick={() => setError(null)}>Tutup</Button>
            </div>
          )}

          <GlassCard className="p-2 border-[#F2A971]/20 shadow-[0_0_40px_rgba(242,169,113,0.05)]">
            <div
              className={`flex flex-col items-center justify-center min-h-[400px] bg-[#0B0A08]/40 border-2 border-dashed border-[#F2A971]/30 rounded-[1.5rem] transition-all ${acknowledged ? 'hover:bg-[#F2A971]/5 hover:border-[#F2A971]/60 cursor-pointer' : 'opacity-50 cursor-not-allowed'} m-2 relative overflow-hidden group`}
              onDrop={(e) => acknowledged && handleDrop(e)}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => acknowledged && fileRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#F2A971]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <input
                ref={fileRef}
                type="file"
                accept={getSupportedExtensions()}
                className="hidden"
                disabled={!acknowledged}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F2A971]/10 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(242,169,113,0.2)]">
                <Upload className="h-10 w-10 text-[#F2A971]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Drop File Mutasi Di Sini
              </h3>
              <p className="text-white/50 text-center max-w-sm mb-8 leading-relaxed">
                Mendukung gambar, PDF e-statement, Excel, CSV, atau TXT. Max ukuran file 20MB.
              </p>
              {!acknowledged && (
                <p className="text-amber-500 text-sm font-medium mb-4 animate-pulse">
                  * Harap setujui Disclaimer & Batasan di bawah untuk mulai.
                </p>
              )}
              <Button disabled={!acknowledged} className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/5 backdrop-blur-md transition-all">
                <FileImage className="mr-3 h-5 w-5" /> Pilih File dari Perangkat
              </Button>
            </div>
          </GlassCard>

          {/* Security Disclosure & Checkbox */}
          <div className="mt-8 space-y-6">
            <SecurityDisclosure />
            
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1D24]/40 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="peer h-6 w-6 appearance-none rounded-lg border-2 border-white/20 bg-transparent checked:bg-[#F2A971] checked:border-[#F2A971] transition-all cursor-pointer"
                />
                <CheckCircle2 className="absolute h-4 w-4 text-[#0B0A08] left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-white/70 text-sm group-hover:text-white transition-colors">
                Saya memahami bahwa SafeWallet adalah alat bantu edukasi, bukan nasihat keuangan, dan data saya akan diproses oleh AI pihak ketiga (Gemini).
              </span>
            </label>
          </div>

          {/* Steps Indicator directly below as requested by design prompt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {[
              { num: "1", title: "Upload Mutasi", desc: "Format dokumen lengkap didukung" },
              { num: "2", title: "Ekstraksi AI", desc: "Membaca transaksi secara mendalam" },
              { num: "3", title: "Insight Keluar", desc: "Dapatkan analisis Instan" },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/5 border border-white/5 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-full bg-[#F2A971]/10 text-[#F2A971] border border-[#F2A971]/20 flex items-center justify-center font-black text-lg shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{step.title}</h4>
                  <p className="text-white/40 text-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : state === "parsing" || state === "analyzing" ? (
        <GlassCard className="p-16 flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8 min-h-[500px]">
          {/* File summary badge */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
            {getFormatIcon(fileFormat)}
            <span className="text-white font-medium truncate max-w-[200px]">{fileName}</span>
            <Badge className="bg-white/10 text-white hover:bg-white/10 border-none">{getFormatLabel(fileFormat as NonNullable<typeof fileFormat>)}</Badge>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-4 border-[#F2A971] animate-spin" />
            <div className="absolute inset-0 rounded-full border-b-4 border-[#3323D2] animate-spin shadow-[0_0_30px_rgba(51,35,210,0.4)]" style={{ animationDirection: 'reverse' }} />
            <Scan className="w-12 h-12 text-[#F2A971] animate-pulse" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {state === "parsing" ? "Membaca Struktur File..." : "AI Cognitive Analysis..."}
            </h3>
            <p className="text-white/50">{progressMsg || "Memproses dataset finansial"}</p>
          </div>

          {state === "parsing" && (
            <div className="w-full max-w-md">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#3323D2] to-[#F2A971] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/30 text-xs text-right mt-2">{progress}%</p>
            </div>
          )}
        </GlassCard>
      ) : result ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Health Score Main Card */}
            <GlassCard className="lg:col-span-4 p-10 flex flex-col items-center justify-center text-center overflow-visible">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Integrity Verified
                </Badge>
              </div>
              <div className="relative mb-8">
                <div className="w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center">
                  <span className={`text-7xl font-black ${result.health_score > 70 ? 'text-emerald-400' : result.health_score > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                    {result.health_score}
                  </span>
                </div>
                {/* Score Label */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase text-white/60">
                  Health Score
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {result.health_score > 70 ? "Keuangan Sehat!" : result.health_score > 40 ? "Perlu Perhatian" : "Kritis"}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">
                Berdasarkan analisis AI terhadap mutasi bank Anda.
              </p>
            </GlassCard>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                    </div>
                    <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Debt-to-Income</span>
                  </div>
                  <div className="text-4xl font-black text-white mb-2">
                    {Math.round(result.debt_to_income_ratio * 100)}%
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${result.debt_to_income_ratio * 100 > 35 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(result.debt_to_income_ratio * 100, 100)}%` }}
                  />
                </div>
              </GlassCard>

              <GlassCard className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Savings Rate</span>
                  </div>
                  <div className="text-4xl font-black text-white mb-2">
                    {Math.round(result.savings_rate * 100)}%
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(result.savings_rate * 100, 100)}%` }}
                  />
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Recommendations & Warnings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-10 border-emerald-500/10">
              <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Rekomendasi Strategis
              </h4>
              <ul className="space-y-4">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400/50 group-hover:bg-emerald-400 transition-colors shrink-0" />
                    <span className="text-white/60 leading-relaxed group-hover:text-white/90 transition-colors">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-10 border-red-500/10">
              <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Peringatan Dini
              </h4>
              <div className="space-y-4">
                {result.warnings.length > 0 ? (
                  result.warnings.map((warn, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400/80 text-sm leading-relaxed">
                      {warn}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-sm leading-relaxed">
                    Tidak ada peringatan kritis terdeteksi untuk saat ini.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
          
          <SecurityDisclosure />

          <div className="flex justify-center pt-8">
            <Button 
              variant="outline" 
              onClick={resetScan}
              className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-2xl px-8 h-12"
            >
              Scan File Baru
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
