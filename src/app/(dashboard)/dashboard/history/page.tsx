"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Loader2,
  ArrowLeft,
  Scan,
  FileText,
  ChevronRight,
  TrendingDown,
  Lock
} from "lucide-react";
import type { ScanHistoryItem } from "@/types/api";

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1A1D24]/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-lg relative overflow-hidden transition-all hover:bg-white/5 hover:border-white/10 group ${className}`}>
    {children}
  </div>
);

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/user/scans?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setScans(json.data);
          setTotal(json.meta?.total ?? 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const getScoreStyle = (score: number) => {
    if (score >= 80) return {
      color: "text-[#F2A971]",
      bg: "bg-[#F2A971]/10",
      border: "border-[#F2A971]/20",
      label: "Health Score Baik",
      badge: "bg-[#F2A971]"
    };
    if (score >= 50) return {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Perlu Evaluasi",
      badge: "bg-amber-500"
    };
    return {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      label: "Kritis",
      badge: "bg-red-500"
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-[#3323D2]/30 rounded-full animate-ping" />
          <Loader2 className="h-10 w-10 animate-spin text-[#3323D2]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3323D2]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#F2A971]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 h-12 w-12">
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Riwayat Scan</h1>
            <p className="text-white/50 text-lg">
              {total} dokumen mutasi dianalisis sejauh ini.
            </p>
          </div>
        </div>
        <Link href="/dashboard/scan">
          <Button className="h-12 px-6 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all font-bold">
            <Scan className="w-5 h-5 mr-2" /> Scan Dokumen Baru
          </Button>
        </Link>
      </div>

      {scans.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center border-dashed border-white/20">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 mb-8 shadow-2xl">
            <Scan className="h-12 w-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Belum ada riwayat</h3>
          <p className="max-w-md text-white/50 mb-8 leading-relaxed">
            Upload file mutasi bank Anda untuk mendapatkan jejak riwayat kesehatan finansial bulan demi bulan.
          </p>
          <Link href="/dashboard/scan">
            <Button className="h-14 px-8 rounded-2xl bg-[#F2A971] text-[#0B0A08] font-bold text-lg shadow-[0_0_30px_rgba(242,169,113,0.3)] hover:shadow-[0_0_40px_rgba(242,169,113,0.4)] transition-all">
              <Scan className="mr-2 h-5 w-5" /> Mulai Analisis Pertamamu
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {scans.map((scan, i) => {
            const style = getScoreStyle(scan.health_score);
            const date = new Date(scan.created_at);
            const topCategories = Object.entries(scan.categories || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3);

            return (
              <GlassCard key={scan.id || i} className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer">
                {/* Left Thumbnail */}
                <div className={`w-20 h-20 shrink-0 rounded-2xl border flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${style.bg} ${style.border}`}>
                  <FileText className={`h-8 w-8 ${style.color}`} />
                  <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${style.color}`}>Report</span>
                </div>

                {/* Middle Info */}
                <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <span className="text-sm font-medium text-white/50">
                      {date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {scan.blockchain_tx_id && (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Proof-of-Integrity
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    {topCategories.map(([cat, amount]) => (
                      <span
                        key={cat}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-semibold text-white/70"
                      >
                        {cat} <span className="text-white/40 ml-1 font-normal">Rp {(amount as number).toLocaleString("id-ID")}</span>
                      </span>
                    ))}
                  </div>

                  {scan.recommendations?.[0] && (
                    <p className="text-sm text-white/60 truncate w-full max-w-2xl bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="mr-2 text-[#8B7DFF]">✨ AI Update:</span> {scan.recommendations[0]}
                    </p>
                  )}
                </div>

                {/* Right Score */}
                <div className="shrink-0 flex items-center gap-5 bg-white/5 px-6 py-4 rounded-2xl border border-white/5 h-20 w-full sm:w-auto justify-between sm:justify-center">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs uppercase tracking-wider font-bold text-white/30 mb-1">{style.label}</span>
                    <Badge className={`border-none ${style.badge} text-[#0B0A08] font-black uppercase tracking-wider py-1 px-3 shadow-[0_0_15px_inherit]`}>
                      {scan.health_score} / 100
                    </Badge>
                  </div>
                  {scan.health_score >= 80 ? (
                    <TrendingUp className={`w-8 h-8 ${style.color} drop-shadow-lg opacity-50 sm:opacity-100`} />
                  ) : (
                    <TrendingDown className={`w-8 h-8 ${style.color} drop-shadow-lg opacity-50 sm:opacity-100`} />
                  )}
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all hidden sm:block" />
                </div>
              </GlassCard>
            );
          })}

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Prev
              </Button>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-white">
                  Hal {page} <span className="text-white/30 mx-1">/</span> {Math.ceil(total / 10)}
                </span>
              </div>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                disabled={page >= Math.ceil(total / 10)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
