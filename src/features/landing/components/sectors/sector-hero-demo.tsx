"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LazyHeroDemo } from "@/features/landing/components/demo/lazy-hero-demo";
import { demoQuestionsFor } from "@/features/landing/components/demo-v2/demo-config";

import type { DemoSector } from "@/features/landing/components/demo-v2/data";

/** Choix d'un scénario par thème ; l'index garde le prompt original de la démo. */
function PromptPickerOverlay({
  onPick,
  sector,
}: {
  onPick: (index: number) => void;
  sector: DemoSector;
}) {
  const { i18n } = useTranslation();
  const questions = demoQuestionsFor(i18n.language, sector);
  const isFrench = i18n.language.startsWith("fr");
  const groups =
    sector === "legal"
      ? [
          {
            label: isFrench ? "Synthèse du dossier" : "Case summary",
            items: [{ index: 0, title: isFrench ? "Synthèse avant signature" : "Pre-signature summary" }],
          },
          {
            label: isFrench ? "Comparaison & écarts" : "Comparison & discrepancies",
            items: [
              { index: 1, title: isFrench ? "Écarts avec la politique contractuelle" : "Gaps against contract policy" },
              { index: 2, title: isFrench ? "Contradictions entre documents" : "Conflicts across documents" },
            ],
          },
          {
            label: isFrench ? "Négociation" : "Negotiation",
            items: [{ index: 3, title: isFrench ? "Briefing et formulations à obtenir" : "Briefing and wording to secure" }],
          },
        ]
      : [
          {
            label: isFrench ? "Questions proposées" : "Suggested questions",
            items: questions.map((question, index) => ({ index, title: question })),
          },
        ];

  return (
    <div
      className="w-full max-w-[560px] p-5 shadow-2xl sm:p-6"
      style={{
        background: "var(--pf-widget-bg)",
        border: "1px solid var(--pf-border)",
        boxShadow: "0 24px 80px -40px rgba(255, 106, 19, 0.2)",
        backdropFilter: "blur(18px)",
      }}
    >
      <h3 className="m-0 text-[17px] font-bold text-[var(--pf-fg)] sm:text-[19px]">
        {isFrench ? "Quelle question veux-tu voir traitée ?" : "Which question would you like to explore?"}
      </h3>
      <p className="mt-1.5 mb-0 text-[12px] leading-[1.5] text-[var(--pf-fg-muted)]">
        {isFrench
          ? "Choisis un thème : la question complète sera posée dans la démo."
          : "Choose a theme: the full question will be asked in the demo."}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.label}>
            <h4 className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pf-fg-dim)]">
              {group.label}
            </h4>
            <div className="flex flex-col gap-1.5">
              {group.items.map(({ index, title }) => (
                <button
                  key={`${group.label}-${index}`}
                  type="button"
                  onClick={() => onPick(index)}
                  className="flex items-start gap-2.5 px-3.5 py-2.5 text-left text-[13px] leading-[1.4] transition-all hover:border-[#FF6A13] hover:bg-[var(--pf-accent-bg)] focus-visible:border-[#FF6A13] focus-visible:outline-none"
                  style={{
                    background: "color-mix(in srgb, var(--pf-bg-card) 88%, transparent)",
                    border: "1px solid var(--pf-border)",
                  }}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold text-[#FF6A13]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--pf-fg)]">{title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Démo secteur : le clic choisit un scénario et lance la question complète correspondante. */
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
