"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Loader2, FileText, Download, Scale } from "lucide-react";

export default function LegalDisputePage() {
  const [chronology, setChronology] = useState("");
  const [disputeType, setDisputeType] = useState<"POLICE" | "BANK" | "OJK">("POLICE");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chronology || chronology.length < 20) {
      setError("Kronologi terlalu pendek. Mohon jelaskan lebih detail.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/legal/generate-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chronology, dispute_type: disputeType })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error?.message || "Terjadi kesalahan saat membuat draf.");
      }

      setResult(json.data.draft_content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <Scale className="h-7 w-7 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Pengacara Pribadi</h1>
          <p className="text-white/60">Susun surat laporan resmi secara otomatis dengan gaya bahasa hukum baku.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1A1D24] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          <form onSubmit={handleGenerate} className="relative z-10 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/80">Jenis Dokumen Hukum</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "POLICE", label: "Lapor Polisi" },
                  { id: "BANK", label: "Blokir Bank" },
                  { id: "OJK", label: "Aduan OJK" }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setDisputeType(type.id as any)}
                    className={\`px-4 py-3 rounded-xl border text-sm font-medium transition-all \${
                      disputeType === type.id 
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                        : 'bg-[#0B0A08] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                    }\`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-white/80">Kronologi Kejadian</label>
              <Textarea 
                value={chronology}
                onChange={(e) => setChronology(e.target.value)}
                placeholder="Ceritakan sedetail mungkin: Saya transfer Rp 5.000.000 pada tanggal 12 Mei ke rekening BCA atas nama Bapak X dengan nomor rekening 1234567..."
                className="w-full bg-[#0B0A08] border-white/10 text-white placeholder:text-white/30 rounded-2xl text-base focus-visible:ring-indigo-500 min-h-[200px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isGenerating || chronology.length < 20}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-900/20"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyusun Dokumen Hukum...</>
              ) : (
                <><Briefcase className="mr-2 h-5 w-5" /> Generate Draf Dokumen</>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Hasil Area */}
        <div className="bg-[#1A1D24] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col h-[600px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Hasil Draf Resmi
          </h3>
          
          <div className="flex-1 bg-[#0B0A08] border border-white/5 rounded-2xl p-6 overflow-y-auto font-mono text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
            {result ? (
              result
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <FileText className="h-16 w-16 mb-4" strokeWidth={1} />
                <p>Dokumen Anda akan muncul di sini.</p>
              </div>
            )}
          </div>

          {result && (
            <Button 
              variant="outline" 
              className="mt-4 w-full h-12 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert("Draf berhasil disalin!");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Salin Teks
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
