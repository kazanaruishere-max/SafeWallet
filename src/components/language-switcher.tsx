"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/language-provider";
import { type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale, messages } = useLocale();
  const options: Array<{ value: Locale; label: string }> = [
    { value: "id", label: "ID" },
    { value: "en", label: "EN" },
  ];

  return (
    <div
      aria-label={messages.switcher.ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center text-white/50" title={messages.switcher.shortLabel}>
        <Languages className="h-4 w-4" />
      </div>
      {options.map((option) => {
        const isActive = option.value === locale;

        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 rounded-lg px-3 text-xs font-bold tracking-wider",
              isActive
                ? "bg-[#F2A971] text-[#0B0A08] hover:bg-[#F2A971]"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
            onClick={() => setLocale(option.value)}
            title={messages.switcher.options[option.value]}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
