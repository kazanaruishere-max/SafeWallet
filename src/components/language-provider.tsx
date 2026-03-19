"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  detectBrowserLocale,
  isSupportedLocale,
  messages as allMessages,
  type Locale,
  type Messages,
} from "@/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
};

const LANGUAGE_STORAGE_KEY = "safewallet.locale";
const LANGUAGE_COOKIE_KEY = "safewallet-locale";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "id" || stored === "en") {
    return stored;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
    ?.split("=")[1];

  return isSupportedLocale(cookie) ? cookie : null;
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const storedLocale = getStoredLocale();
    setLocaleState(storedLocale ?? detectBrowserLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState,
      messages: allMessages[locale],
    }),
    [locale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLocale must be used within a LanguageProvider");
  }

  return context;
}
