import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="mt-1 text-muted-foreground">
          Kelola informasi profil dan preferensi kamu.
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled placeholder="user@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Nomor WhatsApp (opsional)</Label>
            <Input placeholder="+6281234567890" />
          </div>
          <div className="space-y-2">
            <Label>Pendapatan Bulanan</Label>
            <Input type="number" placeholder="5000000" />
            <p className="text-xs text-muted-foreground">
              Digunakan untuk menghitung rasio utang dan saran saving rate.
            </p>
          </div>
          <Button className="gradient-primary text-white">Simpan Perubahan</Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" /> Langganan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Paket Saat Ini</p>
              <Badge variant="secondary" className="mt-1">Free</Badge>
            </div>
            <Button variant="outline">Upgrade Premium</Button>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📊 Scan tersisa bulan ini: <strong>3 / 3</strong></p>
            <p>🛡️ Cek scam tersisa bulan ini: <strong>5 / 5</strong></p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> Keamanan & Privasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Ekspor Data Saya</span>
            <Button variant="outline" size="sm">Download</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-destructive">Hapus Akun</span>
            <Button variant="destructive" size="sm">Hapus</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sesuai UU PDP, kamu berhak mengakses, mengunduh, dan menghapus semua data pribadimu kapan saja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
