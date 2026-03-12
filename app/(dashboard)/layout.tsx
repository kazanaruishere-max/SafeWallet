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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/scan", label: "Health Scanner", icon: Scan },
  { href: "/dashboard/scam", label: "Scam Detector", icon: AlertTriangle },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
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
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-sidebar lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">SafeWallet</span>
        </div>

        <Separator />

        {/* Nav */}
        <div className="flex-1 py-4">
          <SidebarNav />
        </div>

        {/* Upgrade CTA */}
        <div className="p-4">
          <div className="rounded-xl bg-primary/5 p-4">
            <p className="text-sm font-medium">Upgrade ke Premium</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlimited scan & AI coaching
            </p>
            <Button size="sm" className="mt-3 w-full gradient-primary text-white text-xs">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Rp 29K/bulan
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 lg:px-8">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center gap-2 px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">SafeWallet</span>
                </div>
                <Separator />
                <div className="py-4">
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:block" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  SW
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
