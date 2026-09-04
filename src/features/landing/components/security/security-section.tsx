"use client";

import { ClipboardCheck, KeyRound, Landmark, Lock, type LucideIcon, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

type SecurityItem = {
  descKey: string;
  icon: LucideIcon;
  titleKey: string;
};

const ITEMS: SecurityItem[] = [
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

function SecurityCard({ item }: { item: SecurityItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <div
      className="flex flex-col items-center px-6 py-7 text-center sm:p-8"
      style={{
        background: "var(--pf-bg-card)",
        border: "1px solid var(--pf-border)",
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center"
        style={{
          background: "var(--pf-accent-bg)",
          border: "1px solid var(--pf-accent-dim-border)",
          color: "var(--pf-accent)",
        }}
      >
        <Icon size={22} />
      </span>
      <h3 className="m-0 mt-5 text-[17px] font-bold text-[var(--pf-fg)]">
        {t(item.titleKey)}
      </h3>
      <p className="m-0 mt-3 max-w-[280px] text-[13.5px] leading-[1.6] text-[var(--pf-fg-muted)]">
        {t(item.descKey)}
      </p>
    </div>
  );
}

export function SecuritySection() {
  const { t } = useTranslation();

  return (
    <div>
      <h2
        className="m-0 mx-auto max-w-[820px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("security.titlePrefix")}{" "}
        <span className="text-[#FF6A13]">{t("security.titleHighlight")}</span>
      </h2>
      <p className="mx-auto mt-[18px] max-w-[640px] text-center text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
        {t("security.subtitle")}
      </p>

      <div className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <SecurityCard item={item} key={item.titleKey} />
        ))}
      </div>
    </div>
  );
}
