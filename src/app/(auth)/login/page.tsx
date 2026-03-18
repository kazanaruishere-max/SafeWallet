"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2, AlertCircle } from "lucide-react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const authError = searchParams.get("error");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast.success("Magic link terkirim! Cek email kamu.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mengirim magic link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal login dengan Google";
      toast.error(message);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="w-full rounded-[2rem] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#F2A971]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(242,169,113,0.2)]">
          <Mail className="h-10 w-10 text-[#F2A971]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Cek Email Kamu</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Kami telah mengirimkan *magic link* rahasia ke <strong className="text-white">{email}</strong>.<br/>Klik tautan tersebut untuk masuk ke dalam Vault.
        </p>
        <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/5 rounded-xl h-12" onClick={() => setMagicLinkSent(false)}>
          Gunakan email lain
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[2.5rem] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl p-8 sm:p-12 relative overflow-hidden">
      {/* Ambient background glow for the card */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#F2A971]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#3323D2]/30 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Masuk ke Vault</h1>
          <p className="text-white/50">Gunakan email untuk masuk dengan aman</p>
        </div>

        {authError === "auth_failed" && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p>Akses ditolak atau sesi kedaluwarsa. Silakan coba lagi.</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div className="space-y-2 relative group">
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#F2A971] focus-visible:border-[#F2A971] transition-all px-5 text-lg"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-[#F2A971] text-[#0B0A08] font-bold text-lg shadow-[0_0_20px_rgba(242,169,113,0.3)] hover:shadow-[0_0_30px_rgba(242,169,113,0.5)] hover:bg-[#F2A971]/90 hover:-translate-y-0.5 transition-all" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Membuka Vault...</>
              ) : (
                <><Mail className="mr-2 h-5 w-5" /> Kirim Magic Link</>
              )}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 px-4 text-white/30 text-sm">Atau</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google OAuth */}
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all text-base" 
            onClick={handleGoogleLogin}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#e8eaed" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#e8eaed" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#e8eaed" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#e8eaed" />
            </svg>
            Lanjutkan dengan Google
          </Button>

          <p className="text-center text-sm text-white/40 mt-6">
            Belum punya akun?{" "}
            <Link href="/signup" className="text-[#F2A971] hover:text-amber-400 hover:underline font-medium transition-colors">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#F2A971]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
