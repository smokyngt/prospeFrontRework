"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LazyHeroDemo } from "@/features/landing/components/demo/lazy-hero-demo";
import { demoQuestionsFor } from "@/features/landing/components/demo-v2/demo-config";

import type { DemoSector } from "@/features/landing/components/demo-v2/data";

/** Voile affiché au survol de l'aperçu : choix du prompt (secteur déjà fixé par la page). */
function PromptPickerOverlay({
  onPick,
  sector,
}: {
  onPick: (index: number) => void;
  sector: DemoSector;
}) {
  const { i18n } = useTranslation();
  const questions = demoQuestionsFor(i18n.language, sector);

  return (
    <div
      className="w-full max-w-[560px] p-5 shadow-2xl sm:p-6"
      style={{ background: "var(--pf-widget-bg)", border: "1px solid var(--pf-border)" }}
    >
      <h3 className="m-0 text-[17px] font-bold text-[var(--pf-fg)] sm:text-[19px]">
        Quelle question veux-tu voir traitée ?
      </h3>

      <div className="mt-4 flex flex-col gap-2">
        {questions.map((question, index) => (
          <button
            key={question}
            type="button"
            onClick={() => onPick(index)}
            className="flex items-start gap-2.5 px-3.5 py-3 text-left text-[13px] leading-[1.4] transition-colors hover:border-[#FF6A13] focus-visible:border-[#FF6A13] focus-visible:outline-none"
            style={{ background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)" }}
          >
            <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold text-[#FF6A13]">
              {index + 1}
            </span>
            <span className="text-[var(--pf-fg)]">{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Démo du hero d'une page secteur : le secteur est fixé par la route, le
 * voile au survol demande quel prompt jouer parmi les 4 de `demo-flow.md`.
 */
export function SectorHeroDemo({ sector }: { sector: DemoSector }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [autoOpenTick, setAutoOpenTick] = useState(0);

  const pick = (index: number) => {
    setPromptIndex(index);
    setAutoOpenTick((tick) => tick + 1);
  };

  return (
    <div className="flex min-w-0 flex-col">
      <LazyHeroDemo
        autoOpenTick={autoOpenTick}
        overlay={<PromptPickerOverlay onPick={pick} sector={sector} />}
        promptIndex={promptIndex}
        sector={sector}
      />
    </div>
  );
}
