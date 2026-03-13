import Link from "next/link";
import { Shield, Sparkles, TrendingUp, AlertTriangle, ArrowRight, Scan, Lock, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#101218] text-white font-sans selection:bg-[#00E573]/30">
      {/* Navigation Bar */}
      <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-[#101218]/50 border-b border-white/5">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00E573] to-emerald-600 shadow-[0_0_15px_rgba(0,229,115,0.4)] transition-transform group-hover:scale-105">
              <Shield className="h-6 w-6 text-[#101218]" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/90">SafeWallet</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 rounded-full px-6">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#00E573] text-[#101218] hover:bg-[#00E573]/90 rounded-full px-8 font-semibold shadow-[0_4px_14px_0_rgba(0,229,115,0.39)] hover:shadow-[0_6px_20px_rgba(0,229,115,0.23)] hover:-translate-y-0.5 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-32 text-center overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3323D2]/30 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#00E573]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 container mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#00E573]" />
              <span className="text-sm font-medium text-white/80">SaaS Finansial AI #1 di Indonesia</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">AI Guardian untuk </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E573] to-emerald-400 drop-shadow-[0_0_30px_rgba(0,229,115,0.3)]">Uangmu</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mb-12 leading-relaxed">
              Deteksi mutasi pinjol, judi online, dan dapatkan saran finansial personal dengan kecerdasan buatan.
            </p>
            
            <Link href="/signup">
              <Button className="h-16 px-10 rounded-full bg-[#00E573] text-[#101218] text-lg font-bold shadow-[0_0_40px_rgba(0,229,115,0.4)] hover:shadow-[0_0_60px_rgba(0,229,115,0.6)] hover:-translate-y-1 transition-all duration-300">
                Mulai Perjalanan Finansialmu
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* 3D Glassmorphism Mockup Card */}
          <div className="relative mt-24 max-w-5xl mx-auto perspective-[2000px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#3323D2]/40 to-transparent blur-[80px] -z-10" />
            <div className="w-full rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl p-2 md:p-4 transform rotateX-[10deg] hover:rotate-[0deg] transition-transform duration-700 ease-out">
              <div className="w-full aspect-[16/9] rounded-[2rem] bg-[#101218]/80 border border-white/5 overflow-hidden relative flex flex-col">
                {/* Mockup Top Bar */}
                <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-[#00E573]/50" />
                </div>
                {/* Mockup Content */}
                <div className="flex-1 p-8 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,115,0.1)_0%,transparent_70%)]" />
                  <div className="text-center z-10">
                    <div className="w-24 h-24 rounded-full border-4 border-[#00E573] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,229,115,0.3)]">
                      <span className="text-3xl font-bold text-[#00E573]">85</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white/90 mb-2">Health Score: Sehat</h3>
                    <p className="text-white/50">Tidak ada indikasi transaksi Pinjol atau Judol.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Box */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Judol Tracker */}
            <Card className="bg-[#1A1D24] border-white/10 hover:border-red-500/30 transition-colors rounded-3xl overflow-hidden group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-3">Judol Tracker</CardTitle>
                <p className="text-white/60 leading-relaxed">
                  Deteksi otomatis transaksi mencurigakan ke platform judi online dari riwayat mutasi bank Anda.
                </p>
              </CardHeader>
            </Card>

            {/* Pinjol Rescue */}
            <Card className="bg-[#1A1D24] border-white/10 hover:border-[#FA9B0A]/30 transition-colors rounded-3xl overflow-hidden group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#FA9B0A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-[#FA9B0A]" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-3">Pinjol Rescue</CardTitle>
                <p className="text-white/60 leading-relaxed">
                  Analisis rasio hutang (DTI) dan modul edukasi darurat untuk membebaskan Anda dari jerat pinjaman online predator.
                </p>
              </CardHeader>
            </Card>

            {/* Side-Hustle Matchmaker */}
            <Card className="bg-[#1A1D24] border-white/10 hover:border-[#3323D2]/30 transition-colors rounded-3xl overflow-hidden group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#3323D2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-[#8B7DFF]" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-3">Side-Hustle Matchmaker</CardTitle>
                <p className="text-white/60 leading-relaxed">
                  Rekomendasi pekerjaan sampingan cerdas berbasis AI jika gaji Anda di bawah UMR daerah.
                </p>
              </CardHeader>
            </Card>

          </div>
        </section>
      </main>

      {/* Footer Minimalist */}
      <footer className="border-t border-white/5 py-12 bg-[#101218]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00E573]" />
            <span className="font-bold text-white/50">SafeWallet © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
