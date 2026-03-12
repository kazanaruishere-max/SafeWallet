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
} from "lucide-react";
import type { ScanResult } from "@/types/api";

type ScanState = "idle" | "uploading" | "ocr" | "analyzing" | "done" | "error";

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // FIX C4: Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPEG/PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimum 5MB.");
      return;
    }

    setError(null);
    // FIX C4: Revoke previous URL before creating new one
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    // FIX F2: Real OCR with Tesseract.js
    setState("ocr");
    setOcrProgress(0);

    let ocrText: string;
    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("ind+eng", undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      ocrText = data.text;
      await worker.terminate();

      if (!ocrText || ocrText.trim().length < 20) {
        setError(
          "Tidak dapat membaca teks dari gambar. Pastikan foto jelas dan berisi mutasi bank."
        );
        setState("error");
        return;
      }
    } catch (ocrError) {
      console.error("OCR failed:", ocrError);
      setError("Gagal membaca teks dari gambar. Coba lagi dengan foto yang lebih jelas.");
      setState("error");
      return;
    }

    // Step 2: AI Analysis
    setState("analyzing");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("ocr_text", ocrText);

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

      // Show new badges notification
      if (json.meta?.new_badges?.length > 0) {
        // Could use toast here
        console.log("New badges earned:", json.meta.new_badges);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Health Scanner</h1>
        <p className="mt-1 text-muted-foreground">
          Upload foto mutasi bank untuk analisis kesehatan keuangan AI.
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
                  accept="image/jpeg,image/png"
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
                  Drop foto mutasi bank di sini
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  JPEG atau PNG, maksimum 5MB
                </p>
                <Button className="mt-6 gradient-primary text-white">
                  <FileImage className="mr-2 h-4 w-4" /> Pilih File
                </Button>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["BCA", "BRI", "Mandiri", "BNI", "Dana", "OVO", "GoPay"].map(
                    (bank) => (
                      <Badge key={bank} variant="secondary" className="text-xs">
                        {bank}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
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

          {/* How it works — FIX F5: Corrected "Claude" to "Gemini" */}
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
                    desc: "Foto mutasi bank (screenshot)",
                  },
                  {
                    step: "2",
                    title: "OCR + AI",
                    desc: "Teks diekstrak Tesseract.js & dianalisis Gemini AI",
                  },
                  {
                    step: "3",
                    title: "Hasil",
                    desc: "Skor 0-100, kategori, rekomendasi",
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
              <Badge
                variant="secondary"
                className="mt-3"
              >
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
                    const pct = Math.round((amount / total) * 100);
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

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setState("idle");
              setResult(null);
              setPreview(null);
            }}
          >
            <Scan className="mr-2 h-4 w-4" /> Scan Lagi
          </Button>
        </div>
      ) : (
        /* ===== PROCESSING ===== */
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mb-6 h-32 rounded-lg object-cover opacity-60"
              />
            )}
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold">
              {state === "uploading"
                ? "Mengupload..."
                : state === "ocr"
                  ? `Membaca teks dari gambar (OCR)... ${ocrProgress}%`
                  : "Menganalisis dengan Gemini AI..."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {state === "ocr"
                ? "Tesseract.js sedang memproses gambar"
                : "Ini mungkin memakan waktu 5-10 detik"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
