"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * GDPR/UU PDP Compliance: Consent Banner
 * Menampilkan notifikasi pemrosesan data finansial dan meminta persetujuan user.
 */
export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === "undefined") return false;
    const consent = localStorage.getItem("safewallet-consent");
    const consentVersion = localStorage.getItem("safewallet-consent-version");
    const currentVersion = "1.0"; // Increment jika privacy policy berubah

    return !consent || consentVersion !== currentVersion;
  });

  const acceptConsent = () => {
    localStorage.setItem("safewallet-consent", "accepted");
    localStorage.setItem("safewallet-consent-version", "1.0");
    localStorage.setItem("safewallet-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const rejectConsent = () => {
    // User menolak - redirect ke halaman informasi
    window.location.href = "/privacy?rejected=true";
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 shadow-2xl z-50 border-t-2 border-blue-400">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              🔒 Privasi & Keamanan Data Anda
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              SafeWallet memproses data finansial Anda dengan{" "}
              <strong>enkripsi AES-256-GCM</strong> tingkat militer. Data OCR
              Anda <strong>tidak disimpan dalam bentuk plaintext</strong> dan
              hanya digunakan untuk analisis kesehatan finansial Anda.
            </p>
            <p className="text-xs text-blue-200">
              Dengan melanjutkan, Anda menyetujui{" "}
              <a
                href="/privacy"
                className="underline hover:text-white font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kebijakan Privasi
              </a>{" "}
              dan{" "}
              <a
                href="/terms"
                className="underline hover:text-white font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Syarat & Ketentuan
              </a>{" "}
              kami. Anda dapat menghapus data Anda kapan saja dari dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={acceptConsent}
              variant="default"
              className="bg-white text-blue-900 hover:bg-blue-50 font-semibold"
            >
              Saya Mengerti
            </Button>
            <Button
              onClick={rejectConsent}
              variant="ghost"
              className="text-white hover:bg-blue-700"
              size="sm"
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
