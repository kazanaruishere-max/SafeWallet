import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-7xl font-bold gradient-text">404</p>
        <h1 className="mt-4 text-2xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="mt-3 text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/">
            <Button className="gradient-primary text-white">
              <Home className="mr-2 h-4 w-4" /> Ke Beranda
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
