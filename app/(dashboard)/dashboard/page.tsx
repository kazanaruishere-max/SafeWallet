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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasScans = data?.latest_scan !== null;
  const scanQuota = data?.quota.scans ?? { used: 0, limit: 3 };
  const scamQuota = data?.quota.scam_checks ?? { used: 0, limit: 5 };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Selamat datang di SafeWallet 👋</h1>
        <p className="mt-1 text-muted-foreground">
          Pantau kesehatan keuanganmu dan lindungi dari penipuan.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardContent className="relative flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Scan className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Cek Kesehatan Keuangan</h3>
              <p className="text-sm text-muted-foreground">
                Upload mutasi bank untuk analisis AI
              </p>
            </div>
            <Link href="/dashboard/scan">
              <Button size="sm" className="gradient-primary text-white">
                Scan <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardContent className="relative flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Cek Investasi</h3>
              <p className="text-sm text-muted-foreground">
                Verifikasi apakah investasi aman atau bodong
              </p>
            </div>
            <Link href="/dashboard/scam">
              <Button size="sm" variant="outline">
                Cek <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Health Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data?.latest_scan ? data.latest_scan.health_score : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data?.latest_scan ? "Dari scan terakhir" : "Belum ada scan"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scam Dicek
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.scam_checks_count ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total pengecekan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges
            </CardTitle>
            <Award className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.badges.length ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Badge yang didapat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tier
            </CardTitle>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">
              {data?.user.subscription ?? "Free"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {scanQuota.limit - scanQuota.used} scan tersisa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend (if has data) */}
      {data?.scan_trend && data.scan_trend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trend Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {data.scan_trend.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{score}</span>
                  <div
                    className="w-full rounded-t-md gradient-primary transition-all"
                    style={{ height: `${(score / 100) * 80}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Scan {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State / Quota Info */}
      {!hasScans ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-float">
              <Scan className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Mulai Scan Pertamamu</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Upload foto mutasi bank untuk mendapatkan health score dan rekomendasi AI
              personal.
            </p>
            <Link href="/dashboard/scan">
              <Button className="mt-6 gradient-primary text-white">
                <Scan className="mr-2 h-4 w-4" /> Mulai Scan
              </Button>
            </Link>
            <Badge variant="secondary" className="mt-4">
              {scanQuota.limit - scanQuota.used} scan gratis tersisa bulan ini
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Kuota bulan ini</span>
              <span>
                📊 Scan: <strong>{scanQuota.used}/{scanQuota.limit}</strong> |
                🛡️ Scam: <strong>{scamQuota.used}/{scamQuota.limit}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
