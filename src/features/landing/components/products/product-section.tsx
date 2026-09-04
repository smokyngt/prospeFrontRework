"use client";

import { ArrowUpRight, HeartPulse, Landmark, type LucideIcon, Scale } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type Sector = {
  descKey: string;
  href: string;
  icon: LucideIcon;
  tagsKey: string;
  titleKey: string;
};

const SECTORS: Sector[] = [
  {
    icon: Scale,
    titleKey: "products.sectors.legal.title",
    descKey: "products.sectors.legal.description",
    tagsKey: "products.sectors.legal.tags",
    href: "/sectors/legal",
  },
  {
    icon: HeartPulse,
    titleKey: "products.sectors.healthcare.title",
    descKey: "products.sectors.healthcare.description",
    tagsKey: "products.sectors.healthcare.tags",
    href: "/sectors/healthcare",
  },
  {
    icon: Landmark,
    titleKey: "products.sectors.finance.title",
    descKey: "products.sectors.finance.description",
    tagsKey: "products.sectors.finance.tags",
    href: "/sectors/finance",
  },
];

function SectorCard({ sector }: { sector: Sector }) {
  const { t } = useTranslation();
  const Icon = sector.icon;
  const tags = t(sector.tagsKey, { returnObjects: true }) as string[];

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
      <h3 className="m-0 mt-5 text-[19px] font-bold text-[var(--pf-fg)]">
        {t(sector.titleKey)}
      </h3>
      <p className="m-0 mt-3 max-w-[320px] text-[14px] leading-[1.6] text-[var(--pf-fg-muted)]">
        {t(sector.descKey)}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10.5px] text-[var(--pf-fg-dim)]"
            style={{ border: "1px solid var(--pf-border)", padding: "4px 9px" }}
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        className="mt-6 inline-flex items-center gap-1.5 pt-1 text-[13.5px] font-semibold transition-colors hover:text-[#ff8232]"
        href={sector.href}
        style={{ color: "var(--pf-accent)" }}
      >
        {t("products.learnMore")}
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}

export default function ProductSection() {
  const { t } = useTranslation();

  return (
    <div>
      <h2
        className="m-0 mx-auto max-w-[820px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("products.titlePrefix")}{" "}
        <span className="text-[#FF6A13]">{t("products.titleHighlight")}</span>
      </h2>
      <p className="mx-auto mt-[18px] max-w-[640px] text-center text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
        {t("products.subtitle")}
      </p>

      <div
        className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {SECTORS.map((sector) => (
          <SectorCard key={sector.titleKey} sector={sector} />
        ))}
      </div>
    </div>
  );
}
