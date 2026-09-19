"use client";

import { cn } from "@/lib/utils";

export type Lang = "en" | "fr";

/** Drapeaux en SVG : les emojis 🇫🇷/🇬🇧 s'affichent en lettres « FR »/« GB » sous Windows. */
function FrenchFlag() {
  return (
    <svg viewBox="0 0 3 2" className="block h-[14px] w-[21px]" aria-hidden="true">
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#FFFFFF" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}

function BritishFlag() {
  return (
    <svg viewBox="0 0 60 30" className="block h-[14px] w-[21px]" aria-hidden="true" preserveAspectRatio="none">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const OPTIONS: { Flag: () => React.JSX.Element; label: string; value: Lang }[] = [
  { value: "fr", label: "Français", Flag: FrenchFlag },
  { value: "en", label: "English", Flag: BritishFlag },
];

/** Interrupteur de langue : deux drapeaux, un curseur orange glisse sur la langue active. */
export function LanguageSwitch({
  className,
  onChange,
  size = "md",
  value,
}: {
  className?: string;
  onChange: (lang: Lang) => void;
  size?: "md" | "lg";
  value: Lang;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn("relative flex border border-[var(--pf-border)]", className)}
      style={{ background: "var(--pf-bg-dim)" }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/2 bg-[#FF6A13] transition-transform duration-300 ease-out"
        style={{ transform: value === "fr" ? "translateX(0)" : "translateX(100%)" }}
      />
      {OPTIONS.map(({ Flag, label, value: option }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          aria-label={label}
          title={label}
          onClick={() => onChange(option)}
          className={cn(
            "relative z-10 flex items-center justify-center transition-opacity",
            size === "lg" ? "h-[38px] w-[46px]" : "h-8 w-[38px]",
            value === option ? "opacity-100" : "opacity-55 hover:opacity-90",
          )}
        >
          <Flag />
        </button>
      ))}
    </div>
  );
}
