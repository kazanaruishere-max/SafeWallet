"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Loader2,
  ArrowLeft,
  Scan,
} from "lucide-react";
import type { ScanHistoryItem } from "@/types/api";

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Sehat", variant: "default" as const };
    if (score >= 50) return { label: "Perhatian", variant: "secondary" as const };
    return { label: "Perbaiki", variant: "destructive" as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Riwayat Scan</h1>
          <p className="text-sm text-muted-foreground">
            {total} total scan
          </p>
        </div>
      </div>

      {scans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Scan className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Belum ada riwayat scan</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Upload foto mutasi bank untuk mendapatkan analisis pertamamu.
            </p>
            <Link href="/dashboard/scan">
              <Button className="mt-6 gradient-primary text-white">
                <Scan className="mr-2 h-4 w-4" /> Mulai Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {scans.map((scan, i) => {
              const badge = getScoreBadge(scan.health_score);
              const date = new Date(scan.created_at);
              const topCategories = Object.entries(scan.categories || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);

              return (
                <Card
                  key={scan.scan_id || i}
                  className="transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Score */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className={`text-3xl font-bold ${getScoreColor(scan.health_score)}`}>
                          {scan.health_score}
                        </span>
                        <Badge variant={badge.variant} className="mt-1 text-[10px]">
                          {badge.label}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>

                        {/* Top categories */}
                        {topCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {topCategories.map(([cat, amount]) => (
                              <span
                                key={cat}
                                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {cat}: Rp {(amount as number).toLocaleString("id-ID")}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Top recommendation */}
                        {scan.recommendations?.[0] && (
                          <p className="mt-1.5 text-xs text-muted-foreground truncate">
                            💡 {scan.recommendations[0]}
                          </p>
                        )}
                      </div>

                      {/* Trend arrow */}
                      <TrendingUp
                        className={`h-5 w-5 shrink-0 ${getScoreColor(scan.health_score)}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {page} / {Math.ceil(total / 10)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 10)}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
