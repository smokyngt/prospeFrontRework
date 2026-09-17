"use client";

import {
  Brain,
  CheckCheck,
  Database,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  type LucideIcon,
  Pencil,
  Quote,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type React from "react";

const ACCENT = "#FF6A13";

/* Semantic states — aligned on the landing palette */
/**
 * Compose une teinte translucide par-dessus un aplat opaque, pour que les
 * elements des illustrations restent pleins quel que soit le fond derriere eux.
 */
function opaqueTint(tint: string): string {
  return `linear-gradient(${tint}, ${tint}), var(--pf-bg)`;
}

const OK_TEXT = "text-[#16A34A] dark:text-[#4ADE80]";
const OK_BOX = {
  background: opaqueTint("rgba(22,163,74,0.08)"),
  border: "1px solid rgba(22,163,74,0.28)",
};
const PANEL = { background: "var(--pf-bg)", border: "1px solid var(--pf-border)" };
const ACCENT_BOX = {
  background: opaqueTint("var(--pf-accent-bg)"),
  border: "1px solid var(--pf-accent-dim-border)",
};

type FeatureId =
  | "precision"
  | "coverage"
  | "governance"
  | "orchestration"
  | "differentiation";

/* ──────────────────────────────────────────────────────── */
/*  Shared primitives — sharp/bordered, zero radius            */
/* ──────────────────────────────────────────────────────── */

/** Accent citation marker. */
function Ref({ n }: { n: string }) {
  return (
    <sup className="text-[9px] font-bold" style={{ color: ACCENT }}>
      {n}
    </sup>
  );
}

function PopChip({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5", className)} style={style}>
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  01 — precision: sourced, verifiable answer                */
/* ──────────────────────────────────────────────────────── */

function CitedAnswerIllustration() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full min-w-0 flex-col">
      <p className="m-0 text-[13px] leading-[1.7] text-[var(--pf-fg-muted)]">
        {t("features.illustrations.citedAnswer.answerLead")}
        <span className="font-semibold" style={{ color: ACCENT }}>
          {t("features.illustrations.citedAnswer.valueReported")}
        </span>
        {t("features.illustrations.citedAnswer.answerMid1")}
        <Ref n="1" />
      </p>

      <div className="mt-4 flex items-center gap-2.5 px-3 py-3" style={PANEL}>
        <FileText size={15} className="shrink-0" style={{ color: ACCENT }} />
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--pf-fg)]">
          {t("features.illustrations.citedAnswer.file1")}
        </span>
        <PopChip
          className="font-mono text-[10.5px]"
          style={{
            color: ACCENT,
            ...ACCENT_BOX,
            padding: "3px 8px",
            animation: "pf-elem-pulse 2.6s ease-in-out infinite",
          }}
        >
          {t("features.illustrations.citedAnswer.ref1")}
        </PopChip>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  02 — coverage: hybrid search                              */
/* ──────────────────────────────────────────────────────── */

const SEARCH_METHODS: { icon: LucideIcon; key: string }[] = [
  { icon: Brain, key: "methodSemantic" },
  { icon: SlidersHorizontal, key: "methodKeyword" },
  { icon: ImageIcon, key: "methodVisual" },
  { icon: Layers, key: "methodContext" },
];

function HybridSearchIllustration() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex items-center gap-2.5 px-3 py-2.5" style={PANEL}>
        <Search size={16} className="shrink-0" style={{ color: "var(--pf-fg-dim)" }} />
        <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: "var(--pf-fg-dim)" }}>
          {t("features.illustrations.hybridSearch.placeholder")}
        </span>
      </div>

      <div className="mt-3.5 flex justify-center gap-3">
        {SEARCH_METHODS.map((m, i) => (
          <span
            key={m.key}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center"
            style={{
              ...ACCENT_BOX,
              color: ACCENT,
              animation: "pf-elem-pulse 3.2s ease-in-out infinite",
              animationDelay: `${i * 0.45}s`,
            }}
          >
            <m.icon size={16} />
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex items-center gap-1.5 px-3 py-3" style={PANEL}>
        <FileText size={14} className="shrink-0" style={{ color: "var(--pf-fg-dim)" }} />
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--pf-fg)]">
          {t("features.illustrations.hybridSearch.resultFile")}
        </span>
        <span className="shrink-0 font-mono text-[10.5px]" style={{ color: "var(--pf-fg-dim)" }}>
          {t("features.illustrations.hybridSearch.resultPage")}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  03 — performance: synthesis framed by sources             */
/* ──────────────────────────────────────────────────────── */

const SYNTHESIS_SOURCES = ["sourceFile1", "sourceFile2"];

function SynthesisIllustration() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 items-center gap-4 [--pf-dash:var(--pf-border-2)]">
      <div className="flex shrink-0 flex-col gap-2">
        {SYNTHESIS_SOURCES.map((key) => (
          <span
            key={key}
            className="inline-flex w-[150px] items-center gap-1.5 px-2.5 py-2 font-mono text-[10.5px]"
            style={{ ...PANEL, color: "var(--pf-fg-muted)" }}
          >
            <FileText size={13} className="shrink-0" style={{ color: ACCENT }} />
            <span className="truncate">{t(`features.illustrations.synthesis.${key}`)}</span>
          </span>
        ))}
      </div>

      <div className="relative h-0.5 w-[46px] shrink-0 self-center">
        <div
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(90deg, var(--pf-dash) 0 4px, transparent 4px 9px)",
            animation: "pf-dash-slide 0.85s linear infinite",
          }}
        />
      </div>

      <div className="min-w-0 flex-1 px-4 py-4" style={PANEL}>
        <div className="flex items-center gap-2">
          <span
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center"
            style={{ ...ACCENT_BOX, color: ACCENT, animation: "pf-elem-pulse 2.8s ease-in-out infinite" }}
          >
            <Sparkles size={14} />
          </span>
          <span className="text-[12.5px] font-bold text-[var(--pf-fg)]">
            {t("features.illustrations.synthesis.cardTitle")}
          </span>
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5">
          <div className="h-[7px] w-full" style={{ background: "var(--pf-bg-dim)" }} />
          <div className="flex items-center gap-1.5">
            <div className="h-[7px] w-[38%]" style={{ background: "var(--pf-bg-dim)" }} />
            <div
              className="h-[7px] w-[26%]"
              style={{ background: opaqueTint("var(--pf-accent-highlight)") }}
            />
            <Ref n="1" />
            <div className="h-[7px] w-[20%]" style={{ background: "var(--pf-bg-dim)" }} />
          </div>
          <div className="h-[7px] w-[88%]" style={{ background: "var(--pf-bg-dim)" }} />
          <div className="flex items-center gap-2">
            <div className="h-[7px] w-[46%]" style={{ background: "var(--pf-bg-dim)" }} />
            <PopChip
              className="font-mono text-[10.5px] font-semibold"
              style={{ color: ACCENT, ...ACCENT_BOX, padding: "2px 8px" }}
            >
              {t("features.illustrations.synthesis.value")}
            </PopChip>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  04 — governance: role and store access                    */
/* ──────────────────────────────────────────────────────── */

const STORES = [
  { key: "store1", icon: Pencil, accent: true, ok: false },
  { key: "store3", icon: Lock, accent: false, ok: true },
];

function GovernanceIllustration() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--pf-fg-muted)" }}>
          <Database size={13} />
          {t("features.illustrations.governance.storesLabel")}
        </span>
      </div>

      {STORES.map((store) => (
        <div
          key={store.key}
          className="flex items-center gap-2.5 px-3 py-2.5"
          style={store.accent ? ACCENT_BOX : PANEL}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            style={
              store.accent
                ? {
                    background: "var(--pf-bg)",
                    border: "1px solid var(--pf-accent-dim-border)",
                    color: ACCENT,
                    animation: "pf-elem-pulse 2.4s ease-in-out infinite",
                  }
                : { background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)", color: "var(--pf-fg-muted)" }
            }
          >
            <Database size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold text-[var(--pf-fg)]">
              {t(`features.illustrations.governance.${store.key}Name`)}
            </div>
          </div>
          <PopChip
            className={cn("text-[10.5px] font-semibold", store.ok && OK_TEXT)}
            style={
              store.accent
                ? { color: ACCENT, ...ACCENT_BOX, padding: "4px 10px" }
                : store.ok
                  ? { ...OK_BOX, padding: "4px 10px" }
                  : {
                      color: "var(--pf-fg-muted)",
                      background: "var(--pf-bg-card)",
                      border: "1px solid var(--pf-border)",
                      padding: "4px 10px",
                    }
            }
          >
            <store.icon size={11} />
            {t(`features.illustrations.governance.${store.key}Role`)}
          </PopChip>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  05 — orchestration: business review workflow               */
/* ──────────────────────────────────────────────────────── */

const REVIEW_STEPS: { icon: LucideIcon; key: string; accent: boolean }[] = [
  { icon: Search, key: "stepSearch", accent: false },
  { icon: Quote, key: "stepAnswer", accent: true },
  { icon: CheckCheck, key: "stepVerify", accent: false },
];

function ReviewFlowIllustration() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 flex-col [--pf-dash:var(--pf-border-2)]">
      <div className="flex flex-col items-center">
        {REVIEW_STEPS.map((step, i) => (
          <div key={step.key} className="flex w-full flex-col items-center">
            {i > 0 && (
              <div className="relative h-[15px] w-full">
                <div
                  className="absolute top-0 bottom-0 left-1/2 -ml-px w-0.5"
                  style={{
                    background: "repeating-linear-gradient(180deg, var(--pf-dash) 0 4px, transparent 4px 9px)",
                    animation: "pf-dash-slide 0.85s linear infinite",
                  }}
                />
              </div>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold"
              style={
                step.accent
                  ? { ...ACCENT_BOX, color: ACCENT }
                  : { ...PANEL, color: "var(--pf-fg-muted)" }
              }
            >
              <step.icon size={13} />
              {t(`features.illustrations.reviewFlow.${step.key}`)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center px-3 py-3" style={PANEL}>
        <span
          className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-semibold", OK_TEXT)}
          style={{ ...OK_BOX, animation: "pf-verify-pulse 2.4s ease-in-out infinite" }}
        >
          <ShieldCheck size={12} />
          {t("features.illustrations.reviewFlow.verified")}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  06 — differentiation: data sovereignty                     */
/* ──────────────────────────────────────────────────────── */

const SOVEREIGNTY_MODES = ["modeDedicated", "modeLocal"];

function SovereigntyIllustration() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 justify-center py-2">
      <div
        className="relative w-[210px] px-5 pt-6 pb-[18px]"
        style={{
          border: "1.5px dashed var(--pf-accent-dim-border)",
          background: opaqueTint("var(--pf-accent-bg)"),
        }}
      >
        <span
          className="absolute -top-[10px] left-1/2 -translate-x-1/2 px-2.5 py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.08em] whitespace-nowrap"
          style={{ color: ACCENT, background: "var(--pf-bg)", border: "1px solid var(--pf-accent-dim-border)" }}
        >
          {t("features.illustrations.sovereignty.perimeter")}
        </span>

        <div className="flex justify-center">
          <span
            className="relative flex h-[60px] w-[60px] items-center justify-center"
            style={{ background: "var(--pf-bg)", border: "1px solid var(--pf-accent-dim-border)", color: ACCENT }}
          >
            <Database size={26} />
            <PopChip
              className={cn("absolute -right-[9px] -bottom-[9px] h-[26px] w-[26px] justify-center", OK_TEXT)}
              style={{
                background: opaqueTint("rgba(22,163,74,0.16)"),
                border: "2px solid var(--pf-bg-card)",
                animation: "pf-verify-pulse 2.6s ease-in-out infinite",
              }}
            >
              <Lock size={13} />
            </PopChip>
          </span>
        </div>

        <div className="mt-[18px] flex flex-wrap justify-center gap-1.5">
          {SOVEREIGNTY_MODES.map((key) => (
            <PopChip
              key={key}
              className="text-[10.5px] font-semibold"
              style={{
                color: "var(--pf-fg-muted)",
                background: "var(--pf-bg)",
                border: "1px solid var(--pf-border)",
                padding: "4px 11px",
              }}
            >
              {t(`features.illustrations.sovereignty.${key}`)}
            </PopChip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Bento card shells                                         */
/* ──────────────────────────────────────────────────────── */

function FeatureText({ id, wide = false }: { id: FeatureId; wide?: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center text-center",
        !wide && "lg:min-h-[82px]",
      )}
    >
      <h3
        className="m-0 font-semibold leading-[1.16] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: wide ? "clamp(1.35rem, 1.8vw, 1.7rem)" : "1.28rem" }}
      >
        {t(`features.items.${id}.title`)}
      </h3>
      <p
        className={cn(
          "mt-2.5 text-[13.5px] leading-[1.5] text-[var(--pf-fg-muted)]",
          wide ? "max-w-[620px]" : "max-w-[440px]",
        )}
      >
        {t(`features.items.${id}.short`)}
      </p>
    </div>
  );
}

function FeatureCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex h-full cursor-default flex-col gap-5 p-5 sm:p-6",
        className,
      )}
      style={{ background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)" }}
    >
      {children}
    </div>
  );
}

/**
 * Surface propre aux illustrations : aplat clair, cadre. Elle detache
 * visuellement le schema du texte de la carte, qui reste sur `--pf-bg-card`.
 */
function FeatureIllustration({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-center p-4 sm:p-5"
      style={{
        background: "var(--pf-bg)",
        border: "1px solid var(--pf-border)",
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Section                                                   */
/* ──────────────────────────────────────────────────────── */

export default function ProsperifyFeatures() {
  const { t } = useTranslation();

  return (
    <div className="[overflow-anchor:none]">
      <h2
        className="m-0 mx-auto max-w-[820px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("features.title")}{" "}
        <span className="text-[#FF6A13]">{t("features.titleHighlight")}</span>
      </h2>

      <div
        className={cn(
          "mt-11 grid grid-cols-1 gap-4",
          "sm:grid-cols-2 lg:grid-cols-6 lg:items-stretch",
        )}
      >
        {/* 01 — réponses sourcées et vérifiables */}
        <FeatureCard className="sm:col-span-2 lg:col-span-2">
          <FeatureIllustration>
            <CitedAnswerIllustration />
          </FeatureIllustration>
          <FeatureText id="precision" />
        </FeatureCard>

        {/* 02 — recherche et synthèse hybrides : les deux illustrations réunies */}
        <FeatureCard className="sm:col-span-2 lg:col-span-4">
          {/*
            Une seule surface pour les deux schemas : deux boites separees se
            calaient chacune sur la hauteur de son contenu et ne tombaient donc
            jamais a la meme echelle. Les deux moities sont ici en `flex-1`,
            donc de largeur identique, et centrees dans la meme hauteur.
          */}
          <FeatureIllustration>
            <div className="flex w-full min-w-0 flex-col gap-7 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <HybridSearchIllustration />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <SynthesisIllustration />
              </div>
            </div>
          </FeatureIllustration>
          <FeatureText id="coverage" wide />
        </FeatureCard>

        {/* 03 — accès contrôlés par rôle et par store */}
        <FeatureCard className="lg:col-span-2">
          <FeatureIllustration>
            <GovernanceIllustration />
          </FeatureIllustration>
          <FeatureText id="governance" />
        </FeatureCard>

        {/* 04 — workflow de revue */}
        <FeatureCard className="lg:col-span-2">
          <FeatureIllustration>
            <ReviewFlowIllustration />
          </FeatureIllustration>
          <FeatureText id="orchestration" />
        </FeatureCard>

        {/* 05 — souveraineté des données */}
        <FeatureCard className="sm:col-span-2 lg:col-span-2">
          <FeatureIllustration>
            <SovereigntyIllustration />
          </FeatureIllustration>
          <FeatureText id="differentiation" />
        </FeatureCard>

      </div>
    </div>
  );
}
