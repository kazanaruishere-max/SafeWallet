import Link from "next/link";
import {
  Shield,
  Scan,
  Bot,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SafeWallet</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cara Kerja
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Harga
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gradient-primary text-white shadow-lg hover:opacity-90 transition-opacity">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI-Powered Financial Wellness
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Jaga Keuanganmu
            <br />
            <span className="gradient-text">dengan Kekuatan AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Cek kesehatan keuangan, deteksi investasi bodong, dan dapatkan coaching personal.
            Gratis untuk 270 juta rakyat Indonesia.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gradient-primary text-white shadow-xl hover:opacity-90 transition-all px-8 text-base">
                Mulai Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Lihat Demo
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> Gratis selamanya
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> Tanpa kartu kredit
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> Data aman 100%
            </div>
          </div>
        </div>
      </section>

      {/* Problem Stats */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "70%", label: "Tanpa dana darurat" },
              { value: "41%", label: "APR paylater tersembunyi" },
              { value: "Rp 100T+", label: "Kerugian investasi bodong" },
              { value: "64%", label: "Literasi keuangan rendah" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text md:text-4xl">{stat.value}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Tiga Pilar Pelindung Keuanganmu</h2>
            <p className="mt-4 text-muted-foreground">Powered by AI, dirancang untuk Indonesia</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Health Scanner */}
            <Card className="group relative overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
              <CardHeader className="relative pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Scan className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Health Scanner</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground">
                  Upload foto mutasi bank → AI analisis pengeluaran → skor kesehatan keuangan 0-100 + rekomendasi personal.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Analisis &lt;8 detik</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Support BCA, BRI, Mandiri, BNI</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Privasi: foto tidak disimpan</li>
                </ul>
              </CardContent>
            </Card>

            {/* Scam Detector */}
            <Card className="group relative overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <CardHeader className="relative pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Scam Detector</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground">
                  Kirim screenshot/link investasi → cek lisensi OJK → deteksi pola penipuan → skor risiko + alternatif aman.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-500" /> Verifikasi OJK otomatis</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-500" /> Deteksi Ponzi, MLM, forex bodong</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-red-500" /> Saran investasi aman</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Coach */}
            <Card className="group relative overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
              <CardHeader className="relative pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-xl">AI Coach</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground">
                  Coaching keuangan harian via WhatsApp — tips personal, tantangan menabung, dan perayaan milestone.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-blue-500" /> WhatsApp setiap jam 7 pagi</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-blue-500" /> Badges & leaderboard</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-blue-500" /> Personalisasi berdasarkan data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Cara Kerja</h2>
            <p className="mt-4 text-muted-foreground">3 langkah sederhana, hasil instant</p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              { step: "1", title: "Upload / Input", desc: "Foto mutasi bank atau screenshot investasi mencurigakan", icon: TrendingUp },
              { step: "2", title: "AI Analisis", desc: "OCR + Claude AI membaca, mengkategorikan, dan menganalisis", icon: Sparkles },
              { step: "3", title: "Dapat Hasil", desc: "Skor kesehatan/risiko + rekomendasi konkret dalam <8 detik", icon: Shield },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Harga Transparan</h2>
            <p className="mt-4 text-muted-foreground">Mulai gratis, upgrade kapan saja</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="relative border-2">
              <CardHeader>
                <CardTitle className="text-lg">Gratis</CardTitle>
                <p className="text-3xl font-bold">Rp 0<span className="text-sm font-normal text-muted-foreground">/bulan</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 3 scan keuangan/bulan</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 5 cek scam/bulan</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Dashboard dasar</li>
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button variant="outline" className="w-full">Mulai Gratis</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="relative border-2 border-primary shadow-xl scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-white px-3 py-1">
                  <Star className="mr-1 h-3 w-3" /> Populer
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Premium</CardTitle>
                <p className="text-3xl font-bold">Rp 29K<span className="text-sm font-normal text-muted-foreground">/bulan</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited scan & cek scam</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> WhatsApp AI coach harian</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Gamifikasi & badges</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Prioritas AI analysis</li>
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button className="w-full gradient-primary text-white">Upgrade Premium</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Family */}
            <Card className="relative border-2">
              <CardHeader>
                <CardTitle className="text-lg">Keluarga</CardTitle>
                <p className="text-3xl font-bold">Rp 79K<span className="text-sm font-normal text-muted-foreground">/bulan</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 5 anggota keluarga</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Semua fitur Premium</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Dashboard keluarga</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Target menabung bersama</li>
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button variant="outline" className="w-full">Pilih Keluarga</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl gradient-primary p-12 text-white shadow-2xl">
            <h2 className="text-3xl font-bold">Mulai Lindungi Keuanganmu</h2>
            <p className="mt-4 text-white/80">
              Bergabung dengan ribuan orang Indonesia yang sudah menjaga kesehatan keuangan mereka dengan AI.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="mt-8 px-8 text-base font-semibold">
                Daftar Gratis Sekarang <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SafeWallet</span>
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Tentang</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privasi</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Syarat</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Kontak</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2026 SafeWallet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
