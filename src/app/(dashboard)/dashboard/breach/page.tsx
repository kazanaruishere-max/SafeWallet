"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, CheckCircle, Loader2, Info } from "lucide-react";

export default function BreachScannerPage() {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsScanning(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/user/breach-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_or_phone: query })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error?.message || "Terjadi kesalahan saat scanning.");
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Data Breach Scanner</h1>
        <p className="text-white/60">Cek apakah password email atau nomor HP Anda pernah bocor dan dijual di internet (Dark Web).</p>
      </div>

      <div className="bg-[#1A1D24] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

        <form onSubmit={handleScan} className="relative z-10 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-white/80">Email atau Nomor HP</label>
            <div className="relative">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="contoh: budi@gmail.com atau 0812345678"
                className="w-full bg-[#0B0A08] border-white/10 text-white placeholder:text-white/30 pl-12 h-14 rounded-2xl text-lg focus-visible:ring-[#F2A971]"
                disabled={isScanning}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
            </div>
            <p className="text-xs text-white/40 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Tenang, data yang Anda masukkan langsung di-enkripsi di dalam database kami.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isScanning || !query}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-red-900/20"
          >
            {isScanning ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memindai Dark Web...</>
            ) : (
              <><Search className="mr-2 h-5 w-5" /> Mulai Pengecekan</>
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          {result.is_breached ? (
            <div className="bg-red-950/30 border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">BAHAYA! Data Anda Ditemukan Bocor.</h3>
                  <p className="text-white/80">{result.advice}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-red-500/20">
                <h4 className="font-semibold text-white">Ditemukan {result.breach_count} Kebocoran:</h4>
                {result.details.map((b: any, idx: number) => (
                  <div key={idx} className="bg-[#0B0A08] border border-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-white/90">{b.Name} <span className="text-white/40 font-normal text-sm">({b.Domain})</span></p>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-md">{b.BreachDate}</span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{b.Description}</p>
                    <div className="flex flex-wrap gap-2">
                      {b.DataClasses.map((dc: string) => (
                        <span key={dc} className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-md">
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-950/20 border border-green-500/20 rounded-3xl p-6 md:p-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-1">Aman!</h3>
                <p className="text-white/80">{result.advice}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Komponen ikon yang belum di-import di atas
import { AlertTriangle } from "lucide-react";
