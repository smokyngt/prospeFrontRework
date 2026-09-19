"use client";

import { ClipboardCheck, KeyRound, Landmark, Lock, type LucideIcon, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { SecurityDiagram } from "./security-diagram";

type SecurityItem = {
  descKey: string;
  icon: LucideIcon;
  titleKey: string;
};

const PILLARS: SecurityItem[] = [
  {
    icon: Lock,
    titleKey: "security.items.atRest.title",
    descKey: "security.items.atRest.description",
  },
  {
    icon: ShieldCheck,
    titleKey: "security.items.inTransit.title",
    descKey: "security.items.inTransit.description",
  },
  {
    icon: KeyRound,
    titleKey: "security.items.keys.title",
    descKey: "security.items.keys.description",
  },
];

const FOOTER_ITEMS: SecurityItem[] = [
  {
    icon: ClipboardCheck,
    titleKey: "security.items.audit.title",
    descKey: "security.items.audit.description",
  },
  {
    icon: Landmark,
    titleKey: "security.items.hosting.title",
    descKey: "security.items.hosting.description",
  },
];

/** Carte icône + texte, utilisée pour les 3 piliers et les 2 cartes de bas de section. */
function SecurityCard({ index, item }: { index: number; item: SecurityItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex min-h-[118px] items-center gap-4 p-5",
        index !== 0 && "border-t border-dashed sm:border-l sm:border-t-0",
      )}
      style={{ background: "var(--pf-bg)", borderColor: "var(--pf-border)" }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center"
        style={{
          background: "var(--pf-accent-bg)",
          border: "1px solid var(--pf-accent-dim-border)",
          color: "var(--pf-accent)",
        }}
      >
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <div>
        <h3 className="m-0 text-[14.5px] font-bold text-[var(--pf-fg)]">{t(item.titleKey)}</h3>
        <p className="m-0 mt-1.5 text-[12.5px] leading-[1.5] text-[var(--pf-fg-muted)]">
          {t(item.descKey)}
        </p>
      </div>
    </div>
  );
}

export function SecuritySection() {
  const { t } = useTranslation();

  return (
    <div>
      <h2
        className="m-0 mx-auto max-w-[900px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("security.titlePrefix")}{" "}
        <span className="text-[#FF6A13]">{t("security.titleHighlight")}</span>
      </h2>
      <p className="mx-auto mt-[18px] max-w-[640px] text-center text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
        {t("security.subtitle")}
      </p>

      {/* Piliers : chiffrement au repos, en transit, gestion des clés */}
      <div
        className="mt-9 grid grid-cols-1 sm:grid-cols-3"
        style={{ border: "1px solid var(--pf-border)" }}
      >
        {PILLARS.map((item, index) => (
          <SecurityCard index={index} item={item} key={item.titleKey} />
        ))}
      </div>

      {/* Infrastructure : périmètre de confiance et liens chiffrés */}
      <div className="mt-7 lg:mt-8">
        <SecurityDiagram />
      </div>

      {/* Audit et hébergement */}
      <div
        className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:mt-8"
        style={{ border: "1px solid var(--pf-border)" }}
      >
        {FOOTER_ITEMS.map((item, index) => (
          <SecurityCard index={index} item={item} key={item.titleKey} />
        ))}
      </div>
    </div>
  );
}
