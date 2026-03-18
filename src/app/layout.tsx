import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PlausibleAnalytics } from "@/components/analytics";
import "./globals.css";
import { LenisProvider } from "@/components/lenis-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SafeWallet — AI Financial Wellness Platform",
    template: "%s | SafeWallet",
  },
  description:
    "Cegah jerat utang & investasi bodong dengan AI. Cek kesehatan keuangan, deteksi scam, dan dapatkan coaching personal.",
  keywords: [
    "financial wellness",
    "AI keuangan",
    "scam detector",
    "cek kesehatan keuangan",
    "literasi keuangan Indonesia",
  ],
  authors: [{ name: "SafeWallet" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafeWallet",
  },
  openGraph: {
    title: "SafeWallet — AI Financial Wellness Platform",
    description:
      "Cegah jerat utang & investasi bodong. Platform AI untuk kesehatan keuangan Indonesia.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f9d6e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <LenisProvider>
          {children}
          <Toaster position="top-right" richColors />
          <PlausibleAnalytics />
        </LenisProvider>
      </body>
    </html>
  );
}
