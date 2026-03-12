"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Search,
  Link2,
  FileImage,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ScamCheckResult } from "@/types/api";

export default function ScamPage() {
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (inputType: "text" | "url", content: string) => {
    if (content.trim().length < 10) {
      setError("Konten minimal 10 karakter.");
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
        setError(json.error?.message ?? "Gagal menganalisis.");
      } else {
        setResult(json.data as ScamCheckResult);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "SAFE":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: <CheckCircle2 className="h-8 w-8 text-emerald-600" />,
          label: "✅ AMAN",
        };
      case "CAUTION":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
          label: "⚠️ HATI-HATI",
        };
      default:
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          label: "🚨 BERBAHAYA",
        };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Scam Detector</h1>
        <p className="mt-1 text-muted-foreground">
          Verifikasi investasi sebelum kamu menyesal. Cek pola penipuan dan lisensi OJK.
        </p>
      </div>

      {/* Input */}
      {!result && (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">
                  <Search className="mr-1.5 h-3.5 w-3.5" /> Teks
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Link2 className="mr-1.5 h-3.5 w-3.5" /> URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Deskripsi Investasi</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder='Contoh: "Investasi return 15% per bulan, PASTI UNTUNG, modal 1 juta bisa dapat 10 juta..."'
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Perusahaan (opsional)</Label>
                  <Input
                    placeholder="PT Example Indonesia"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full gradient-primary text-white h-11"
                  disabled={loading}
                  onClick={() => handleSubmit("text", textInput)}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Menganalisis..." : "Analisis Risiko"}
                </Button>
              </TabsContent>

              <TabsContent value="url" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>URL Website Investasi</Label>
                  <Input
                    placeholder="https://example.com/investasi"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full gradient-primary text-white h-11"
                  disabled={loading}
                  onClick={() => handleSubmit("url", urlInput)}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Scanning URL..." : "Scan URL"}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Verdict */}
          {(() => {
            const style = getVerdictStyle(result.verdict);
            return (
              <Card className={`${style.border} ${style.bg}`}>
                <CardContent className="flex flex-col items-center py-8">
                  {style.icon}
                  <p className={`mt-3 text-2xl font-bold ${style.text}`}>
                    {style.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Risk Score: <strong>{result.risk_score}/100</strong> | Confidence:{" "}
                    <strong>{result.confidence}</strong>
                  </p>
                </CardContent>
              </Card>
            );
          })()}

          {/* OJK Status */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status OJK</p>
                <p className="text-xs text-muted-foreground">
                  {result.ojk_status.registered
                    ? "✅ Terdaftar di OJK"
                    : "❌ Tidak terdaftar di OJK"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          {result.red_flags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Red Flags Terdeteksi ({result.red_flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.red_flags.map((flag, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <Badge className={getSeverityColor(flag.severity)} variant="secondary">
                      {flag.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{flag.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flag.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Safe Alternatives */}
          {result.safe_alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Alternatif Investasi Aman
                </CardTitle>
                <CardDescription>
                  Investasi legal dengan return realistis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {result.safe_alternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm">{alt.name}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Return: {alt.return}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Risiko: {alt.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setResult(null);
              setTextInput("");
              setUrlInput("");
              setCompanyName("");
            }}
          >
            <Search className="mr-2 h-4 w-4" /> Cek Lagi
          </Button>
        </div>
      )}

      {/* Red Flags Reference (only when no result) */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Red Flags yang Kami Deteksi
            </CardTitle>
            <CardDescription>
              Pola umum investasi bodong di Indonesia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Return >2% per bulan (>24% per tahun)",
                'Menjanjikan "pasti untung" tanpa risiko',
                "Tidak terdaftar di OJK",
                "Sistem referral/MLM yang agresif",
                "Tekanan untuk segera bergabung",
                "Domain website berumur <3 bulan",
              ].map((flag) => (
                <div
                  key={flag}
                  className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <p className="text-sm">{flag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
