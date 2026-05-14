"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Scan,
  AlertTriangle,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Loader2,
  Wallet,
  Activity,
  History
} from "lucide-react";
import type { DashboardData } from "@/types/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-[#F2A971]/20 rounded-full animate-ping" />
          <Loader2 className="h-10 w-10 animate-spin text-[#F2A971]" />
        </div>
      </div>
    );
  }

  const hasScans = data?.latest_scan !== null;
  const scanQuota = data?.quota.scans ?? { used: 0, limit: 3 };
  const scamQuota = data?.quota.scam_checks ?? { used: 0, limit: 5 };
  const healthScore = data?.latest_scan?.health_score ?? 0;
  
  const savingsRate = data?.latest_scan?.savings_rate ? `${data.latest_scan.savings_rate}%` : "—";
  const debtRatio = data?.latest_scan?.debt_to_income_ratio ? `${data.latest_scan.debt_to_income_ratio}%` : "—";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Overview</h1>
          <p className="mt-2 text-white/50 text-lg">
            Pantau AI Health Score dan aktivitas keamananmu hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/scan">
            <Button className="bg-[#F2A971] text-[#0B0A08] hover:bg-[#F2A971]/90 font-bold rounded-xl shadow-[0_0_20px_rgba(242,169,113,0.3)]">
              <Scan className="w-4 h-4 mr-2" /> Mulai Scan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hero Card: AI Health Score (Spans 2 columns on lg) */}
        <Card className="lg:col-span-2 bg-[#1A1D24]/80 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#F2A971]/10 blur-[100px] rounded-full pointer-events-none transition-transform group-hover:scale-150 duration-700" />
          <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-10">
            {/* Circular Donut Chart Widget */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-[#F2A971] rounded-full blur-2xl opacity-20" />
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#0B0A08" strokeWidth="6" fill="transparent" />
                {/* Foreground Progress Circle */}
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke="#F2A971" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray="283" 
                  strokeDashoffset={hasScans ? 283 - (283 * healthScore) / 100 : 283} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(242,169,113,0.8)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black tracking-tighter text-white">
                  {hasScans ? healthScore : "--"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#F2A971] font-bold mt-1">
                  Health Score
                </span>
              </div>
            </div>

            {/* AI Summary Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2A971]/10 border border-[#F2A971]/20 text-[#F2A971] text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> AI Analysis Active
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {hasScans ? (healthScore >= 70 ? "Keuangan Anda Sehat" : "Perlu Perhatian Khusus") : "Belum Ada Data"}
              </h2>
              <p className="text-white/60 leading-relaxed max-w-md">
                {hasScans 
                  ? "Tidak terdeteksi adanya indikasi aktivitas pinjaman online predator atau transaksi perjudian online dalam 30 hari terakhir."
                  : "Upload mutasi bank Anda untuk mendapatkan laporan instan tentang kesehatan finansial dan deteksi anomali."}
              </p>
              
              {!hasScans && (
                <Link href="/dashboard/scan" className="mt-6 inline-flex items-center text-[#F2A971] text-sm font-semibold hover:text-amber-400 group/link">
                  Scan sekarang <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Column (Spans 1 column on lg) - Scam Checks & Tier */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1 bg-gradient-to-br from-[#1A1D24] to-[#0B0A08] border-white/5 rounded-[2rem] p-6 hover:border-red-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <Badge variant="outline" className="border-white/10 text-white/50">Bulan Ini</Badge>
            </div>
            <h3 className="text-3xl font-black text-white mb-1">{data?.scam_checks_count ?? 0}</h3>
            <p className="text-white/50 text-sm font-medium mb-4">Link Bodong Dicek</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${(scamQuota.used / scamQuota.limit) * 100}%` }} 
              />
            </div>
            <p className="mt-2 text-xs text-white/40 text-right">{scamQuota.limit - scamQuota.used} sisa kuota</p>
          </Card>

          <Card className="flex-1 bg-gradient-to-br from-[#3323D2]/10 to-[#1A1D24] border-[#3323D2]/20 rounded-[2rem] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#3323D2]/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#8B7DFF]" />
              </div>
              <Badge className="bg-[#3323D2] text-white border-none capitalize">{data?.user.subscription ?? "Free Plan"}</Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">SafeWallet Pro</h3>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">
              Dapatkan akses unlimited AI analysis dan Saku Bot.
            </p>
            <Button variant="outline" className="w-full rounded-xl border-white/10 text-white hover:bg-white/5">
              Upgrade Sekarang
            </Button>
          </Card>
        </div>

        {/* Mini Cards Row (2x2 Grid conceptually, here placing them in the remaining flow) */}
        <Card className="bg-[#1A1D24]/60 backdrop-blur-xl border-white/5 rounded-[2rem] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white/70 font-medium">Savings Rate</h3>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{savingsRate}</p>
            <p className="text-xs text-white/40 mt-1">Dari total pendapatan</p>
          </div>
        </Card>

        <Card className="bg-[#1A1D24]/60 backdrop-blur-xl border-white/5 rounded-[2rem] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-white/70 font-medium">Debt Ratio</h3>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{debtRatio}</p>
            <p className="text-xs text-white/40 mt-1">Aman di bawah 30%</p>
          </div>
        </Card>

        {/* Quick Scan History shortcut */}
        <Card className="bg-[#1A1D24]/60 backdrop-blur-xl border-white/5 rounded-[2rem] p-6 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <History className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-white font-bold">Riwayat Scan</h3>
              <p className="text-sm text-white/40">Lihat data historis analisis</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#F2A971] group-hover:translate-x-1 transition-all" />
        </Card>
      </div>
    </div>
  );
}
