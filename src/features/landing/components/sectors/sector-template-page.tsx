"use client";

import { FileCheck2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LandingFooter } from "@/features/landing/components/footer";
import { LandingNavbar, sectorPageNavLinks } from "@/features/landing/components/navigation";
import { FAQSection } from "@/features/landing/components/faq/faq-section";
import { RevealSection } from "@/features/landing/components/reveal";
import { FINANCE_MOCKS } from "@/features/landing/components/sectors/mocks/finance-mocks";
import { HEALTHCARE_MOCKS } from "@/features/landing/components/sectors/mocks/healthcare-mocks";
import { LEGAL_MOCKS } from "@/features/landing/components/sectors/mocks/legal-mocks";
import {
  Divider,
  SectionLabel,
  SectorHero,
} from "@/features/landing/components/sectors/sector-page";
import { SectorHeroDemo } from "@/features/landing/components/sectors/sector-hero-demo";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { SectorId } from "@/features/landing/components/sectors/sector-page";
import type { FAQEntry } from "@/features/landing/components/faq/faq-section";
import type React from "react";

const ACCENT = "#FF6A13";

/** Chaque secteur apporte ses propres icônes de capacités et ses propres illustrations. */
const SECTOR_MOCKS: Record<SectorId, (() => React.JSX.Element)[]> = {
  finance: FINANCE_MOCKS,
  healthcare: HEALTHCARE_MOCKS,
  legal: LEGAL_MOCKS,
};

type TitledItem = { description: string; title: string };
type UseCaseItem = TitledItem & { audience?: string; tag: string };
type ProofStat = { label: string; value: string; versus: string };
type ProofPassage = { context: string; quote: string; reference: string; title: string };

type SectionProps = { number: string; sector: SectorId };

/* ──────────────────────────────────────────────────────── */
/*  Building blocks                                          */
/* ──────────────────────────────────────────────────────── */

function TemplateSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <RevealSection
      className={cn("px-5 sm:px-8 lg:px-12", className)}
      id={id}
      style={{
        paddingBottom: "clamp(72px, 10vh, 112px)",
        paddingTop: "clamp(72px, 10vh, 112px)",
      }}
    >
      {children}
    </RevealSection>
  );
}

function Title({
  end,
  highlight,
  highlightAccent = true,
  maxWidth = 820,
  start,
}: {
  end?: string;
  highlight: string;
  highlightAccent?: boolean;
  maxWidth?: number;
  start: string;
}) {
  return (
    <h2
      className="m-0 font-bold leading-[1.08] tracking-[-0.02em] text-[var(--pf-fg)]"
      style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)", maxWidth }}
    >
      {start}
      <span className={highlightAccent ? "text-[#FF6A13]" : "text-[var(--pf-fg)]"}>{highlight}</span>
      {end}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-[18px] max-w-[680px] text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
      {children}
    </p>
  );
}

/**
 * En-tête de section : label, titre et chapô centrés. Seuls les titres le sont —
 * les cartes, mocks et blocs de cas d'usage gardent leur alignement à gauche.
 */
function SectionHead({
  children,
  end,
  highlight,
  label,
  maxWidth,
  number,
  highlightAccent = true,
  showLabel = true,
  start,
}: {
  children?: React.ReactNode;
  end?: string;
  highlight: string;
  label: string;
  maxWidth?: number;
  number: string;
  highlightAccent?: boolean;
  showLabel?: boolean;
  start: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {showLabel && <SectionLabel number={number} label={label} />}
      <Title
        start={start}
        highlight={highlight}
        end={end}
        maxWidth={maxWidth}
        highlightAccent={highlightAccent}
      />
      {children}
    </div>
  );
}

/** Grille de cartes séparées par un filet d'1 px. */
function CardGrid({ children, columns }: { children: React.ReactNode; columns: string }) {
  return (
    <div
      className={cn("mt-11 grid grid-cols-1 gap-px border", columns)}
      style={{ background: "var(--pf-border)", borderColor: "var(--pf-border)" }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Capabilities                                             */
/* ──────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────── */
/*  Use cases showcase                                       */
/* ──────────────────────────────────────────────────────── */

function UseCases({ sector }: { sector: SectorId }) {
  const { t } = useTranslation();
  const K = `sectors.${sector}Page.useCases`;
  const items = t(`${K}.items`, { returnObjects: true }) as UseCaseItem[];
  const mocks = SECTOR_MOCKS[sector];
  const [active, setActive] = useState(0);
  const [pulse, setPulse] = useState({ index: -1, run: 0 });
  const caseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionTitle = t(`sectors.${sector}.useCasesTitle`);
  const titleBreak = sectionTitle.lastIndexOf(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = caseRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index >= 0) setActive(index);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    caseRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [items.length, sector]);

  const goTo = (index: number) => {
    setActive(index);
    setPulse((prev) => ({ index, run: prev.run + 1 }));
    caseRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <TemplateSection id="use-cases">
      <div className="flex flex-col items-center text-center">
        <SectionLabel number="03" label={t("sectors.common.labels.useCases")} />
        <h2 className="m-0 max-w-[960px] text-balance text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[var(--pf-fg)]">
          {sectionTitle.slice(0, titleBreak + 1)}
          <span className="text-[#FF6A13]">{sectionTitle.slice(titleBreak + 1)}</span>
        </h2>
        <Lead>{t("sectors.common.useCasesSubtitle")}</Lead>
        {sector === "legal" && (
          <p className="mt-2 mb-0 text-[11px] text-[var(--pf-fg-dim)]">{t(`${K}.mockDisclaimer`)}</p>
        )}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-[clamp(32px,3.5vw,64px)] lg:grid-cols-[275px_minmax(0,1fr)]">
        <div className="sticky top-24 hidden flex-col self-start lg:flex">
          <div className="pb-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--pf-fg-dim)]">
            {t(`${K}.browse`)}
          </div>
          {items.map((item, index) => {
            const isActive = active === index;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => goTo(index)}
                className="group relative flex cursor-pointer items-center gap-4 border-0 bg-transparent px-4 py-[22px] text-left"
                style={{ borderBottom: "1px solid var(--pf-border)" }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 origin-left bg-[var(--pf-accent-bg)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `scaleX(${isActive ? 1 : 0})` }}
                />
                <span className="font-sans text-[13px] font-semibold tracking-normal text-[#FF6A13]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-[16px] font-semibold transition-colors duration-300",
                    isActive
                      ? "text-[var(--pf-fg)]"
                      : "text-[var(--pf-fg-muted)] group-hover:text-[var(--pf-fg)]",
                  )}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-[clamp(64px,7vw,120px)]">
          {items.map((item, index) => {
            const Mock = mocks[index] ?? mocks[0];
            const flipped = index % 2 === 1;
            return (
              <div
                key={item.title}
                ref={(node) => {
                  caseRefs.current[index] = node;
                }}
                className={cn(
                  "grid grid-cols-1 items-center gap-[clamp(28px,3vw,52px)]",
                  flipped
                    ? "lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.45fr)]"
                    : "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)]",
                )}
              >
                <div
                  key={`panel-${pulse.index === index ? pulse.run : 0}`}
                  className={cn(
                    "flex min-h-[380px] items-center justify-center border p-[clamp(28px,4vw,64px)] lg:min-h-[540px]",
                    pulse.index === index && "pf-case-pop",
                    flipped && "lg:order-2",
                  )}
                  style={{
                    backgroundColor: "#FF6A13",
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    borderColor: "rgba(255,255,255,0.38)",
                  }}
                >
                  <Mock />
                </div>
                <div className={cn(flipped && "lg:order-1")}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--pf-fg-dim)]">
                    {item.tag}
                  </span>
                  <h3
                    className="mt-2.5 mb-0 font-bold leading-[1.15] tracking-[-0.02em] text-[var(--pf-fg)]"
                    style={{ fontSize: "clamp(1.65rem, 2.5vw, 2.25rem)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3.5 mb-0 text-[16px] leading-[1.65] text-[var(--pf-fg-muted)]">
                    {item.description}
                  </p>
                  {item.audience && (
                    <p className="mt-4 mb-0 border-t pt-3 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.08em] text-[var(--pf-fg-dim)]" style={{ borderColor: "var(--pf-border)" }}>
                      {item.audience}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TemplateSection>
  );
}

function DocumentProblem({ sector }: { sector: SectorId }) {
  const { t } = useTranslation();
  const K = `sectors.${sector}Page.problem`;
  const copy = t(K, { returnObjects: true }) as {
    corpusLabel: string;
    description: string;
    documents: { detail: string; title: string }[];
    label: string;
    note: string;
    question: string;
    questionLabel: string;
    title: string;
  };

  return (
    <TemplateSection id="problem">
      <SectionHead number="02" label={copy.label} start={copy.title} highlight="" highlightAccent={false}>
        <Lead>{copy.description}</Lead>
      </SectionHead>
      <div className="mx-auto mt-11 max-w-[940px] border p-[clamp(20px,3vw,36px)]" style={{ background: "var(--pf-bg-card)", borderColor: "var(--pf-border)" }}>
        <div className="mb-5 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--pf-border)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF6A13]">{copy.corpusLabel}</span>
          <span className="text-[11px] text-[var(--pf-fg-muted)]">{copy.documents.length} {t("sectors.common.documents", { defaultValue: "documents" })}</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {copy.documents.map((document) => (
            <div key={document.title} className="min-w-0 bg-[var(--pf-bg-card-2)] p-3.5">
              <div className="flex items-center gap-2">
                <FileCheck2 size={15} className="flex-none text-[#FF6A13]" />
                <span className="truncate text-[11px] font-semibold text-[var(--pf-fg)]">{document.title}</span>
              </div>
              <p className="mb-0 mt-2 text-[11px] leading-[1.5] text-[var(--pf-fg-muted)]">{document.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-l-[3px] border-[#FF6A13] bg-[var(--pf-bg-card-2)] px-4 py-3.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--pf-fg-dim)]">{copy.questionLabel}</span>
          <p className="mb-0 mt-2 text-[14px] font-medium leading-[1.55] text-[var(--pf-fg)]">{copy.question}</p>
        </div>
        <p className="mb-0 mt-4 text-[11px] leading-[1.6] text-[var(--pf-fg-dim)]">{copy.note}</p>
      </div>
    </TemplateSection>
  );
}

function LegalDemo() {
  const { t } = useTranslation();
  const K = "sectors.legalPage.reliability";

  return (
    <TemplateSection id="demo">
      <SectionHead
        number="04"
        label={t(`${K}.label`)}
        start={t(`${K}.titleStart`)}
        highlight={t(`${K}.titleHighlight`)}
      />
      <div
        className="mx-auto mt-11 w-full max-w-[900px] overflow-hidden border"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-bg-card)",
          boxShadow: "var(--pf-demo-shadow)",
        }}
      >
        <SectorHeroDemo sector="legal" />
      </div>
    </TemplateSection>
  );
}

function LegalConfidentiality() {
  const { i18n, t } = useTranslation();
  const copy = t("sectors.legalPage.confidentiality", { returnObjects: true }) as {
    description: string;
    label: string;
    note: string;
    teams: { dossier: string; name: string; type: string }[];
    title: string;
  };

  return (
    <TemplateSection id="confidentiality">
      <SectionHead number="05" label={copy.label} start={copy.title} highlight="" highlightAccent={false}>
        <Lead>{copy.description}</Lead>
      </SectionHead>
      <div className="mx-auto mt-11 grid max-w-[940px] gap-px border md:grid-cols-2" style={{ borderColor: "var(--pf-border)", background: "var(--pf-border)" }}>
        {copy.teams.map((team, index) => (
          <div key={team.name} className="p-[clamp(22px,3vw,34px)]" style={{ background: "var(--pf-bg-card)" }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#FF6A13]">{i18n.language.startsWith("fr") ? "ÉQUIPE" : "TEAM"} 0{index + 1}</span>
              <ShieldCheck size={17} className="text-[#FF6A13]" />
            </div>
            <h3 className="mb-1 text-[1.1rem] font-bold text-[var(--pf-fg)]">{team.name}</h3>
            <p className="mb-4 text-[12px] text-[var(--pf-fg-muted)]">{team.type}</p>
            <div className="border px-3.5 py-3 text-[13px] font-medium text-[var(--pf-fg)]" style={{ borderColor: "var(--pf-border)", background: "var(--pf-bg-card-2)" }}>{team.dossier}</div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--pf-fg-muted)]"><span className="h-1.5 w-1.5 rounded-full bg-[#35A66F]" />{i18n.language.startsWith("fr") ? "Accès selon les habilitations" : "Access follows user permissions"}</div>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-5 max-w-[940px] border px-4 py-3 text-[12px] leading-[1.6] text-[var(--pf-fg-muted)]" style={{ borderColor: "var(--pf-border)" }}>{copy.note}</p>
    </TemplateSection>
  );
}

function SectorPilot({ sector }: { sector: SectorId }) {
  const { i18n, t } = useTranslation();
  const K = `sectors.${sector}Page.pilot`;
  const copy = t(K, { returnObjects: true }) as {
    description: string;
    label: string;
    steps: { description: string; title: string }[];
    title: string;
  };

  return (
    <TemplateSection id="pilot">
      <SectionHead number="06" label={copy.label} start={copy.title} highlight="" highlightAccent={false}>
        <Lead>{copy.description}</Lead>
      </SectionHead>
      <CardGrid columns="sm:grid-cols-2 lg:grid-cols-4">
        {copy.steps.map((step, index) => (
          <div key={step.title} className="p-[clamp(20px,2.2vw,28px)]" style={{ background: "var(--pf-bg-card)" }}>
            <span className="font-mono text-[11px] font-semibold text-[#FF6A13]">0{index + 1}</span>
            <h3 className="mt-3 mb-2 text-[1rem] font-bold text-[var(--pf-fg)]">{step.title}</h3>
            <p className="m-0 text-[12.5px] leading-[1.6] text-[var(--pf-fg-muted)]">{step.description}</p>
          </div>
        ))}
      </CardGrid>
      <div id="faq" className="mt-[clamp(52px,7vw,84px)]">
        <FAQSection
          items={t("sectors.legal.faq", { returnObjects: true }) as FAQEntry[]}
          title={sector === "legal"
            ? (i18n.language.startsWith("fr") ? <>Questions <span className="text-[#FF6A13]">juridiques</span></> : <>Legal <span className="text-[#FF6A13]">questions</span></>)
            : t("sectors.common.faqTitle")}
          schemaId={`${sector}-faq-jsonld`}
        />
      </div>
      <SectorCta sector={sector} />
    </TemplateSection>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Proof                                                    */
/* ──────────────────────────────────────────────────────── */

function Proof({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const K = `sectors.${sector}Page.proof`;
  const stats = t(`${K}.stats`, { returnObjects: true }) as ProofStat[];
  const sources = t(`${K}.sources`, { returnObjects: true }) as string[];
  const passageValue = t(`${K}.passages`, { returnObjects: true, defaultValue: [] }) as unknown;
  const passages = Array.isArray(passageValue) ? (passageValue as ProofPassage[]) : [];

  return (
    <TemplateSection id="proof">
      <SectionHead
        number={number}
        label={t(`${K}.label`)}
        start={t(`${K}.titleStart`)}
        highlight={t(`${K}.titleHighlight`)}
        maxWidth={780}
      />

      <div
        className="mt-11 flex flex-col gap-[18px] border p-[clamp(24px,3vw,44px)]"
        style={{ background: "var(--pf-bg-card)", borderColor: "var(--pf-border)" }}
      >
        <div
          className="max-w-[600px] self-start px-[18px] py-3.5 text-[14px] font-semibold text-white"
          style={{ background: ACCENT }}
        >
          {t(`${K}.prompt`)}
        </div>

        <div
          className="max-w-[720px] border p-5"
          style={{ background: "var(--pf-bg-card-2)", borderColor: "var(--pf-border)" }}
        >
          <p className="m-0 text-[15px] leading-[1.65] text-[var(--pf-fg)]">
            {t(`${K}.answerStart`)}
            <span
              className="px-[5px] py-px font-semibold"
              style={{ background: "var(--pf-accent-highlight)" }}
            >
              {t(`${K}.answerHighlight`)}
            </span>
            {t(`${K}.answerEnd`)}
          </p>

          {passages.length > 0 && (
            <div className="my-4 grid gap-2 sm:grid-cols-2">
              {passages.map((passage) => (
                <div key={passage.reference} className="border p-3" style={{ borderColor: "var(--pf-border)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[var(--pf-fg)]">{passage.title}</span>
                    <span className="flex-none font-mono text-[9px] text-[var(--pf-fg-dim)]">{passage.reference}</span>
                  </div>
                  <p className="mb-0 mt-2 text-[12px] leading-[1.55] text-[var(--pf-fg-muted)]">{passage.quote}</p>
                  <p className="mb-0 mt-2 border-t pt-2 font-mono text-[9px] text-[var(--pf-fg-dim)]" style={{ borderColor: "var(--pf-border)" }}>{passage.context}</p>
                </div>
              ))}
            </div>
          )}

          <div className="my-[18px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="border p-3" style={{ borderColor: "var(--pf-border)" }}>
                <div className="text-[1.05rem] font-bold text-[var(--pf-fg)]">{stat.value}</div>
                <div className="mt-[3px] text-[10px] text-[var(--pf-fg-muted)]">{stat.label}</div>
                {stat.versus ? (
                  <div className="mt-[3px] font-mono text-[10px] text-[#FF6A13]">{stat.versus}</div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mb-[9px] font-mono text-[10px] tracking-[0.2em] text-[#FF6A13]">
            {t("sectors.common.sourcesLabel")}
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <span
                key={source}
                className="border px-2 py-1 font-mono text-[10px] text-[var(--pf-fg-muted)]"
                style={{ borderColor: "var(--pf-border)" }}
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-[var(--pf-fg-dim)]">
          <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
          {t("sectors.common.example.note")}
        </div>
      </div>
    </TemplateSection>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Governance                                               */
/* ──────────────────────────────────────────────────────── */

function Governance({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const K = `sectors.${sector}Page.governance`;
  const items = t(`${K}.items`, { returnObjects: true }) as TitledItem[];
  const diagramValue = t(`${K}.diagram`, { returnObjects: true }) as unknown;
  const diagramCopy = diagramValue as {
    corpus: string[];
    corpusTitle: string;
    access: string[];
    accessTitle: string;
    teams: string[];
    teamsTitle: string;
  } | null;
  const diagram =
    diagramCopy &&
    Array.isArray(diagramCopy.corpus) &&
    Array.isArray(diagramCopy.access) &&
    Array.isArray(diagramCopy.teams)
      ? diagramCopy
      : null;

  return (
    <TemplateSection id="governance">
      <SectionHead
        number={number}
        label={t(`${K}.label`)}
        start={t(`${K}.titleStart`)}
        highlight={t(`${K}.titleHighlight`)}
      >
        <Lead>{t(`${K}.intro`)}</Lead>
      </SectionHead>

      {diagram ? (
        <div className="mx-auto mt-11 grid max-w-[1080px] items-stretch gap-3 md:grid-cols-[1fr_44px_1fr_44px_1fr]">
          {[
            { title: diagram.corpusTitle, lines: diagram.corpus },
            { title: diagram.accessTitle, lines: diagram.access },
            { title: diagram.teamsTitle, lines: diagram.teams },
          ].map((group, index) => (
            <div key={group.title} className="border p-5 sm:p-6" style={{ background: "var(--pf-bg-card)", borderColor: "var(--pf-border)" }}>
              <div className="mb-4 flex items-center gap-2 border-b pb-3" style={{ borderColor: "var(--pf-border)" }}>
                <span className="font-mono text-[10px] font-semibold text-[#FF6A13]">0{index + 1}</span>
                <h3 className="m-0 text-[14px] font-bold text-[var(--pf-fg)]">{group.title}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {group.lines.map((line) => (
                  <div key={line} className="border px-3 py-2.5 text-[12px] leading-[1.45] text-[var(--pf-fg-muted)]" style={{ borderColor: "var(--pf-border)", background: "var(--pf-bg-card-2)" }}>{line}</div>
                ))}
              </div>
            </div>
          ))
            .flatMap((node, index) => index < 2 ? [node, <div key={`arrow-${index}`} className="hidden items-center justify-center text-[22px] text-[#FF6A13] md:flex" aria-hidden="true">→</div>] : [node])}
        </div>
      ) : (
        <CardGrid columns="md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="p-[clamp(24px,2.6vw,34px)] transition-colors hover:bg-[var(--pf-bg-hover)]"
              style={{ background: "var(--pf-bg-card)" }}
            >
              <span className="font-mono text-[11px] font-semibold text-[#FF6A13]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3.5 mb-2 text-[1.1rem] font-bold text-[var(--pf-fg)]">{item.title}</h3>
              <p className="m-0 text-[13.5px] leading-[1.65] text-[var(--pf-fg-muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </CardGrid>
      )}
    </TemplateSection>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Page                                                     */
/* ──────────────────────────────────────────────────────── */

/**
 * Les sections numérotées le sont dans l'ordre d'affichage. La vitrine des cas
 * d'usage ne porte pas de label, elle n'en consomme donc pas de numéro.
 */
function SectorCta({ sector }: { sector: SectorId }) {
  const { t } = useTranslation();

  return (
    <div id="cta" className="mt-10 flex justify-center">
      <Link
        href="/#contact"
        className="inline-flex items-center gap-2 bg-[#FF6A13] px-7 py-4 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#ff8232]"
      >
        {t(`sectors.${sector}Page.cta`, { defaultValue: t("sectors.common.ctaPilot") })}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export function SectorTemplatePage({ lang, sector }: { lang?: string; sector: SectorId }) {
  useEffect(() => {
    if (lang === "fr" || lang === "en") {
      i18n.changeLanguage(lang).catch(() => undefined);
    }
  }, [lang]);

  return (
    <div className="relative min-h-screen [overflow-anchor:none]" style={{ background: "var(--pf-bg)" }}>
      <LandingNavbar links={sectorPageNavLinks(sector)} />

      <main className="relative z-10 [overflow-anchor:none]">
        <div className="mx-auto w-full max-w-[1480px]">
          <div
            className="mx-auto w-full max-w-[1480px] border-x border-[var(--pf-border)] [overflow-anchor:none]"
            style={{ background: "var(--pf-column-bg)" }}
          >
            <SectorHero sector={sector} showDemo={sector !== "legal"} />
            <Divider />
            <DocumentProblem sector={sector} />
            <Divider />
            <UseCases sector={sector} />
            <Divider />
            {sector === "legal" ? <LegalDemo /> : <Proof number="04" sector={sector} />}
            <Divider />
            {sector === "legal" ? <LegalConfidentiality /> : <Governance number="05" sector={sector} />}
            <Divider />
            <SectorPilot sector={sector} />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
