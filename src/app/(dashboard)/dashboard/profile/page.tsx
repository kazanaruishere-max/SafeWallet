"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Shield, Loader2, Save, Download, Trash2, Smartphone, Mail, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ProfileData = {
  email: string;
  phone: string | null;
  monthly_income: number | null;
  subscription_tier: string;
  onboarding_completed: boolean;
  telegram_chat_id: string | null;
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1A1D24]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function ProfilePage() {
  const { messages } = useLocale();
  const copy = messages.profile;
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

  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

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
        toast.success(copy.toastProfileSaved);
      } else {
        toast.error(json.error?.message ?? copy.toastProfileSaveFailed);
      }
    } catch {
      toast.error(copy.toastServerFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(copy.confirmDeleteFirst)) return;
    if (!confirm(copy.confirmDeleteSecond)) return;
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(copy.toastDeleteSuccess);
        router.push("/");
      } else {
        toast.error(json.error?.message ?? copy.toastDeleteFailed);
      }
    } catch {
      toast.error(copy.toastServerFailed);
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
      toast.success(copy.toastDownloadSuccess);
    } catch {
      toast.error(copy.toastDownloadFailed);
    }
  };

  const handleGenerateTelegramCode = async () => {
    setLinking(true);
    try {
      const res = await fetch("/api/user/telegram-link", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setLinkCode(json.code);
        toast.success(copy.toastOtpSuccess);
      } else {
        toast.error(json.error?.message ?? copy.toastOtpFailed);
      }
    } catch {
      toast.error(copy.toastServerFailed);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#F2A971]" />
      </div>
    );
  }

  const scanQuota = quotaData?.scans ?? { used: 0, limit: 5 };
  const scamQuota = quotaData?.scam_checks ?? { used: 0, limit: 10 };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3323D2]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-white/50 text-lg">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Personal Information & Subscriptions */}
        <div className="space-y-8">
          
          {/* Card: Personal Information */}
          <GlassCard className="p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <User className="text-[#F2A971] w-5 h-5" /> {copy.personalInfo}
            </h2>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F2A971] to-[#3323D2] flex items-center justify-center text-3xl font-black text-white shadow-xl">
                {profile?.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1 block">{copy.vaultAccount}</Label>
                <p className="text-white font-bold text-lg">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/70 font-medium">{copy.registeredEmail}</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input disabled value={profile?.email ?? ""} className="bg-white/5 border-white/10 text-white/50 pl-12 h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 font-medium">{copy.whatsapp}</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    placeholder="+6281234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-[#F2A971] text-white pl-12 h-12 rounded-xl transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 font-medium">{copy.monthlyIncome}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type="number"
                    placeholder={copy.monthlyIncomePlaceholder}
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-[#F2A971] text-white pl-12 h-12 rounded-xl transition-colors"
                  />
                </div>
                <p className="text-xs text-white/40 leading-relaxed mt-2">
                  *{copy.monthlyIncomeHint}
                </p>
              </div>

              <Button
                className="w-full h-12 mt-4 rounded-xl bg-[#F2A971] text-[#0B0A08] font-bold shadow-[0_0_20px_rgba(242,169,113,0.2)] hover:shadow-[0_0_30px_rgba(242,169,113,0.4)] transition-all"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {copy.saving}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    {copy.saveProfile}
                  </>
                )}
              </Button>
            </div>
          </GlassCard>

          {/* Card: Subscription */}
          <GlassCard className="p-8 border-[#3323D2]/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCard className="text-[#8B7DFF] w-5 h-5" /> {copy.planTitle}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">{copy.subscriptionStatus}</p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#3323D2] text-white hover:bg-[#3323D2] text-sm py-1 capitalize rounded-lg">{profile?.subscription_tier ?? "free"}</Badge>
                  <span className="text-white font-bold text-lg">SafeWallet {profile?.subscription_tier === 'free' ? 'Basic' : 'Premium'}</span>
                </div>
              </div>
              {profile?.subscription_tier === "free" && (
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium rounded-xl h-10">
                  {copy.upgradePremium}
                </Button>
              )}
            </div>
            <div className="bg-[#0B0A08]/40 border border-white/5 rounded-2xl p-4 flex gap-6">
              <div className="flex-1">
                <span className="text-white/40 text-xs block mb-1">Health Scanner</span>
                <span className="text-xl font-black text-white">{scanQuota.limit - scanQuota.used} <span className="text-sm font-normal text-white/50">/ {scanQuota.limit} {copy.remaining}</span></span>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1">
                <span className="text-white/40 text-xs block mb-1">Scam Checker</span>
                <span className="text-xl font-black text-white">{scamQuota.limit - scamQuota.used} <span className="text-sm font-normal text-white/50">/ {scamQuota.limit} {copy.remaining}</span></span>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Telegram & Security */}
        <div className="space-y-8">
          
          {/* Card: Telegram Connection */}
          <GlassCard className="p-8 border-[#3323D2] shadow-[0_0_50px_rgba(51,35,210,0.15)] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3323D2]/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#2CA5E0]/10 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#2CA5E0] fill-current"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.32.252-.472.252l.215-3.048 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{copy.telegramTitle}</h2>
                <Badge variant="outline" className={`mt-1 border-none font-bold ${profile?.telegram_chat_id ? 'bg-[#F2A971]/20 text-[#F2A971]' : 'bg-white/10 text-white/50'}`}>
                  {profile?.telegram_chat_id ? copy.telegramConnected : copy.telegramDisconnected}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {!profile?.telegram_chat_id ? (
                <>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {copy.telegramDescription}
                  </p>
                  
                  {!linkCode ? (
                    <Button 
                      className="w-full h-14 bg-[#2CA5E0] hover:bg-[#2286b8] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(44,165,224,0.3)]"
                      onClick={handleGenerateTelegramCode} 
                      disabled={linking}
                    >
                      {linking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                      {copy.telegramGenerateOtp}
                    </Button>
                  ) : (
                    <div className="bg-[#0B0A08] border border-[#2CA5E0]/30 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-full bg-[#2CA5E0]/5 pointer-events-none" />
                      <h3 className="text-[#2CA5E0] font-bold mb-3 flex items-center gap-2">{copy.telegramFinalSteps}</h3>
                      <ol className="text-white/60 text-sm space-y-2 ml-4 list-decimal marker:text-white/40 mb-5">
                        <li>{copy.telegramStep1}</li>
                        <li>{copy.telegramStep2}</li>
                        <li>{copy.telegramStep3}</li>
                      </ol>
                      
                      <div className="flex gap-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 flex items-center justify-center font-mono font-bold text-xl text-white tracking-widest">
                          /link {linkCode}
                        </div>
                        <Button 
                          onClick={() => navigator.clipboard.writeText(`/link ${linkCode}`)}
                          className="h-auto bg-[#2CA5E0]/20 text-[#2CA5E0] hover:bg-[#2CA5E0]/30 rounded-xl"
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-center text-white/30 mt-4">*{copy.telegramOtpHint}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#F2A971]/5 border border-[#F2A971]/20 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-[#F2A971]/10 text-[#F2A971] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F2A971]/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{copy.telegramFullyConnected}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {copy.telegramConnectedDescription}
                  </p>
                  <Button variant="outline" className="mt-6 border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl w-full">{copy.telegramDisconnect}</Button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Card: Security & Privacy */}
          <GlassCard className="p-8 border-red-500/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="text-red-500 w-5 h-5" /> {copy.privacyTitle}
            </h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              {copy.privacyDescription}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                <div>
                  <h3 className="text-white font-bold text-sm">{copy.exportTitle}</h3>
                  <p className="text-white/40 text-xs mt-1">{copy.exportDescription}</p>
                </div>
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-xl" onClick={handleExportData}>
                  <Download className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 group hover:bg-red-500/10 transition-colors">
                <div>
                  <h3 className="text-red-400 font-bold text-sm">{copy.deleteTitle}</h3>
                  <p className="text-red-400/50 text-xs mt-1">{copy.deleteDescription}</p>
                </div>
                <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl" onClick={handleDeleteAccount}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
