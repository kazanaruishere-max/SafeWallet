import Link from "next/link";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-t from-[#1c1438] to-[#0B0A08] p-4 font-sans text-white selection:bg-[#F2A971]/30">
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-[#F2A971]/50 transition-colors">
            <Shield className="h-6 w-6 text-[#F2A971]" />
          </div>
          <span className="text-xl font-bold tracking-tight">SafeWallet</span>
        </Link>
      </div>
      <div className="absolute right-8 top-8 hidden md:block">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center md:hidden">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <Shield className="h-6 w-6 text-[#F2A971]" />
            </div>
            <span className="text-xl font-bold tracking-tight">SafeWallet</span>
          </Link>
        </div>
        <div className="mb-6 flex justify-center md:hidden">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </div>
  );
}
