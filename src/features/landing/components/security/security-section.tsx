"use client";

import {
  ArrowRightLeft,
  ClipboardCheck,
  Cpu,
  Database,
  FileCheck2,
  FileText,
  KeyRound,
  Landmark,
  Lock,
  type LucideIcon,
  ShieldCheck,
} from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

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

type PipelineStep = { icon: LucideIcon; key: string };

const PIPELINE_STEPS: PipelineStep[] = [
  { icon: FileText, key: "document" },
  { icon: Database, key: "storage" },
  { icon: ArrowRightLeft, key: "transit" },
  { icon: Cpu, key: "processing" },
  { icon: FileCheck2, key: "response" },
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
      style={{ background: "var(--pf-bg-card)", borderColor: "var(--pf-border)" }}
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

function PipelineCard({ isLast, step }: { isLast: boolean; step: PipelineStep }) {
  const { t } = useTranslation();
  const Icon = step.icon;

  return (
    <div
      className="flex min-h-[128px] w-full flex-col items-center justify-center gap-2.5 p-4 text-center lg:flex-1"
      style={{ background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)" }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center"
        style={
          isLast
            ? {
                background: "var(--pf-accent-bg)",
                border: "1px solid var(--pf-accent-dim-border)",
                color: "var(--pf-accent)",
                animation: "pf-verify-pulse 2.4s ease-in-out infinite",
              }
            : {
                background: "var(--pf-accent-bg)",
                border: "1px solid var(--pf-accent-dim-border)",
                color: "var(--pf-accent)",
              }
        }
      >
        <Icon size={17} strokeWidth={1.7} />
      </span>
      <div>
        <strong className="block text-[13.5px] font-bold text-[var(--pf-fg)]">
          {t(`security.pipeline.${step.key}.label`)}
        </strong>
        <span className="mt-0.5 block text-[11.5px] text-[var(--pf-fg-muted)]">
          {t(`security.pipeline.${step.key}.caption`)}
        </span>
      </div>
    </div>
  );
}

/**
 * Trait + pastille entre deux étapes du pipeline — vertical en mobile,
 * horizontal à partir de lg. Le trait défile pour montrer le document qui
 * avance d'étape en étape ; la pastille marque le passage.
 */
function PipelineConnector() {
  return (
    <div className="relative flex h-6 w-full shrink-0 items-center justify-center lg:h-auto lg:w-6 lg:flex-1 lg:self-stretch">
      <span className="pf-connector-line h-full w-[3px] lg:h-[3px] lg:w-full" />
      <span
        className="absolute h-2.5 w-2.5"
        style={{
          background: "var(--pf-bg-card)",
          border: "2px solid var(--pf-accent)",
          animation: "pf-pulse 1.6s ease-in-out infinite",
        }}
      />
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

      {/* Piliers : chiffrement au repos, en transit, gestion des clés */}
      <div
        className="mt-9 grid grid-cols-1 sm:grid-cols-3"
        style={{ border: "1px solid var(--pf-border)" }}
      >
        {PILLARS.map((item, index) => (
          <SecurityCard index={index} item={item} key={item.titleKey} />
        ))}
      </div>

      {/* Pipeline : parcours du document, du dépôt à la réponse */}
      <div className="mt-7 flex flex-col items-stretch lg:mt-8 lg:flex-row">
        {PIPELINE_STEPS.map((step, index) => (
          <Fragment key={step.key}>
            {index > 0 ? <PipelineConnector /> : null}
            <PipelineCard isLast={index === PIPELINE_STEPS.length - 1} step={step} />
          </Fragment>
        ))}
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
