"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Terjadi Kesalahan</h1>
        <p className="mt-3 text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami sedang menyelidiki masalah ini.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
          <Link href="/">
            <Button className="gradient-primary text-white">
              <Home className="mr-2 h-4 w-4" /> Ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
