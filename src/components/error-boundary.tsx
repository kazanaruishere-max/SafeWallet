"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global Error Boundary to catch runtime exceptions in the component tree.
 * Provides a graceful fallback UI and logs errors for debugging.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Integrate with Sentry or other logging service here if needed
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0A08] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan Sistem</h1>
          <p className="text-white/50 max-w-md mb-8">
            Aplikasi mengalami kendala teknis yang tidak terduga. Silakan muat ulang halaman atau hubungi dukungan jika masalah berlanjut.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#F2A971] text-[#0B0A08] hover:bg-[#F2A971]/90 rounded-full px-8 font-bold"
          >
            Muat Ulang Halaman
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
