"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Scan,
  FileImage,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";
import type { ScanResult } from "@/types/api";
import {
  parseFile,
  getFileFormat,
  getSupportedExtensions,
  getFormatLabel,
  type ParsedFile,
} from "@/lib/file-parser";

type ScanState = "idle" | "parsing" | "analyzing" | "done" | "error";

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<ParsedFile["format"] | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(async (file: File) => {
    const format = getFileFormat(file);
    if (!format) {
      setError(
        "Format tidak didukung. Gunakan: JPEG, PNG, PDF, Excel (.xlsx/.xls), CSV, atau TXT."
      );
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimum 20MB.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileFormat(format);

    // Set preview for images only
    if (format === "image") {
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } else {
      setPreview(null);
    }

    // Step 1: Parse file
    setState("parsing");
    setProgress(0);

    let parsedText: string;
    try {
      const parsed = await parseFile(file, (p, msg) => {
        setProgress(p);
        setProgressMsg(msg);
      });
      parsedText = parsed.text;
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Gagal membaca file. Coba format lain."
      );
      setState("error");
      return;
    }

    // Step 2: AI Analysis
    setState("analyzing");
    setProgress(0);
    setProgressMsg("Menganalisis dengan Gemini AI...");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("ocr_text", parsedText);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Gagal menganalisis. Coba lagi.");
        setState("error");
        return;
      }

      setResult(json.data as ScanResult);
      setState("done");
    } catch {
      setError("Gagal terhubung ke server.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getFormatIcon = (fmt: ParsedFile["format"] | null) => {
    switch (fmt) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
      case "csv":
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
      case "text":
        return <File className="h-5 w-5 text-gray-500" />;
      default:
        return <FileImage className="h-5 w-5 text-primary" />;
    }
  };

  const resetScan = () => {
    setState("idle");
    setResult(null);
    setPreview(null);
    setFileName(null);
    setFileFormat(null);
    setProgress(0);
    setProgressMsg("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Health Scanner</h1>
        <p className="mt-1 text-muted-foreground">
          Upload mutasi bank untuk analisis kesehatan keuangan AI.
        </p>
      </div>

      {/* Upload / Processing / Result */}
      {state === "idle" || state === "error" ? (
        <>
          <Card>
            <CardContent className="p-8">
              <div
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-12 transition-colors hover:border-primary/40 hover:bg-primary/10 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={getSupportedExtensions()}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Drop file mutasi bank di sini
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Mendukung gambar, PDF, Excel, CSV, dan teks — maks 20MB
                </p>
                <Button className="mt-6 gradient-primary text-white">
                  <FileImage className="mr-2 h-4 w-4" /> Pilih File
                </Button>

                {/* Supported formats */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    { label: "JPEG/PNG", icon: "🖼️" },
                    { label: "PDF", icon: "📄" },
                    { label: "Excel", icon: "📊" },
                    { label: "CSV", icon: "📋" },
                    { label: "TXT", icon: "📝" },
                  ].map((fmt) => (
                    <Badge key={fmt.label} variant="secondary" className="text-xs">
                      {fmt.icon} {fmt.label}
                    </Badge>
                  ))}
                </div>

                {/* Bank logos */}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {["BCA", "BRI", "Mandiri", "BNI", "Dana", "OVO", "GoPay"].map(
                    (bank) => (
                      <span
                        key={bank}
                        className="text-[10px] text-muted-foreground/60"
                      >
                        {bank}
                      </span>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto shrink-0"
                  onClick={() => {
                    setError(null);
                    setState("idle");
                  }}
                >
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          )}

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cara Kerja</CardTitle>
              <CardDescription>Proses analisis dalam 3 langkah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: "1",
                    title: "Upload",
                    desc: "Foto, PDF e-statement, atau Excel mutasi bank",
                  },
                  {
                    step: "2",
                    title: "Parsing + AI",
                    desc: "Teks diekstrak otomatis & dianalisis Gemini AI",
                  },
                  {
                    step: "3",
                    title: "Hasil",
                    desc: "Skor 0-100, kategori pengeluaran, rekomendasi",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : state === "done" && result ? (
        /* ===== RESULTS ===== */
        <div className="space-y-6">
          {/* Score */}
          <Card className="overflow-hidden">
            <div className={`h-2 ${getScoreBg(result.health_score)}`} />
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p
                className={`text-6xl font-bold mt-2 ${getScoreColor(
                  result.health_score
                )}`}
              >
                {result.health_score}
              </p>
              <p className="text-sm text-muted-foreground mt-1">dari 100</p>
              <Badge variant="secondary" className="mt-3">
                {result.health_score >= 80
                  ? "🟢 Sehat"
                  : result.health_score >= 50
                    ? "🟡 Perlu Perhatian"
                    : "🔴 Butuh Perbaikan"}
              </Badge>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Breakdown Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(result.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const total = Object.values(result.categories).reduce(
                      (s, v) => s + v,
                      0
                    );
                    const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category}</span>
                          <span className="font-medium">
                            Rp {amount.toLocaleString("id-ID")} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full gradient-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {Math.round(result.savings_rate * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.savings_rate >= 0.2
                    ? "✅ Excellent"
                    : result.savings_rate >= 0.1
                      ? "⚠️ Good, bisa ditingkatkan"
                      : "❌ Terlalu rendah"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Debt-to-Income</p>
                <p className="text-2xl font-bold mt-1">
                  {Math.round(result.debt_to_income_ratio * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.debt_to_income_ratio < 0.3
                    ? "✅ Sehat"
                    : result.debt_to_income_ratio < 0.5
                      ? "⚠️ Hati-hati"
                      : "❌ Berbahaya"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Rekomendasi AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-primary/5 p-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Peringatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={resetScan}>
            <Scan className="mr-2 h-4 w-4" /> Scan Lagi
          </Button>
        </div>
      ) : (
        /* ===== PROCESSING ===== */
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            {/* File info */}
            <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-muted">
              {getFormatIcon(fileFormat)}
              <span className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </span>
              {fileFormat && (
                <Badge variant="secondary" className="text-[10px]">
                  {getFormatLabel(fileFormat)}
                </Badge>
              )}
            </div>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mb-6 h-32 rounded-lg object-cover opacity-60"
              />
            )}

            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold">
              {state === "parsing"
                ? progressMsg || "Membaca file..."
                : "Menganalisis dengan Gemini AI..."}
            </p>

            {/* Progress bar */}
            {state === "parsing" && (
              <div className="mt-4 w-full max-w-xs">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-center text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}

            <p className="mt-2 text-sm text-muted-foreground">
              {state === "parsing"
                ? "Mengekstrak data dari file"
                : "Ini mungkin memakan waktu 5-10 detik"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
