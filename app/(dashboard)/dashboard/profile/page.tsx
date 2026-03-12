"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Shield, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ProfileData = {
  email: string;
  phone: string | null;
  monthly_income: number | null;
  subscription_tier: string;
  onboarding_completed: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [income, setIncome] = useState("");
  const [quotaData, setQuotaData] = useState<{
    scans: { used: number; limit: number };
    scam_checks: { used: number; limit: number };
  } | null>(null);

  // Fetch profile + quota on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()),
      fetch("/api/user/dashboard").then((r) => r.json()),
    ])
      .then(([profileRes, dashRes]) => {
        if (profileRes.success) {
          const p = profileRes.data;
          setProfile(p);
          setPhone(p.phone ?? "");
          setIncome(p.monthly_income?.toString() ?? "");
        }
        if (dashRes.success) {
          setQuotaData(dashRes.data.quota);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone || null,
          monthly_income: income ? Number(income) : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profil berhasil disimpan!");
      } else {
        toast.error(json.error?.message ?? "Gagal menyimpan.");
      }
    } catch {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Yakin ingin menghapus akun? Semua data akan hilang permanen.")) return;
    if (!confirm("Ini TIDAK BISA DIBATALKAN. Ketik ya untuk konfirmasi.")) return;
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Akun berhasil dihapus.");
        router.push("/");
      } else {
        toast.error(json.error?.message ?? "Gagal menghapus akun.");
      }
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `safewallet-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh data.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const scanQuota = quotaData?.scans ?? { used: 0, limit: 3 };
  const scamQuota = quotaData?.scam_checks ?? { used: 0, limit: 5 };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="mt-1 text-muted-foreground">
          Kelola informasi profil dan preferensi kamu.
        </p>
      </div>

      {/* Profile Info — FIX F3: Connected to API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled value={profile?.email ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>Nomor WhatsApp (opsional)</Label>
            <Input
              placeholder="+6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Pendapatan Bulanan</Label>
            <Input
              type="number"
              placeholder="5000000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Digunakan untuk menghitung rasio utang dan saran saving rate.
            </p>
          </div>
          <Button
            className="gradient-primary text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription — Dynamic quota */}
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
              <Badge variant="secondary" className="mt-1 capitalize">
                {profile?.subscription_tier ?? "free"}
              </Badge>
            </div>
            {profile?.subscription_tier === "free" && (
              <Button variant="outline">Upgrade Premium</Button>
            )}
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📊 Scan tersisa bulan ini: <strong>{scanQuota.limit - scanQuota.used} / {scanQuota.limit}</strong></p>
            <p>🛡️ Cek scam tersisa bulan ini: <strong>{scamQuota.limit - scamQuota.used} / {scamQuota.limit}</strong></p>
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
            <Button variant="outline" size="sm" onClick={handleExportData}>
              Download
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-destructive">Hapus Akun</span>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Hapus
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sesuai UU PDP, kamu berhak mengakses, mengunduh, dan menghapus semua data pribadimu kapan saja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
