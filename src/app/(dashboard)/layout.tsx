"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  LayoutDashboard,
  Scan,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  CreditCard,
  History,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/scan", label: "Health Scanner", icon: Scan },
  { href: "/dashboard/scam", label: "Scam Checker", icon: AlertTriangle },
  { href: "/dashboard/history", label: "Riwayat Scan", icon: History },
  { href: "/dashboard/profile", label: "Profil Pengguna", icon: User },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/") && item.href !== "/dashboard";
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
              isActive
                ? "bg-[#F2A971]/10 text-[#F2A971]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive ? "text-[#F2A971]" : "text-white/40 group-hover:text-white/80 transition-colors")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#0B0A08] text-white selection:bg-[#F2A971]/30 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 border-r border-white/5 bg-[#0B0A08] lg:flex lg:flex-col relative z-20">
        {/* Glow behind sidebar */}
        <div className="absolute top-0 right-0 w-full h-32 bg-[#F2A971]/5 blur-[60px] pointer-events-none" />
        
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2A971] to-amber-600 shadow-[0_0_15px_rgba(242,169,113,0.4)]">
            <Shield className="h-6 w-6 text-[#0B0A08]" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white/90">SafeWallet</span>
        </div>

        <div className="px-6 py-2">
          <div className="h-px w-full bg-white/5" />
        </div>

        {/* Nav */}
        <div className="flex-1 py-4">
          <div className="px-6 mb-4 text-xs font-semibold text-white/30 tracking-wider uppercase">Menu Utama</div>
          <SidebarNav />
        </div>

        {/* Upgrade CTA Glassmorphism */}
        <div className="p-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#1A1D24] border border-white/10 p-5 group hover:border-[#3323D2]/50 transition-colors">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#3323D2]/30 blur-[40px] rounded-full pointer-events-none group-hover:bg-[#3323D2]/50 transition-colors" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#8B7DFF]" />
              <p className="text-sm font-bold text-white/90">Upgrade Premium</p>
            </div>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Unlimited scan, deteksi scam tanpa henti & AI coaching.
            </p>
            <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/5 h-9 rounded-xl text-xs transition-colors">
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              Mulai Rp 29K/bln
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#0B0A08]/80 backdrop-blur-xl px-6 lg:px-10">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 h-10 w-10 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-[#0B0A08] border-r border-white/5 text-white">
                <div className="flex h-20 items-center gap-3 px-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2A971] to-amber-600">
                    <Shield className="h-6 w-6 text-[#0B0A08]" fill="currentColor" />
                  </div>
                  <span className="text-xl font-bold">SafeWallet</span>
                </div>
                <div className="px-6 py-2"><div className="h-px w-full bg-white/5" /></div>
                <div className="py-4">
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:block">
            {/* Optional breadcrumbs or page title could go here */}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full outline-none ring-2 ring-transparent focus-visible:ring-[#F2A971] transition-all">
                <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                  <AvatarFallback className="bg-[#1A1D24] text-[#F2A971] text-sm font-bold">
                    SW
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#1A1D24] border border-white/10 rounded-2xl shadow-2xl text-white">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white/90">Akun Anda</p>
                  <p className="text-xs text-white/50 truncate">User SafeWallet</p>
                </div>
                <div className="p-2">
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer rounded-xl focus:bg-white/10 focus:text-white px-3 py-2.5">
                    <User className="mr-3 h-4 w-4 text-white/50" /> Profil Pengguna
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl focus:bg-red-500/20 focus:text-red-400 px-3 py-2.5 text-red-400">
                    <LogOut className="mr-3 h-4 w-4" /> Keluar
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-10 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
