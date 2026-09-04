"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { DemoSector } from "@/features/landing/components/demo-v2/data";
import type { ReactNode } from "react";

/**
 * Chargement paresseux de la démo : elle pèse lourd (react-pdf + worker
 * pdf.js + le PDF), on ne la charge donc qu'au repos ou à la première
 * intention d'interaction. Le placeholder tient la place exacte.
 */
const DeferredIntelligenceDemo = dynamic(
  () =>
    import("@/features/landing/components/demo-v2").then(
      (mod) => mod.IntelligenceDemo,
    ),
  {
    loading: () => <HeroDemoPlaceholder />,
    ssr: false,
  },
);

export function HeroDemoPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="client-ui flex h-[720px] flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50 max-sm:h-[520px]"
    >
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-3 h-7 flex-1 rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
      <div className="grid flex-1 grid-cols-[0.36fr_0.64fr]">
        <div className="space-y-3 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
          <div className="h-9 rounded-md bg-orange-100 dark:bg-orange-500/15" />
          <div className="h-8 rounded-md bg-white dark:bg-neutral-800" />
          <div className="mt-5 h-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-12 rounded-xl bg-white dark:bg-neutral-800" />
          <div className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/70" />
          <div className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/70" />
        </div>
        <div className="flex flex-col bg-white p-5 dark:bg-neutral-950">
          <div className="h-14 max-w-[70%] rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-4 ml-auto h-20 w-[68%] rounded-xl bg-[#ff6a13]" />
          <div className="mt-4 h-24 max-w-[78%] rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-auto h-12 rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60" />
        </div>
      </div>
    </div>
  );
}

type LazyHeroDemoProps = {
  /** Incrémenté pour ouvrir la démo plein écran et lancer la visite guidée. */
  autoOpenTick?: number;
  onTourEnd?: () => void;
  /** Contenu du voile affiché au survol de l'aperçu (choix du secteur). */
  overlay?: ReactNode;
  sector?: DemoSector;
};

export function LazyHeroDemo({
  autoOpenTick,
  onTourEnd,
  overlay,
  sector,
}: LazyHeroDemoProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      return undefined;
    }

    const load = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const idleHandle = window.requestIdleCallback(load, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleHandle);
    }

    const timeout = window.setTimeout(load, 1200);
    return () => window.clearTimeout(timeout);
  }, [ready]);

  if (ready) {
    return (
      <DeferredIntelligenceDemo
        autoOpenTick={autoOpenTick}
        onTourEnd={onTourEnd}
        overlay={overlay}
        sector={sector}
      />
    );
  }

  const loadDemo = () => setReady(true);

  return (
    <div onFocus={loadDemo} onPointerEnter={loadDemo} onTouchStart={loadDemo}>
      <HeroDemoPlaceholder />
    </div>
  );
}
