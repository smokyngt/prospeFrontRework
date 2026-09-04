"use client";

import {
  Archive,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Folder,
  type LucideIcon,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type React from "react";

const ACCENT = "#FF6A13";
const REVEAL_MS = 380;
const REVEAL_STAGGER_MS = 90;

const PANEL = { background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)" };
const PANEL_2 = { background: "var(--pf-bg-card-2)", border: "1px solid var(--pf-border)" };

const STORE_ICONS: LucideIcon[] = [Database, Folder];

type Citation = { label: string; page: string };
type Store = { meta: string; name: string };

/* ──────────────────────────────────────────────────────── */
/*  01 — data store picker                                   */
/* ──────────────────────────────────────────────────────── */

function ConnectVisual() {
  const { t } = useTranslation();
  const selected = t("workflow.cards.connect.selected", { returnObjects: true }) as Store[];
  const excluded = t("workflow.cards.connect.excluded", { returnObjects: true }) as Store;

  return (
    <div className="flex h-full w-full min-w-0 flex-col p-5" style={PANEL}>
      <div
        className="flex items-center gap-2.5 px-3.5 py-3"
        style={{ background: "var(--pf-bg-card-2)", border: "1px solid var(--pf-border-2)", color: "var(--pf-fg-dim)" }}
      >
        <Search size={17} className="shrink-0" />
        <span className="truncate text-[13.5px] font-medium">
          {t("workflow.cards.connect.searchPlaceholder")}
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {selected.map((store, i) => {
          const Icon = STORE_ICONS[i] ?? Database;
          return (
            <div
              key={store.name}
              className="flex items-center gap-3 px-3.5 py-3"
              style={{ background: "var(--pf-bg-card-2)", border: "1px solid var(--pf-border-2)" }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center"
                style={{ background: "var(--pf-bg)", border: "1px solid var(--pf-border-2)", color: "var(--pf-fg-muted)" }}
              >
                <Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-[var(--pf-fg)]">{store.name}</div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--pf-fg-dim)]">{store.meta}</div>
              </div>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center"
                style={{ background: ACCENT, color: "var(--pf-on-accent)" }}
              >
                <Check size={13} />
              </span>
            </div>
          );
        })}

        <div
          className="flex items-center gap-3 px-3.5 py-3"
          style={{ background: "var(--pf-bg-card-2)", border: "1px dashed var(--pf-border-2)" }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            style={{ background: "var(--pf-bg)", border: "1px solid var(--pf-border)", color: "var(--pf-fg-dim)" }}
          >
            <Archive size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-medium text-[var(--pf-fg-dim)] line-through">
              {excluded.name}
            </div>
            <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--pf-fg-dim)]">{excluded.meta}</div>
          </div>
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={{ border: "1px solid var(--pf-border-2)", color: "var(--pf-fg-dim)" }}
          >
            <X size={13} />
          </span>
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-2.5 pt-3.5 font-mono text-[11px] tracking-[0.04em] text-[var(--pf-fg-muted)]"
        style={{ borderTop: "1px solid var(--pf-border)" }}
      >
        <Check size={15} className="shrink-0" style={{ color: "var(--pf-fg-muted)" }} />
        {t("workflow.cards.connect.summary")}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  02 — document viewer (étape mise en avant)               */
/* ──────────────────────────────────────────────────────── */

function SearchVisual() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full min-w-0 flex-col" style={PANEL_2}>
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: "var(--pf-bg-card)", borderBottom: "1px solid var(--pf-border)" }}
      >
        <FileText size={17} className="shrink-0" style={{ color: "var(--pf-fg-dim)" }} />
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-medium text-[var(--pf-fg)]">
          {t("workflow.cards.search.fileName")}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[12px] text-[var(--pf-fg-muted)]">
          <ChevronLeft size={15} />
          <span style={{ color: "var(--pf-fg)" }}>{t("workflow.cards.search.page")}</span>
          <ChevronRight size={15} />
        </span>
      </div>

      <div className="flex-1 px-5 pt-5 pb-6">
        <div className="text-[15px] font-bold tracking-[-0.01em] text-[var(--pf-fg)]">
          {t("workflow.cards.search.articleTitle")}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <div className="h-2 w-full" style={{ background: "var(--pf-border)" }} />
          <div className="h-2 w-[92%]" style={{ background: "var(--pf-border)" }} />
        </div>

        <div
          className="mt-4 px-4 py-3.5"
          style={{
            background: "var(--pf-accent-bg-2)",
            border: "1px solid var(--pf-accent-dim-border)",
            borderLeft: `3px solid ${ACCENT}`,
          }}
        >
          <p className="m-0 text-[13.5px] leading-[1.5] font-medium" style={{ color: "var(--pf-fg)" }}>
            {t("workflow.cards.search.highlight")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  03 — cited answer                                        */
/* ──────────────────────────────────────────────────────── */

function CiteVisual() {
  const { t } = useTranslation();
  const citations = t("workflow.cards.cite.citations", { returnObjects: true }) as Citation[];

  return (
    <div className="flex h-full w-full min-w-0 flex-col p-5" style={PANEL}>
      <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.04em] text-[var(--pf-fg-dim)]">
        <Database size={14} className="shrink-0" />
        <span className="truncate">{t("workflow.cards.cite.storeLabel")}</span>
      </div>

      <div
        className="mt-3.5 max-w-[84%] self-end px-3.5 py-3"
        style={{ background: ACCENT, color: "var(--pf-on-accent)" }}
      >
        <p className="m-0 text-[13px] leading-[1.45] font-semibold">
          {t("workflow.cards.cite.question")}
        </p>
      </div>

      <div className="mt-3 px-4 py-3.5" style={PANEL_2}>
        <div
          className="mb-2.5 flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] uppercase"
          style={{ color: "var(--pf-fg-muted)" }}
        >
          <span
            className="flex h-[15px] w-[15px] items-center justify-center"
            style={{ background: "var(--pf-bg-card-2)", color: "var(--pf-fg-muted)" }}
          >
            <Sparkles size={9} />
          </span>
          {t("workflow.cards.cite.agentLabel")}
        </div>
        <p className="m-0 text-[13.5px] leading-[1.55] font-medium text-[var(--pf-fg)]">
          {t("workflow.cards.cite.answerStart")}
          <span style={{ color: ACCENT }}>{t("workflow.cards.cite.answerHighlight")}</span>
          {t("workflow.cards.cite.answerEnd")}
          <span
            className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center px-1 align-middle font-mono text-[10px] font-bold"
            style={{ background: ACCENT, color: "var(--pf-on-accent)" }}
          >
            1
          </span>
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-3 font-mono text-[9px] tracking-[0.18em]" style={{ color: "var(--pf-fg-dim)" }}>
          {t("workflow.cards.cite.sourcesLabel")}
        </div>
        <div className="flex flex-col gap-2">
          {citations.map((citation) => (
            <div key={citation.label} className="flex items-center gap-3 px-3.5 py-3" style={PANEL_2}>
              <FileText size={16} className="shrink-0" style={{ color: "var(--pf-fg-dim)" }} />
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--pf-fg)]">
                {citation.label}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-medium" style={{ color: "var(--pf-fg-muted)" }}>
                {citation.page}
              </span>
              <ExternalLink size={14} className="shrink-0 text-[var(--pf-fg-dim)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Libellé d'étape — sous chaque visuel                     */
/* ──────────────────────────────────────────────────────── */

function StepLabel({ card, number }: { card: string; number: string }) {
  const { t } = useTranslation();

  return (
    <div className="pt-6 text-center">
      <div className="flex items-center justify-center font-mono text-[12px] tracking-[0.16em]">
        <span style={{ color: "var(--pf-fg-dim)" }}>{number}</span>
        <span className="px-2" />
        <span style={{ color: "var(--pf-fg-muted)" }}>
          {t(`workflow.cards.${card}.tag`)}
        </span>
      </div>
      <h3 className="m-0 mt-3 text-[20px] leading-[1.2] font-bold tracking-[-0.02em] text-[var(--pf-fg)]">
        {t(`workflow.cards.${card}.title`)}
      </h3>
      <p className="m-0 mt-2 text-[14.5px] leading-[1.5] text-[var(--pf-fg-muted)]">
        {t(`workflow.cards.${card}.description`)}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 lg:self-center lg:px-0">
      <ArrowRight
        size={24}
        style={{ color: "var(--pf-fg-dim)" }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Section                                                  */
/* ──────────────────────────────────────────────────────── */

function WorkflowSection() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(true);
  const [revealed, setRevealed] = useState(false);

  /* Reduced motion — skip straight to the finished state */
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimated(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /* One-shot reveal — the columns animate in together, once, when they scroll into view */
  useEffect(() => {
    const element = rootRef.current;
    if (!element || !animated) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [animated]);

  const shown = !animated || revealed;

  const revealStyle = (index: number): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(14px)",
    transition: animated
      ? `opacity ${REVEAL_MS}ms ease ${index * REVEAL_STAGGER_MS}ms, transform ${REVEAL_MS}ms ease ${index * REVEAL_STAGGER_MS}ms`
      : "none",
  });

  return (
    <div ref={rootRef} className="[overflow-anchor:none]">
      <h2
        className="m-0 mx-auto max-w-[900px] text-center leading-[1.06] font-bold tracking-[-0.025em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("workflow.title")}
        <br />
        <span className="text-[#FF6A13]">{t("workflow.titleHighlight")}</span>
      </h2>
      <p className="mx-auto mt-[18px] max-w-[620px] text-center text-[1.05rem] leading-[1.6] text-[var(--pf-fg-muted)]">
        {t("workflow.subtitle")}
      </p>

      {/*
        Le flux reste horizontal a toutes les tailles. Sous `lg` : defilement
        lateral aimante, une etape par ecran. A partir de `lg` : les enveloppes
        d'etape passent en `display: contents`, leurs enfants redeviennent des
        elements de la grille — visuels sur la premiere ligne, libelles alignes
        sur la seconde, quelle que soit la hauteur des visuels.
      */}
      <div
        className={cn(
          "mt-11 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:-mx-8 sm:px-8",
          "lg:mx-0 lg:grid lg:grid-cols-[1fr_44px_1fr_44px_1fr] lg:items-stretch",
          "lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0",
        )}
      >
        <div className="flex w-[86%] shrink-0 snap-center flex-col lg:contents">
          <div style={revealStyle(0)} className="flex min-w-0 lg:col-start-1 lg:row-start-1">
            <ConnectVisual />
          </div>
          <div style={revealStyle(0)} className="min-w-0 lg:col-start-1 lg:row-start-2">
            <StepLabel card="connect" number="01" />
          </div>
        </div>

        {/* les fleches enjambent les deux lignes : centrees sur le bloc entier */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-end-3 lg:self-center">
          <FlowArrow />
        </div>

        <div className="flex w-[86%] shrink-0 snap-center flex-col lg:contents">
          <div style={revealStyle(1)} className="flex min-w-0 lg:col-start-3 lg:row-start-1">
            <SearchVisual />
          </div>
          <div style={revealStyle(1)} className="min-w-0 lg:col-start-3 lg:row-start-2">
            <StepLabel card="search" number="02" />
          </div>
        </div>

        <div className="lg:col-start-4 lg:row-start-1 lg:row-end-3 lg:self-center">
          <FlowArrow />
        </div>

        <div className="flex w-[86%] shrink-0 snap-center flex-col lg:contents">
          <div style={revealStyle(2)} className="flex min-w-0 lg:col-start-5 lg:row-start-1">
            <CiteVisual />
          </div>
          <div style={revealStyle(2)} className="min-w-0 lg:col-start-5 lg:row-start-2">
            <StepLabel card="cite" number="03" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { WorkflowSection };
