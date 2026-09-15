"use client";

import Image from "next/image";
import Script from "next/script";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ContactForm } from "@/features/contact/components";
import { SectorHeroDemo } from "@/features/landing/components/sectors/sector-hero-demo";
import { LandingFooter } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/navigation";
import { RevealSection } from "@/features/landing/components/reveal";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { DemoSector } from "@/features/landing/components/demo-v2/data";
import type React from "react";

const ACCENT = "#FF6A13";

export type SectorId = "legal" | "healthcare" | "finance";

/** Chaque section reçoit son rang : l'ordre change selon le secteur. */
type SectionProps = { number: string; sector: SectorId };

/**
 * Secteurs disposant d'un corpus de démo (document + scénario).
 * Les autres gardent l'aperçu statique du hero.
 */
const SECTOR_DEMO: Partial<Record<SectorId, DemoSector>> = {
  finance: "finance",
  healthcare: "healthcare",
  legal: "legal",
};

type UseCase = { description: string; tag: string; title: string };
type WorkflowStep = { description: string; label: string; tag: string };
type SecurityArea = { description: string; title: string };
type Offer = { badge: string; features: string[]; meta: string; title: string };
type FaqItem = { answer: string; question: string };
type ChallengeItem = { description: string; title: string };
type ComparisonRow = { criterion: string; generic: string; prosperify: string };
type InsightItem = { finding: string; question: string; sources: string[]; tag: string };
type CriterionItem = { description: string; title: string };

/* ──────────────────────────────────────────────────────── */
/*  Layout helpers — repris de la landing                    */
/* ──────────────────────────────────────────────────────── */

function SectionLabel({ number, label }: { label: string; number: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="font-mono text-xs tracking-[0.2em] text-[#FF6A13]">
        {number}
      </span>
      <span
        className="block h-px w-6"
        style={{ background: "var(--pf-border-2)" }}
      />
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--pf-fg-muted)]">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px" style={{ background: "var(--pf-border)" }} />;
}

/** CTA de fin de section : ramène vers la démo ou vers le formulaire de contact. */
function SectionCta({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      className="mt-9 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#FF6A13] transition-colors hover:text-[#ff8232]"
      href={href}
    >
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <RevealSection
      className="px-5 sm:px-8 lg:px-12"
      id={id}
      style={{
        paddingTop: "clamp(72px, 10vh, 112px)",
        paddingBottom: "clamp(72px, 10vh, 112px)",
      }}
    >
      {children}
    </RevealSection>
  );
}

function SectionTitle({
  children,
  maxWidth = 820,
}: {
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <h2
      className="m-0 font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
      style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)", maxWidth }}
    >
      {children}
    </h2>
  );
}

/** Encart « réponse sourcée » : passage surligné + puces de sources. */
function SourcedAnswer({
  compact = false,
  sector,
}: {
  compact?: boolean;
  sector: SectorId;
}) {
  const { t } = useTranslation();
  const sources = t(`sectors.${sector}.sources`, {
    returnObjects: true,
  }) as string[];

  return (
    <div
      className={compact ? "p-4" : "p-5"}
      style={{
        background: "var(--pf-bg-card-2)",
        border: "1px solid var(--pf-border)",
      }}
    >
      <p
        className={cn(
          "m-0 leading-[1.65] text-[var(--pf-fg)]",
          compact ? "text-[14px]" : "text-[15px]",
        )}
      >
        {t(`sectors.${sector}.answerStart`)}
        <span
          className="font-semibold text-[var(--pf-fg)]"
          style={{
            background: "var(--pf-accent-highlight)",
            padding: "1px 5px",
          }}
        >
          {t(`sectors.${sector}.answerHighlight`)}
        </span>
        {t(`sectors.${sector}.answerEnd`)}
      </p>

      {!compact && (
        <div
          className="my-[18px] h-px"
          style={{ background: "var(--pf-border)" }}
        />
      )}

      <div className={compact ? "mt-4" : ""}>
        <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[#FF6A13]">
          {t("sectors.common.sourcesLabel")}
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <span
              key={source}
              className="font-mono text-[10px] text-[var(--pf-fg-muted)]"
              style={{
                border: "1px solid var(--pf-border)",
                padding: "4px 8px",
              }}
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Hero                                                     */
/* ──────────────────────────────────────────────────────── */

function SectorHero({ sector }: { sector: SectorId }) {
  const { t } = useTranslation();
  const demoSector = SECTOR_DEMO[sector];

  return (
    <section
      className="px-5 sm:px-8 lg:px-12"
      id="hero"
      style={{
        paddingTop: "clamp(116px, 15vh, 160px)",
        paddingBottom: "clamp(56px, 7vh, 88px)",
      }}
    >
      <div className="flex flex-wrap items-center gap-6 lg:gap-12">
        <div className="min-w-0 max-w-[580px] flex-1 basis-80">
          <div className="mb-[26px] flex items-center gap-3">
            <span
              className="h-[7px] w-[7px] bg-[#FF6A13]"
              style={{ animation: "pf-pulse 2.4s ease-in-out infinite" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF6A13]">
              {t(`sectors.${sector}.badge`)}
            </span>
          </div>

          <h1
            className="m-0 font-extrabold leading-[1.03] tracking-[-0.03em] text-[var(--pf-fg)]"
            style={{ fontSize: "clamp(2.3rem, 5.4vw, 4.1rem)" }}
          >
            {t(`sectors.${sector}.titleStart`)}
            <span className="text-[#FF6A13]">
              {t(`sectors.${sector}.titleHighlight`)}
            </span>
            {t(`sectors.${sector}.titleEnd`)}
          </h1>

          <p
            className="mt-[26px] max-w-[600px] leading-[1.65] text-[var(--pf-fg-muted)]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.18rem)" }}
          >
            {t(`sectors.${sector}.subtitle`)}
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 px-[26px] py-3.5 text-[14px] font-semibold text-[#080808] transition-colors hover:bg-[#ff8232]"
              href="#contact"
              style={{ background: ACCENT }}
            >
              {t("sectors.common.ctaDemo")} →
            </a>
            <a
              className="inline-flex items-center gap-2 px-[26px] py-3.5 text-[14px] font-semibold text-[var(--pf-fg)] transition-colors hover:border-[#FF6A13]"
              href="#use-cases"
              style={{
                border: "1px solid var(--pf-border-2)",
                background: "transparent",
              }}
            >
              {t("sectors.common.ctaCases")}
            </a>
          </div>
        </div>

        {/* Démo interactive si le secteur a son corpus, sinon un aperçu statique */}
        {demoSector ? (
          <div
            className="min-w-0 flex-1 basis-96 overflow-hidden"
            style={{
              border: "1px solid var(--pf-border)",
              boxShadow: "var(--pf-demo-shadow)",
              animation: "pf-fadeUp 0.6s ease",
            }}
          >
            <SectorHeroDemo sector={demoSector} />
          </div>
        ) : (
          <div
            className="flex min-w-0 flex-1 basis-96 flex-col"
            style={{
              background: "var(--pf-bg-card)",
              border: "1px solid var(--pf-border)",
              boxShadow: "var(--pf-demo-shadow)",
              animation: "pf-fadeUp 0.6s ease",
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "var(--pf-bg-dim)",
                borderBottom: "1px solid var(--pf-border)",
              }}
            >
              <div className="flex gap-2">
                <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f56]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#ffbd2e]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#27c93f]" />
              </div>
              <div
                className="flex flex-1 items-center gap-2 px-3 py-[7px]"
                style={{
                  background: "var(--pf-bg-card-2)",
                  border: "1px solid var(--pf-border)",
                }}
              >
                <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
                <span className="font-mono text-[11px] text-[var(--pf-fg-muted)]">
                  prosperify.app / chat
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between px-[18px] py-3.5"
              style={{ borderBottom: "1px solid var(--pf-border)" }}
            >
              <div className="flex items-center gap-3">
                <Image
                  alt=""
                  className="h-[22px] w-auto object-contain"
                  height={44}
                  src="/assets/brand/logo-mark.png"
                  width={44}
                />
                <span className="text-[15px] font-bold text-[var(--pf-fg)]">
                  {t(`sectors.${sector}.chatTitle`)}
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.14em] text-[#FF6A13]">
                ● single-tenant
              </span>
            </div>

            <div className="flex flex-col gap-3.5 px-[18px] py-5">
              <div
                className="max-w-[86%] self-end px-3.5 py-3 text-[13px] leading-[1.55] text-[var(--pf-fg)]"
                style={{
                  background: "var(--pf-bg-card-2)",
                  border: "1px solid var(--pf-border)",
                }}
              >
                {t(`sectors.${sector}.question`)}
              </div>

              <SourcedAnswer compact sector={sector} />

              <div className="flex items-center gap-2.5 font-mono text-[11px] text-[var(--pf-fg-dim)]">
                <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
                {t("sectors.common.heroVerified")}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Le problème du secteur                                   */
/* ──────────────────────────────────────────────────────── */

function Challenge({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const items = t(`sectors.${sector}.challenge.items`, {
    returnObjects: true,
  }) as ChallengeItem[];

  return (
    <Section id="challenge">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.challenge")}
      />
      <SectionTitle>{t(`sectors.${sector}.challenge.title`)}</SectionTitle>
      <p className="m-0 mt-[18px] max-w-[660px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t(`sectors.${sector}.challenge.intro`)}
      </p>

      <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 py-1 pl-5"
            style={{ borderLeft: `2px solid ${ACCENT}` }}
          >
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--pf-fg-dim)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="m-0 text-[1.15rem] font-bold leading-[1.25] text-[var(--pf-fg)]">
              {item.title}
            </h3>
            <p className="m-0 text-[14px] leading-[1.6] text-[var(--pf-fg-muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <SectionCta href="#hero">{t(`sectors.${sector}.challenge.cta`)}</SectionCta>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  01 · Cas d'usage                                         */
/* ──────────────────────────────────────────────────────── */

function UseCases({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const useCases = t(`sectors.${sector}.useCases`, {
    returnObjects: true,
  }) as UseCase[];

  return (
    <Section id="use-cases">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.useCases")}
      />
      <SectionTitle>{t(`sectors.${sector}.useCasesTitle`)}</SectionTitle>
      <p className="m-0 mt-[18px] max-w-[620px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t("sectors.common.useCasesSubtitle")}
      </p>

      <div
        className="mt-11 grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-4"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        {useCases.map((useCase, index) => (
          <div
            key={useCase.title}
            className="flex flex-col gap-3.5 transition-colors hover:bg-[var(--pf-bg-hover)]"
            style={{
              background: "var(--pf-bg-card)",
              padding: "clamp(24px, 2.6vw, 32px)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-[42px] w-[42px] items-center justify-center font-mono text-[13px] font-semibold text-[#FF6A13]"
                style={{
                  background: "var(--pf-accent-bg)",
                  border: `1px solid ${ACCENT}`,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--pf-fg-dim)]">
                {useCase.tag}
              </span>
            </div>
            <h3 className="m-0 mt-1.5 text-[1.18rem] font-bold text-[var(--pf-fg)]">
              {useCase.title}
            </h3>
            <p className="m-0 text-[13.5px] leading-[1.6] text-[var(--pf-fg-muted)]">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  02 · Workflow RAG                                        */
/* ──────────────────────────────────────────────────────── */

function WorkflowRag({ number }: SectionProps) {
  const { t } = useTranslation();
  const steps = t("sectors.common.workflow.steps", {
    returnObjects: true,
  }) as WorkflowStep[];

  return (
    <Section id="workflow">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.workflow")}
      />
      <SectionTitle maxWidth={780}>
        {t("sectors.common.workflow.title")}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[620px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t("sectors.common.workflow.subtitle")}
      </p>

      <div className="pf-flow mt-11">
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <div className="pf-flow-node flex flex-col gap-3 px-[18px] py-[22px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] font-semibold text-[#FF6A13]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--pf-fg-dim)]">
                  {step.tag}
                </span>
              </div>
              <h3 className="m-0 mt-2 text-[15px] font-bold text-[var(--pf-fg)]">
                {step.label}
              </h3>
              <p className="m-0 text-[12.5px] leading-[1.55] text-[var(--pf-fg-muted)]">
                {step.description}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="pf-flow-conn">
                <div className="pf-flow-track">
                  <span
                    className="pf-flow-dot-travel"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  />
                </div>
                <span className="pf-flow-chevron">→</span>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.1em] text-[var(--pf-fg-dim)]">
        <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
        {t("sectors.common.workflow.footnote")}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  03 · Sécurité & conformité                               */
/* ──────────────────────────────────────────────────────── */

function Security({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const chips = t(`sectors.${sector}.securityChips`, {
    returnObjects: true,
  }) as string[];
  const areas = t("sectors.common.security.areas", {
    returnObjects: true,
  }) as SecurityArea[];

  return (
    <Section id="security">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.security")}
      />
      <SectionTitle>{t("sectors.common.security.title")}</SectionTitle>
      <p className="m-0 mt-[18px] max-w-[660px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t("sectors.common.security.intro")}
      </p>

      <div className="mt-[22px] flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-[7px] px-3 py-[7px] text-[12px] font-semibold text-[var(--pf-fg)]"
            style={{
              background: "var(--pf-accent-bg)",
              border: `1px solid ${ACCENT}`,
            }}
          >
            <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
            {chip}
          </span>
        ))}
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-px border md:grid-cols-2 xl:grid-cols-3"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        {areas.map((area, index) => (
          <div
            key={area.title}
            className="flex gap-4 transition-colors hover:bg-[var(--pf-bg-hover)]"
            style={{
              background: "var(--pf-bg-card)",
              padding: "clamp(22px, 2.4vw, 28px)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{
                background: "var(--pf-accent-bg)",
                border: `1px solid ${ACCENT}`,
              }}
            >
              <span
                className="h-3 w-3"
                style={{ border: `2px solid ${ACCENT}` }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h3 className="m-0 text-[1.05rem] font-bold text-[var(--pf-fg)]">
                  {area.title}
                </h3>
                <span className="font-mono text-[11px] text-[var(--pf-border-2)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="m-0 mt-2 text-[13px] leading-[1.55] text-[var(--pf-fg-muted)]">
                {area.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="m-0 mt-[18px] max-w-[720px] text-[12.5px] leading-[1.6] text-[var(--pf-fg-dim)]">
        {t("sectors.common.security.disclaimer")}
      </p>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  04 · Exemple de réponse sourcée                          */
/* ──────────────────────────────────────────────────────── */

function SourcedExample({ number, sector }: SectionProps) {
  const { t } = useTranslation();

  return (
    <Section id="example">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.example")}
      />
      <SectionTitle maxWidth={780}>
        {t("sectors.common.example.title")}
      </SectionTitle>

      <div
        className="mt-10 flex flex-col gap-4"
        style={{
          background: "var(--pf-bg-card)",
          border: "1px solid var(--pf-border)",
          padding: "clamp(24px, 3vw, 44px)",
        }}
      >
        <div
          className="max-w-[560px] self-start px-[18px] py-3.5 text-[14px] font-semibold text-[#080808]"
          style={{ background: ACCENT }}
        >
          {t(`sectors.${sector}.question`)}
        </div>

        <div className="max-w-[680px]">
          <SourcedAnswer sector={sector} />
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-[var(--pf-fg-dim)]">
          <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
          {t("sectors.common.example.note")}
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Preuves tirées de la démo                                */
/* ──────────────────────────────────────────────────────── */

function SectorInsights({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const items = t(`sectors.${sector}.insights.items`, {
    returnObjects: true,
  }) as InsightItem[];

  return (
    <Section id="insights">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.insights")}
      />
      <SectionTitle maxWidth={780}>
        {t(`sectors.${sector}.insights.title`)}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[680px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t(`sectors.${sector}.insights.intro`)}
      </p>

      <div
        className="mt-11 grid grid-cols-1 gap-px border lg:grid-cols-2"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.question}
            className="flex flex-col gap-4"
            style={{
              background: "var(--pf-bg-card)",
              padding: "clamp(24px, 2.6vw, 32px)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-semibold text-[#FF6A13]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--pf-fg-dim)]">
                {item.tag}
              </span>
            </div>
            <p className="m-0 text-[1rem] font-semibold leading-[1.5] text-[var(--pf-fg)]">
              « {item.question} »
            </p>
            <p className="m-0 text-[13.5px] leading-[1.65] text-[var(--pf-fg-muted)]">
              {item.finding}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.sources.map((source) => (
                <span
                  key={source}
                  className="font-mono text-[10px] text-[var(--pf-fg-dim)]"
                  style={{ border: "1px solid var(--pf-border)", padding: "3px 7px" }}
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] text-[var(--pf-fg-dim)]">
        <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
        {t(`sectors.${sector}.insights.footnote`)}
      </div>

      <SectionCta href="#contact">{t(`sectors.${sector}.insights.cta`)}</SectionCta>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Critères de fiabilité, hiérarchisés par secteur           */
/* ──────────────────────────────────────────────────────── */

function SectorCriteria({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const items = t(`sectors.${sector}.criteria.items`, {
    returnObjects: true,
  }) as CriterionItem[];

  return (
    <Section id="criteria">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.criteria")}
      />
      <SectionTitle maxWidth={780}>
        {t(`sectors.${sector}.criteria.title`)}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[660px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t(`sectors.${sector}.criteria.intro`)}
      </p>

      <div className="mt-11 flex flex-col" style={{ border: "1px solid var(--pf-border)" }}>
        {items.map((item, index) => (
          <div
            key={item.title}
            className="flex items-start gap-5 border-b last:border-b-0"
            style={{ borderColor: "var(--pf-border)", padding: "clamp(20px, 2.4vw, 28px)" }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center font-mono text-[13px] font-bold text-[#FF6A13]"
              style={{ background: "var(--pf-accent-bg)", border: `1px solid ${ACCENT}` }}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="m-0 text-[1.05rem] font-bold text-[var(--pf-fg)]">
                {item.title}
              </h3>
              <p className="m-0 mt-2 text-[13.5px] leading-[1.6] text-[var(--pf-fg-muted)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionCta href="#contact">{t(`sectors.${sector}.criteria.cta`)}</SectionCta>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Ce que le DSI va vérifier                                */
/* ──────────────────────────────────────────────────────── */

function SectorIntegration({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const items = t(`sectors.${sector}.integration.items`, {
    returnObjects: true,
  }) as CriterionItem[];

  return (
    <Section id="integration">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.integration")}
      />
      <SectionTitle maxWidth={820}>
        {t(`sectors.${sector}.integration.title`)}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[720px] text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
        {t(`sectors.${sector}.integration.intro`)}
      </p>

      <div
        className="mt-11 grid grid-cols-1 gap-px border md:grid-cols-2"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.title}
            className="flex flex-col gap-3"
            style={{
              background: "var(--pf-bg-card)",
              padding: "clamp(24px, 2.6vw, 32px)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-[12px] font-semibold text-[#FF6A13]"
                style={{ background: "var(--pf-accent-bg)", border: `1px solid ${ACCENT}` }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="m-0 text-[1.02rem] font-bold text-[var(--pf-fg)]">
                {item.title}
              </h3>
            </div>
            <p className="m-0 text-[13.5px] leading-[1.65] text-[var(--pf-fg-muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <SectionCta href="#contact">{t(`sectors.${sector}.integration.cta`)}</SectionCta>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Pourquoi pas un LLM généraliste                          */
/* ──────────────────────────────────────────────────────── */

function GenericComparison({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const rows = t("sectors.common.comparison.rows", {
    returnObjects: true,
  }) as ComparisonRow[];

  return (
    <Section id="comparison">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.comparison")}
      />
      <SectionTitle maxWidth={860}>
        {t("sectors.common.comparison.title")}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[680px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t("sectors.common.comparison.intro")}
      </p>

      {/* L'échec concret, propre au secteur */}
      <div
        className="mt-11 flex flex-col gap-4 p-6 sm:p-8"
        style={{
          background: "var(--pf-bg-card)",
          border: "1px solid var(--pf-border)",
          borderLeft: `2px solid ${ACCENT}`,
        }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF6A13]">
          {t("sectors.common.comparison.failureLabel")}
        </span>
        <p className="m-0 text-[1.05rem] font-semibold leading-[1.5] text-[var(--pf-fg)]">
          « {t(`sectors.${sector}.genericFailure.question`)} »
        </p>
        <p className="m-0 max-w-[760px] text-[14.5px] leading-[1.65] text-[var(--pf-fg-muted)]">
          {t(`sectors.${sector}.genericFailure.generic`)}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--pf-fg-dim)]">
            {t("sectors.common.comparison.costLabel")}
          </span>
          <span className="max-w-[700px] text-[14.5px] leading-[1.65] text-[var(--pf-fg)]">
            {t(`sectors.${sector}.genericFailure.cost`)}
          </span>
        </div>
      </div>

      {/* Le tableau de comparaison */}
      <div
        className="mt-8 grid grid-cols-1 gap-px border md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        <div
          className="hidden px-5 py-3 md:block"
          style={{ background: "var(--pf-bg-card-2)" }}
        />
        <div
          className="hidden px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pf-fg-dim)] md:block"
          style={{ background: "var(--pf-bg-card-2)" }}
        >
          {t("sectors.common.comparison.genericColumn")}
        </div>
        <div
          className="hidden px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#FF6A13] md:block"
          style={{ background: "var(--pf-bg-card-2)" }}
        >
          {t("sectors.common.comparison.prosperifyColumn")}
        </div>

        {rows.map((row) => (
          <Fragment key={row.criterion}>
            <div
              className="px-5 py-5 text-[13.5px] font-semibold text-[var(--pf-fg)]"
              style={{ background: "var(--pf-bg-card)" }}
            >
              {row.criterion}
            </div>
            <div
              className="px-5 py-5 text-[13.5px] leading-[1.6] text-[var(--pf-fg-dim)]"
              style={{ background: "var(--pf-bg-card)" }}
            >
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--pf-fg-dim)] md:hidden">
                {t("sectors.common.comparison.genericColumn")}
              </span>
              {row.generic}
            </div>
            <div
              className="px-5 py-5 text-[13.5px] leading-[1.6] text-[var(--pf-fg-muted)]"
              style={{ background: "var(--pf-bg-card)" }}
            >
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF6A13] md:hidden">
                {t("sectors.common.comparison.prosperifyColumn")}
              </span>
              <span className="flex gap-2.5">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0"
                  style={{ background: ACCENT }}
                />
                <span>{row.prosperify}</span>
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  05 · Déploiement                                         */
/* ──────────────────────────────────────────────────────── */

function Deployment({ number }: SectionProps) {
  const { t } = useTranslation();
  const offers = t("sectors.common.deployment.offers", {
    returnObjects: true,
  }) as Offer[];

  return (
    <Section id="deployment">
      <SectionLabel
        number={number}
        label={t("sectors.common.labels.deployment")}
      />
      <SectionTitle maxWidth={760}>
        {t("sectors.common.deployment.title")}
      </SectionTitle>
      <p className="m-0 mt-[18px] max-w-[620px] text-[1.05rem] text-[var(--pf-fg-muted)]">
        {t("sectors.common.deployment.subtitle")}
      </p>

      <div
        className="mt-11 grid grid-cols-1 gap-px border md:grid-cols-3"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        {offers.map((offer, index) => (
          <div
            key={offer.title}
            className="relative flex flex-col transition-colors hover:bg-[var(--pf-bg-hover)]"
            style={{
              background: "var(--pf-bg-card)",
              padding: "clamp(24px, 2.6vw, 34px)",
            }}
          >
            {index === offers.length - 1 && (
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: ACCENT }}
              />
            )}

            <div className="mb-[22px] flex items-center justify-between">
              <span className="font-mono text-[12px] text-[var(--pf-fg-dim)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {offer.badge && (
                <span
                  className="font-mono text-[9px] font-semibold tracking-[0.14em] text-[#080808]"
                  style={{ background: ACCENT, padding: "4px 8px" }}
                >
                  {offer.badge}
                </span>
              )}
            </div>

            <div className="mb-5 flex gap-[5px]">
              {[0, 1, 2].map((bar) => (
                <span
                  key={bar}
                  className="h-1 w-[30px]"
                  style={{
                    background: bar <= index ? ACCENT : "var(--pf-border)",
                  }}
                />
              ))}
            </div>

            <h3 className="m-0 text-[1.8rem] font-bold leading-[1.1] text-[var(--pf-fg)]">
              {offer.title}
            </h3>
            <div className="mt-3 font-mono text-[11px] tracking-[0.06em] text-[var(--pf-fg-muted)]">
              {offer.meta}
            </div>

            <div
              className="my-6 h-px"
              style={{ background: "var(--pf-border)" }}
            />

            <div className="flex flex-col gap-3">
              {offer.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-[5px] h-2 w-2 shrink-0 bg-[#FF6A13]" />
                  <span className="text-[13.5px] leading-[1.5] text-[var(--pf-fg-muted)]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  06 · FAQ                                                 */
/* ──────────────────────────────────────────────────────── */

function SectorFaq({ number, sector }: SectionProps) {
  const { t } = useTranslation();
  const items = t(`sectors.${sector}.faq`, {
    returnObjects: true,
  }) as FaqItem[];
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <Section id="faq">
      <Script
        id={`sector-faq-jsonld-${sector}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <SectionLabel number={number} label={t("sectors.common.labels.faq")} />
      <SectionTitle>{t("sectors.common.faqTitle")}</SectionTitle>

      <div className="mt-11 border" style={{ borderColor: "var(--pf-border)" }}>
        {items.map((item, index) => {
          const isOpen = openItems.includes(index);
          return (
            <div
              key={item.question}
              className="border-b last:border-b-0"
              style={{
                borderColor: "var(--pf-border)",
                background: isOpen ? "var(--pf-bg-card-2)" : "transparent",
              }}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full cursor-pointer items-center justify-between gap-5 border-none bg-transparent text-left"
                style={{ padding: "20px clamp(18px, 2.4vw, 28px)" }}
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="shrink-0 font-mono text-xs text-[#FF6A13]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[15px] font-semibold",
                      isOpen
                        ? "text-[var(--pf-fg)]"
                        : "text-[var(--pf-fg-muted)]",
                    )}
                  >
                    {item.question}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[18px] text-[#FF6A13]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p
                  className="m-0 text-sm leading-[1.65] text-[var(--pf-fg-muted)]"
                  style={{ padding: "0 clamp(18px, 2.4vw, 28px) 22px 50px" }}
                >
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  07 · Contact                                             */
/* ──────────────────────────────────────────────────────── */

function SectorContact({ number }: SectionProps) {
  const { t } = useTranslation();
  const checks = t("sectors.common.contact.checks", {
    returnObjects: true,
  }) as string[];

  return (
    <RevealSection
      className="px-5 sm:px-8 lg:px-12"
      id="contact"
      style={{
        paddingTop: "clamp(72px, 10vh, 112px)",
        paddingBottom: "clamp(72px, 10vh, 112px)",
      }}
    >
      <div
        className="grid grid-cols-1 gap-px border lg:grid-cols-2"
        style={{
          borderColor: "var(--pf-border)",
          background: "var(--pf-border)",
        }}
      >
        <div
          style={{
            background: "var(--pf-bg-card)",
            padding: "clamp(28px, 3vw, 44px)",
          }}
        >
          <SectionLabel
            number={number}
            label={t("sectors.common.labels.contact")}
          />
          <h2
            className="m-0 font-bold leading-[1.08] tracking-[-0.02em] text-[var(--pf-fg)]"
            style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)" }}
          >
            {t("sectors.common.contact.title")}
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-[var(--pf-fg-muted)]">
            {t("sectors.common.contact.subtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-2">
            {checks.map((check) => (
              <div
                key={check}
                className="flex items-center gap-3 px-3.5 py-3 text-sm font-medium text-[var(--pf-fg)]"
                style={{
                  border: "1px solid var(--pf-border)",
                  background: "var(--pf-bg-card-2)",
                }}
              >
                <span className="h-2 w-2 bg-[#FF6A13]" />
                {check}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "var(--pf-bg-card-3)",
            padding: "clamp(28px, 3vw, 44px)",
          }}
        >
          <ContactForm />
        </div>
      </div>
    </RevealSection>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Page                                                     */
/* ──────────────────────────────────────────────────────── */

type SectionKey =
  | "challenge"
  | "useCases"
  | "workflow"
  | "security"
  | "example"
  | "insights"
  | "criteria"
  | "integration"
  | "comparison"
  | "deployment"
  | "faq"
  | "contact";

const SECTION_COMPONENTS: Record<
  SectionKey,
  (props: SectionProps) => React.ReactElement
> = {
  challenge: Challenge,
  useCases: UseCases,
  workflow: WorkflowRag,
  security: Security,
  example: SourcedExample,
  insights: SectorInsights,
  criteria: SectorCriteria,
  integration: SectorIntegration,
  comparison: GenericComparison,
  deployment: Deployment,
  faq: SectorFaq,
  contact: SectorContact,
};

/**
 * L'ordre des sections suit la hiérarchie d'arguments du secteur :
 * juridique → la preuve d'abord, santé → la sécurité d'abord,
 * finance → la vitesse d'abord.
 *
 * Finance a été reconstruite pour coller aux problématiques du secteur
 * (preuves tirées de la démo, critères de fiabilité propres à la finance)
 * plutôt que de dérouler les sections génériques de la home ; juridique et
 * santé gardent la structure précédente en attendant la même passe.
 */
const SECTION_ORDER: Record<SectorId, SectionKey[]> = {
  legal: [
    "challenge",
    "example",
    "useCases",
    "workflow",
    "security",
    "comparison",
    "deployment",
    "faq",
    "contact",
  ],
  healthcare: [
    "challenge",
    "security",
    "useCases",
    "example",
    "workflow",
    "comparison",
    "deployment",
    "faq",
    "contact",
  ],
  finance: [
    "challenge",
    "insights",
    "criteria",
    "integration",
    "comparison",
    "deployment",
    "faq",
    "contact",
  ],
};

type SectorPageProps = {
  lang?: string;
  sector: SectorId;
};

export function SectorPage({ lang, sector }: SectorPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (lang === "fr" || lang === "en") {
      i18n.changeLanguage(lang).catch(() => undefined);
    }
  }, [lang]);

  return (
    <div
      className="relative min-h-screen [overflow-anchor:none]"
      style={{ background: "var(--pf-bg)" }}
    >
      {/* Grille de fond statique */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--pf-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--pf-grid-line) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Halo orange */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 44% at 50% -6%, rgba(255,106,19,0.07), transparent 62%)",
        }}
      />

      {/* Navbar identique sur toutes les pages : mêmes liens que la home. */}
      <LandingNavbar badge={t(`sectors.${sector}.label`)} />

      <main className="relative z-10 [overflow-anchor:none]">
        <div
          className="mx-auto max-w-[1360px] border-x border-[var(--pf-border)] [overflow-anchor:none]"
          style={{ background: "var(--pf-column-bg)" }}
        >
          <SectorHero sector={sector} />

          {SECTION_ORDER[sector].map((key, index) => {
            const SectionComponent = SECTION_COMPONENTS[key];

            return (
              <Fragment key={key}>
                <Divider />
                <SectionComponent
                  number={String(index + 1).padStart(2, "0")}
                  sector={sector}
                />
              </Fragment>
            );
          })}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
