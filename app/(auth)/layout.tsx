import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 gradient-primary lg:flex lg:flex-col lg:justify-between p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">SafeWallet</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Jaga keuanganmu
            <br />
            dari jerat utang &
            <br />
            investasi bodong.
          </h2>
          <p className="mt-4 text-white/70">
            Platform AI gratis untuk 270 juta rakyat Indonesia.
          </p>
        </div>
        <p className="text-sm text-white/50">
          © 2026 SafeWallet
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SafeWallet</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
