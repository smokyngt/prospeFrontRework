"use client";

import { cn } from "@/lib/utils";

import type React from "react";

export const ACCENT = "#FF6A13";

export const MOCK_CARD =
  "w-full border border-[#E4E4E4] bg-white shadow-[0_20px_38px_-25px_rgba(255,106,19,0.48)] [zoom:1.15]";

/** Barre grise à la place du texte non pertinent : l'œil ne voit que ce qui compte. */
export function Bar({ tone = "base", width }: { tone?: "base" | "faint"; width: string }) {
  return (
    <span
      className={cn("block h-[6px]", tone === "faint" ? "bg-[#F1F1F1]" : "bg-[#E6E6E6]")}
      style={{ width }}
    />
  );
}

export function MockHeader({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E4E4E4] px-3.5 py-3">
      <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#111]">{children}</span>
      {right}
    </div>
  );
}

export function StepBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("border border-[#E4E4E4] px-2.5 py-2", className)}>{children}</div>;
}

export function Connector() {
  return <span aria-hidden="true" className="mx-auto my-1.5 block h-3.5 w-px bg-[#E0E0E0]" />;
}

/** Libellé mono discret utilisé comme titre de sous-bloc dans les mocks. */
export function MockLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-mono text-[9px] uppercase tracking-[0.16em] text-[#9E9E9E]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CheckMark() {
  return (
    <span className="inline-flex h-3 w-3 items-center justify-center border-[1.5px] border-[#16A34A]">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

/** Jauge horizontale : fond gris, remplissage noir. */
export function ScoreBar({ pct }: { pct: number }) {
  return (
    <span className="block h-[3px] flex-1 bg-[#F1F1F1]">
      <span className="block h-full bg-[#111111]" style={{ width: `${pct}%` }} />
    </span>
  );
}
