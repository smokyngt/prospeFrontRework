"use client";

import { HeartPulse, Landmark, type LucideIcon, Scale } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LazyHeroDemo } from "@/features/landing/components/demo/lazy-hero-demo";

import type { DemoSector } from "@/features/landing/components/demo-v2/data";

const ACCENT = "#FF6A13";

/**
 * Les secteurs de la démo et les pages « cas d'usage » portent les mêmes
 * identifiants : le choix fait ici détermine aussi la page de destination.
 */
const SECTORS: { icon: LucideIcon; id: DemoSector }[] = [
  { id: "legal", icon: Scale },
  { id: "healthcare", icon: HeartPulse },
  { id: "finance", icon: Landmark },
];

function SectorChoice({
  icon: Icon,
  id,
  onPick,
}: {
  icon: LucideIcon;
  id: DemoSector;
  onPick: (sector: DemoSector) => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className="group/choice flex min-w-0 flex-1 basis-[160px] cursor-pointer items-center justify-center gap-2.5 px-4 py-4 text-center transition-colors hover:border-[#FF6A13] focus-visible:border-[#FF6A13] focus-visible:outline-none"
      style={{ background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)" }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center"
        style={{ background: "var(--pf-accent-bg)", border: "1px solid var(--pf-accent-dim-border)", color: ACCENT }}
      >
        <Icon size={16} />
      </span>
      <span className="text-[14px] font-bold text-[var(--pf-fg)]">
        {t(`sectors.${id}.label`)}
      </span>
    </button>
  );
}

/** Voile affiché au survol de l'aperçu : choix du secteur. */
function PickerOverlay({ onPick }: { onPick: (sector: DemoSector) => void }) {
  const { t } = useTranslation();

  return (
    <div
      className="w-full max-w-[520px] p-5 shadow-2xl sm:p-6"
      style={{ background: "var(--pf-widget-bg)", border: "1px solid var(--pf-border)" }}
    >
      <h3 className="m-0 text-[17px] font-bold text-[var(--pf-fg)] sm:text-[19px]">
        {t("hero.demoPicker.title")}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {SECTORS.map((sector) => (
          <SectorChoice key={sector.id} icon={sector.icon} id={sector.id} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

/**
 * Démo du hero pilotée par le secteur : le voile au survol demande le secteur,
 * la démo se lance sur ce jeu de données avec la visite guidée, et la fin de
 * visite propose la page « cas d'usage » du même secteur.
 */
export function HeroDemoPicker() {
  const [sector, setSector] = useState<DemoSector>();
  const [autoOpenTick, setAutoOpenTick] = useState(0);

  const pick = (next: DemoSector) => {
    setSector(next);
    setAutoOpenTick((tick) => tick + 1);
  };

  return (
    <div className="flex min-w-0 flex-col">
      <LazyHeroDemo
        autoOpenTick={autoOpenTick}
        overlay={<PickerOverlay onPick={pick} />}
        sector={sector}
        sectorTeaser={!sector}
      />
    </div>
  );
}
