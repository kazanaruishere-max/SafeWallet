"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Search,
  Link2,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Building
} from "lucide-react";
import type { ScamCheckResult } from "@/types/api";

import { SecurityDisclosure } from "@/components/security-disclosure";

const GlassCard = ({ children, className = "", style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div className={`bg-[#1A1D24]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-xl relative overflow-hidden ${className}`} style={style}>
    {children}
  </div>
);

export default function ScamPage() {
  const [activeTab, setActiveTab] = useState<"text" | "url">("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSubmit = async (inputType: "text" | "url", content: string) => {
    if (!acknowledged) {
      setError("Harap setujui Disclaimer & Batasan di bawah untuk mulai.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Konten minimal 10 karakter untuk dianalisis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputType,
          content,
          company_name: companyName || undefined,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Gagal menganalisis. Silakan coba lagi nanti.");
      } else {
        setResult(json.data as ScamCheckResult);
      }
    } catch {
      setError("Gagal terhubung ke server SafeWallet.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "SAFE":
        return {
          bg: "bg-[#F2A971]/5",
          border: "border-[#F2A971]/30",
          text: "text-[#F2A971]",
          icon: <CheckCircle2 className="h-10 w-10 text-[#F2A971]" />,
          label: "VERIFIED AMAN",
        };
      case "CAUTION":
        return {
          bg: "bg-amber-500/5",
          border: "border-amber-500/30",
          text: "text-amber-500",
          icon: <AlertTriangle className="h-10 w-10 text-amber-500" />,
          label: "HATI-HATI",
        };
      default:
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/50 outline outline-4 outline-red-500/20 outline-offset-4",
          text: "text-red-500",
          icon: <XCircle className="h-10 w-10 text-red-500" />,
          label: "CRITICAL DANGER",
          pattern: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.05) 10px, rgba(239, 68, 68, 0.05) 20px)",
        };
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "high": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#3323D2]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Scam Checker</h1>
        <p className="mt-2 text-white/50 text-lg max-w-2xl">
          Verifikasi investasi bodong sebelum menyesal. Cek URL atau isi deskripsi investasi yang ditawarkan.
        </p>
      </div>

      {!result && (
        <GlassCard className="max-w-4xl mx-auto p-1 border-white/10">
          <div className="bg-[#0B0A08]/80 rounded-[1.8rem] p-6 sm:p-10">
            {/* Custom Tabs */}
            <div className="flex bg-[#1A1D24] p-1.5 rounded-2xl w-full max-w-sm mb-8">
              <button 
                onClick={() => setActiveTab("text")}
                className={`flex-1 flex justify-center items-center py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-[#3323D2] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <FileText className="w-4 h-4 mr-2" /> Deskripsi
              </button>
              <button 
                onClick={() => setActiveTab("url")}
                className={`flex-1 flex justify-center items-center py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'url' ? 'bg-[#3323D2] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <Link2 className="w-4 h-4 mr-2" /> Link URL
              </button>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <p className="font-medium text-sm flex-1">{error}</p>
                <Button variant="ghost" size="sm" className="hover:bg-red-500/20 text-red-200 h-8" onClick={() => setError(null)}>Tutup</Button>
              </div>
            )}

            {activeTab === "text" ? (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-3">
                  <Label className="text-white/70 font-medium ml-1">Deskripsi Tawaran Investasi</Label>
                  <textarea
                    className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#F2A971] focus:border-transparent transition-all resize-none text-lg"
                    placeholder='Contoh: "Penitipan dana investasi 15% PASTI UNTUNG modal 1 juta cair 5 juta besok..."'
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
                <div className="space-y-3 flex items-center gap-4 bg-[#1A1D24]/50 p-4 rounded-2xl border border-white/5">
                  <div className="shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-white/70 font-medium mb-1 block">Entitas / Perusahaan (Opsional)</Label>
                    <Input
                      placeholder="Nama PT atau Aplikasi"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-10 border-0 bg-transparent px-0 text-white placeholder:text-white/20 focus-visible:ring-0 text-md"
                    />
                  </div>
                </div>
                <Button
                  className="w-full h-16 rounded-2xl bg-[#F2A971] text-[#0B0A08] font-black text-lg shadow-[0_0_30px_rgba(242,169,113,0.3)] hover:shadow-[0_0_40px_rgba(242,169,113,0.5)] hover:-translate-y-1 transition-all"
                  disabled={loading}
                  onClick={() => handleSubmit("text", textInput)}
                >
                  {loading ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Memeriksa Red Flags...</>
                  ) : (
                    <><Search className="mr-3 h-6 w-6" /> Periksa Indikasi Scam</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-left-4">
                <div className="space-y-3">
                  <Label className="text-white/70 font-medium ml-1">URL Website Investasi</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Link2 className="h-6 w-6 text-white/30" />
                    </div>
                    <Input
                      placeholder="https://exampleinvestasi-cuan.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full h-16 rounded-2xl border border-white/10 bg-white/5 pl-14 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#F2A971] focus:border-transparent transition-all text-lg"
                    />
                  </div>
                </div>
                <Button
                  className="w-full h-16 rounded-2xl bg-[#F2A971] text-[#0B0A08] font-black text-lg shadow-[0_0_30px_rgba(242,169,113,0.3)] hover:shadow-[0_0_40px_rgba(242,169,113,0.5)] hover:-translate-y-1 transition-all"
                  disabled={loading}
                  onClick={() => handleSubmit("url", urlInput)}
                >
                  {loading ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Menganalisis Domain...</>
                  ) : (
                    <><Search className="mr-3 h-6 w-6" /> Periksa Website</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Result Board */}
      {result && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Hasil Analisis</h2>
            <Button onClick={() => setResult(null)} variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10">
              <Search className="w-4 h-4 mr-2" /> Pengecekan Baru
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
            
            {/* Verdict Card */}
            {(() => {
              const style = getVerdictStyle(result.verdict);
              return (
                <GlassCard className={`p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px] border-2 ${style.border} ${style.bg}`} style={style.pattern ? { backgroundImage: style.pattern } : {}}>
                  <div className="mb-6 p-4 bg-white/5 rounded-full backdrop-blur-md shadow-2xl">
                    {style.icon}
                  </div>
                  <h3 className={`text-4xl font-black mb-2 tracking-tighter ${style.text}`}>{style.label}</h3>
                  <div className="flex gap-4 mt-8">
                    <div className="bg-[#0B0A08]/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/5">
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Risk Score</p>
                      <p className={`text-3xl font-black ${style.text}`}>{result.risk_score}<span className="text-lg text-white/30">/100</span></p>
                    </div>
                  </div>
                  <div className="mt-8 bg-[#0B0A08]/50 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-white/5">
                    <Shield className={`w-4 h-4 ${result.ojk_status.registered ? 'text-[#F2A971]' : 'text-red-500'}`} />
                    <span className="text-white/80 text-sm font-medium">
                      {result.ojk_status.registered ? "Terdaftar di OJK" : "ILLEGAL - TIDAK TERDAFTAR OJK"}
                    </span>
                  </div>
                </GlassCard>
              );
            })()}

            {/* Details Column */}
            <div className="space-y-6">
              {result.red_flags.length > 0 ? (
                <GlassCard className="p-8 border-red-500/10">
                  <h4 className="text-xl font-bold flex items-center gap-3 text-white mb-6">
                    <AlertTriangle className="text-red-500 w-6 h-6" /> Red Flags Terdeteksi ({result.red_flags.length})
                  </h4>
                  <div className="space-y-4">
                    {result.red_flags.map((flag, i) => (
                      <div key={i} className="flex gap-4 items-start p-5 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${flag.severity === 'critical' ? 'bg-red-500' : flag.severity === 'high' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-white uppercase tracking-wider text-sm">{flag.type.replace(/_/g, " ")}</h5>
                            <Badge className={getSeverityStyle(flag.severity)}>{flag.severity}</Badge>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{flag.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-8 border-[#F2A971]/20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F2A971]/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#F2A971]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Bebas Red Flags</h4>
                    <p className="text-white/50">Tidak ditemukan indikasi penipuan investasi umum pada deskripsi ini.</p>
                  </div>
                </GlassCard>
              )}

              {result.safe_alternatives.length > 0 && (
                <GlassCard className="p-8">
                  <h4 className="text-xl font-bold flex items-center gap-3 text-white mb-6">
                    <CheckCircle2 className="text-[#F2A971] w-6 h-6" /> Alternatif Legal Tersedia
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.safe_alternatives.map((alt, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <p className="font-bold text-white mb-2">{alt.name}</p>
                        <div className="flex gap-2">
                          <Badge className="bg-[#F2A971]/10 text-[#F2A971] border-none">Return {alt.return}</Badge>
                          <Badge className="bg-white/10 text-white border-none">{alt.risk}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Common Red Flags Reference */}
      {!result && (
        <div className="mt-12 pt-12 border-t border-white/5">
          <div className="mb-6 flex items-center gap-3">
            <AlertTriangle className="text-white/30 w-5 h-5" />
            <h3 className="text-white/50 font-medium">Buku Panduan: Definisi Investasi Bodong</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Return >2% per bulan (>24% per tahun) tanpa risiko",
              "Skema Ponzi & piramida MLM agresif",
              "Rekening transfer atas nama pribadi, bukan perusahaan",
              "Tidak terdaftar resmi di portal OJK",
              "Tidak ada underlying asset yang jelas",
              "Menekan calon korban untuk setor segera"
            ].map((flag, idx) => (
              <div key={idx} className="p-4 bg-[#1A1D24]/40 border border-white/5 rounded-2xl flex gap-3 text-sm text-white/40">
                <span className="text-red-500/50 font-bold">{idx + 1}.</span>
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 space-y-6">
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

      {/* Floating Gradient for ambiance */}
      <div className="fixed -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
