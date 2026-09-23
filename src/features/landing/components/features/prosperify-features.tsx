"use client";

import {
  Brain,
  CheckCheck,
  ChevronRight,
  Database,
  Download,
  Eye,
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

import { Tabs } from "./animated-tabs";

import type { Tab } from "./animated-tabs";
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
/*  Shared bits — skeletons, keyword highlight, red state     */
/* ──────────────────────────────────────────────────────── */

const RED_TEXT = "text-[#DC2626] dark:text-[#F87171]";
const RED_BOX = {
  background: opaqueTint("rgba(220,38,38,0.08)"),
  border: "1px solid rgba(220,38,38,0.32)",
};

/** Ligne de texte factice : jamais lue, elle figure seulement la forme d'une réponse. */
function Skeleton({ accent, className }: { accent?: boolean; className?: string }) {
  return (
    <div
      className={cn("h-[7px]", className)}
      style={{ background: accent ? opaqueTint("var(--pf-accent-highlight)") : "var(--pf-bg-dim)" }}
    />
  );
}

/** Met en gras orange les termes de la requête retrouvés dans `text`. */
function Highlighted({ terms, text }: { terms: string[]; text: string }) {
  if (terms.length === 0) return <>{text}</>;
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "i"));
  return (
    <>
      {parts.map((part, i) =>
        terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="font-bold" style={{ color: ACCENT }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function useTerms(key: string): string[] {
  const { t } = useTranslation();
  const terms = t(key, { returnObjects: true });
  return Array.isArray(terms) ? (terms as string[]) : [];
}

/* ──────────────────────────────────────────────────────── */
/*  01 — precision: sourced, verifiable answer                */
/* ──────────────────────────────────────────────────────── */

function SourceRow({ file, matched, page, terms }: { file: string; matched: boolean; page: string; terms: string[] }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2" style={matched ? ACCENT_BOX : PANEL}>
      <FileText size={14} className="shrink-0" style={{ color: matched ? ACCENT : "var(--pf-fg-dim)" }} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-mono text-[11.5px]",
          matched ? "text-[var(--pf-fg)]" : "text-[var(--pf-fg-muted)]",
        )}
      >
        <Highlighted terms={terms} text={file} />
      </span>
      <PopChip
        className="font-mono text-[10.5px]"
        style={{ color: matched ? ACCENT : "var(--pf-fg-dim)", ...(matched ? ACCENT_BOX : PANEL), padding: "3px 8px" }}
      >
        {page}
      </PopChip>
    </div>
  );
}

function CitedAnswerIllustration() {
  const { t } = useTranslation();
  const k = "features.illustrations.citedAnswer";
  const terms = useTerms(`${k}.terms`);
  const fileTerms = terms.filter((term) => !term.includes(" "));

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <span
        className="self-end px-3 py-1.5 text-[11.5px] font-medium text-[var(--pf-fg-muted)]"
        style={ACCENT_BOX}
      >
        <Highlighted terms={terms} text={t(`${k}.question`)} />
      </span>

      <div className="flex flex-col gap-2.5 px-4 py-3.5" style={PANEL}>
        <div className="flex items-center gap-2">
          <span
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center"
            style={{ ...ACCENT_BOX, color: ACCENT }}
          >
            <Sparkles size={12} />
          </span>
          <span className={cn("ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold", OK_TEXT)}>
            <ShieldCheck size={12} />
            {t("features.illustrations.reviewFlow.verified")}
          </span>
        </div>
        <Skeleton className="w-full" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-[38%]" />
          <Skeleton accent className="w-[24%]" />
          <Ref n="1" />
          <Skeleton className="w-[18%]" />
        </div>
        <Skeleton className="w-[86%]" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-[46%]" />
          <Skeleton accent className="w-[20%]" />
          <Ref n="2" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SourceRow matched file={t(`${k}.file1`)} page={t(`${k}.ref1`)} terms={fileTerms} />
        <div className="flex flex-col gap-1.5 border-l-2 pl-3" style={{ borderColor: ACCENT }}>
          <Skeleton className="w-full" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-[34%]" />
            <Skeleton accent className="w-[30%]" />
            <Skeleton className="w-[20%]" />
          </div>
        </div>
        <SourceRow matched={false} file={t(`${k}.file2`)} page={t(`${k}.ref2`)} terms={fileTerms} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  02 — coverage: the question and its search modalities     */
/* ──────────────────────────────────────────────────────── */

const SEARCH_METHODS: { icon: LucideIcon; key: string }[] = [
  { icon: Brain, key: "methodSemantic" },
  { icon: SlidersHorizontal, key: "methodKeyword" },
  { icon: ImageIcon, key: "methodVisual" },
  { icon: Layers, key: "methodContext" },
];

/** Aperçu minimal propre à chaque modalité de recherche. */
function MethodPreview({ method }: { method: string }) {
  if (method === "methodSemantic") {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 0.7, 0.45, 0.25].map((opacity) => (
          <span key={opacity} className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT, opacity }} />
        ))}
      </div>
    );
  }
  if (method === "methodKeyword") {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <Skeleton className="w-full" />
        <div className="flex gap-1">
          <Skeleton className="w-[35%]" />
          <Skeleton accent className="w-[40%]" />
        </div>
      </div>
    );
  }
  if (method === "methodVisual") {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="h-8 w-9 shrink-0" style={{ ...PANEL, background: opaqueTint("var(--pf-accent-bg)") }} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="w-full" />
          <Skeleton className="w-[60%]" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col gap-1">
      <Skeleton className="w-[90%]" />
      <Skeleton accent className="ml-2 w-[80%]" />
      <Skeleton className="ml-4 w-[70%]" />
    </div>
  );
}

function CoverageIllustration() {
  const { t } = useTranslation();
  const k = "features.illustrations.hybridSearch";
  const terms = useTerms(`${k}.terms`);
  const dashed = "repeating-linear-gradient(180deg, var(--pf-accent-dim-border) 0 4px, transparent 4px 8px)";

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex items-center gap-3 px-4 py-3.5" style={ACCENT_BOX}>
        <Search size={17} className="shrink-0" style={{ color: ACCENT }} />
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--pf-fg-muted)]">
          <Highlighted terms={terms} text={t(`${k}.placeholder`)} />
        </span>
      </div>

      <div className="mx-auto hidden h-4 w-0.5 sm:block" style={{ background: dashed }} />
      <div
        className="mx-[12.5%] hidden border-t-[1.5px] border-dashed sm:block"
        style={{ borderColor: "var(--pf-accent-dim-border)" }}
      />

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-0 sm:grid-cols-4">
        {SEARCH_METHODS.map((method) => (
          <div key={method.key} className="flex flex-col items-center">
            <div className="hidden h-3 w-0.5 sm:block" style={{ background: dashed }} />
            <div className="flex w-full flex-1 flex-col gap-3 px-3 py-3" style={PANEL}>
              <span
                className="flex h-8 w-8 items-center justify-center"
                style={{ ...ACCENT_BOX, color: ACCENT }}
              >
                <method.icon size={16} />
              </span>
              <span className="text-[12px] font-bold text-[var(--pf-fg)]">{t(`${k}.${method.key}`)}</span>
              <MethodPreview method={method.key} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  03 — governance: role and store access                    */
/* ──────────────────────────────────────────────────────── */

const PERMISSIONS: { icon: LucideIcon; key: string }[] = [
  { icon: Eye, key: "permRead" },
  { icon: Pencil, key: "permWrite" },
  { icon: Download, key: "permExport" },
];

const STORES = [
  { key: "store1", accent: true, restricted: false, perms: [true, true, true] },
  { key: "store2", accent: false, restricted: false, perms: [true, false, true] },
  { key: "store3", accent: false, restricted: true, perms: [false, false, false] },
];

function GovernanceIllustration() {
  const { t } = useTranslation();
  const k = "features.illustrations.governance";

  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5">
      <span
        className="inline-flex items-center gap-1.5 px-0.5 text-[11px] font-bold"
        style={{ color: "var(--pf-fg-muted)" }}
      >
        <Database size={13} />
        {t(`${k}.storesLabel`)}
      </span>

      {STORES.map((store) => (
        <div
          key={store.key}
          className="flex items-center gap-2.5 px-3 py-2.5"
          style={store.accent ? ACCENT_BOX : PANEL}
        >
          <span
            className={cn("flex h-8 w-8 shrink-0 items-center justify-center", store.restricted && RED_TEXT)}
            style={
              store.accent
                ? {
                    background: "var(--pf-bg)",
                    border: "1px solid var(--pf-accent-dim-border)",
                    color: ACCENT,
                  }
                : store.restricted
                  ? RED_BOX
                  : { background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)", color: "var(--pf-fg-muted)" }
            }
          >
            {store.restricted ? <Lock size={15} /> : <Database size={15} />}
          </span>
          <div className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-[var(--pf-fg)]">
            {t(`${k}.${store.key}Name`)}
          </div>
          <div className="flex shrink-0 gap-1">
            {PERMISSIONS.map((perm, i) => (
              <span
                key={perm.key}
                title={t(`${k}.${perm.key}`)}
                className="flex h-[22px] w-[22px] items-center justify-center"
                style={
                  store.perms[i]
                    ? { ...ACCENT_BOX, color: ACCENT }
                    : { ...PANEL, color: "var(--pf-fg-dim)", opacity: 0.45 }
                }
              >
                <perm.icon size={11} />
              </span>
            ))}
          </div>
          <PopChip
            className={cn(
              "hidden min-w-[74px] justify-center text-[10.5px] font-semibold sm:inline-flex",
              store.restricted && RED_TEXT,
            )}
            style={
              store.accent
                ? { color: ACCENT, ...ACCENT_BOX, padding: "4px 10px" }
                : store.restricted
                  ? { ...RED_BOX, padding: "4px 10px" }
                  : {
                      color: "var(--pf-fg-muted)",
                      background: "var(--pf-bg-card)",
                      border: "1px solid var(--pf-border)",
                      padding: "4px 10px",
                    }
            }
          >
            {t(`${k}.${store.key}Role`)}
          </PopChip>
        </div>
      ))}

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-0.5">
        {PERMISSIONS.map((perm) => (
          <span
            key={perm.key}
            className="inline-flex items-center gap-1 text-[10px]"
            style={{ color: "var(--pf-fg-dim)" }}
          >
            <perm.icon size={10} />
            {t(`${k}.${perm.key}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  04 — orchestration: business review, left to right        */
/* ──────────────────────────────────────────────────────── */

const REVIEW_STEPS: { icon: LucideIcon; key: string; meta: string; accent: boolean }[] = [
  { icon: Search, key: "stepSearch", meta: "stepSearchMeta", accent: false },
  { icon: Quote, key: "stepAnswer", meta: "stepAnswerMeta", accent: true },
  { icon: CheckCheck, key: "stepVerify", meta: "stepVerifyMeta", accent: false },
];

const PATH_STOPS = ["16.667%", "50%", "83.333%"];

function ReviewFlowIllustration() {
  const { t } = useTranslation();
  const k = "features.illustrations.reviewFlow";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-8">
        {REVIEW_STEPS.map((step, i) => (
          <div
            key={step.key}
            className="relative flex min-w-0 flex-col gap-3 px-3.5 py-3 sm:py-3.5"
            style={step.accent ? ACCENT_BOX : PANEL}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-8 w-8 items-center justify-center"
                style={
                  step.accent
                    ? { background: "var(--pf-bg)", border: "1px solid var(--pf-accent-dim-border)", color: ACCENT }
                    : { background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)", color: "var(--pf-fg-muted)" }
                }
              >
                <step.icon size={15} />
              </span>
              <span className="font-mono text-[11px]" style={{ color: step.accent ? ACCENT : "var(--pf-fg-dim)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-bold text-[var(--pf-fg)]">{t(`${k}.${step.key}`)}</div>
              <div className="mt-0.5 truncate font-mono text-[10.5px]" style={{ color: "var(--pf-fg-dim)" }}>
                {t(`${k}.${step.meta}`)}
              </div>
            </div>
            {i < REVIEW_STEPS.length - 1 && (
              <ChevronRight
                size={16}
                className="absolute top-1/2 -right-[26px] hidden -translate-y-1/2 sm:block"
                style={{ color: step.accent ? ACCENT : "var(--pf-fg-dim)" }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="relative hidden h-8 sm:block">
        <div
          className="absolute top-1/2 right-[16.667%] left-[16.667%] h-0.5 -translate-y-1/2"
          style={{ background: "repeating-linear-gradient(90deg, #16A34A 0 6px, transparent 6px 11px)" }}
        />
        {PATH_STOPS.map((left, i) =>
          i < PATH_STOPS.length - 1 ? (
            <span
              key={left}
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
              style={{ left, background: "#16A34A" }}
            />
          ) : (
            <span
              key={left}
              className={cn(
                "absolute top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold",
                OK_TEXT,
              )}
              style={{ left, ...OK_BOX }}
            >
              <ShieldCheck size={13} />
              {t(`${k}.verified`)}
            </span>
          ),
        )}
      </div>

      <span className={cn("inline-flex items-center gap-1.5 self-start text-[11.5px] font-semibold sm:hidden", OK_TEXT)}>
        <ShieldCheck size={13} />
        {t(`${k}.verified`)}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  05 — differentiation: data sovereignty                     */
/* ──────────────────────────────────────────────────────── */

const SOVEREIGNTY_NODES: { icon: LucideIcon; key: string }[] = [
  { icon: FileText, key: "nodeDocuments" },
  { icon: Database, key: "nodeIndex" },
  { icon: Brain, key: "nodeModel" },
  { icon: Quote, key: "nodeAnswers" },
];

function SovereigntyIllustration() {
  const { t } = useTranslation();
  const k = "features.illustrations.sovereignty";

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3 py-2 [--pf-dash:var(--pf-accent-dim-border)]">
      <div
        className="relative w-full max-w-[620px] px-4 pt-9 pb-5 sm:px-8 sm:pt-12 sm:pb-8"
        style={{
          border: "1.5px dashed var(--pf-accent-dim-border)",
          background: opaqueTint("var(--pf-accent-bg)"),
        }}
      >
        <span
          className="absolute -top-[12px] left-1/2 -translate-x-1/2 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] whitespace-nowrap sm:-top-[14px] sm:px-4 sm:py-1.5 sm:text-[12px]"
          style={{ color: ACCENT, background: "var(--pf-bg)", border: "1px solid var(--pf-accent-dim-border)" }}
        >
          {t(`${k}.perimeter`)}
        </span>

        <div className="flex items-start justify-between">
          {SOVEREIGNTY_NODES.map((node, i) => (
            <div key={node.key} className="contents">
              {i > 0 && (
                <div className="mt-[21px] h-0.5 min-w-[10px] flex-1 sm:mt-[31px]">
                  <div
                    className="h-full w-full"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, var(--pf-dash) 0 4px, transparent 4px 9px)",
                    }}
                  />
                </div>
              )}
              <div className="flex w-[62px] shrink-0 flex-col items-center gap-1.5 sm:w-[96px] sm:gap-2.5">
                <span
                  className="flex h-[44px] w-[44px] items-center justify-center sm:h-[64px] sm:w-[64px]"
                  style={{
                    background: "var(--pf-bg)",
                    border: "1px solid var(--pf-accent-dim-border)",
                    color: ACCENT,
                  }}
                >
                  <node.icon className="h-5 w-5 sm:h-8 sm:w-8" />
                </span>
                <span className="text-[10.5px] font-semibold text-[var(--pf-fg-muted)] sm:text-[14px]">
                  {t(`${k}.${node.key}`)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center sm:mt-8">
          <span
            className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-[13.5px]", OK_TEXT)}
            style={{ ...OK_BOX }}
          >
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            {t(`${k}.noEgress`)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Bento card shells                                         */
/* ──────────────────────────────────────────────────────── */

/**
 * Surface propre aux illustrations : aplat clair, cadre. Elle detache
 * visuellement le schema du texte du panneau, qui reste sur `--pf-bg-card`.
 */
function FeatureIllustration({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center p-5 sm:p-6">{children}</div>
  );
}

/** Panneau d'un onglet : texte à gauche, schéma à droite (empilés en mobile). */
function FeaturePanel({ id, illustration }: { id: FeatureId; illustration: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div
      className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[0.85fr_1.3fr] lg:items-stretch"
      style={{ border: "1px solid var(--pf-border)", background: "var(--pf-bg-card)" }}
    >
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#FF6A13]">
          {t(`features.items.${id}.subtitle`)}
        </span>
        <h3 className="m-0 text-[1.55rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--pf-fg)]">
          {t(`features.items.${id}.title`)}
        </h3>
        <p className="m-0 text-[14.5px] leading-[1.6] text-[var(--pf-fg-muted)]">
          {t(`features.items.${id}.description`)}
        </p>
      </div>
      <div
        className="flex min-w-0 items-center justify-center border-t p-6 sm:p-8 lg:border-t-0 lg:border-l"
        style={{ borderColor: "var(--pf-border)" }}
      >
        {illustration}
      </div>
    </div>
  );
}

const FEATURE_IDS: FeatureId[] = [
  "precision",
  "coverage",
  "governance",
  "orchestration",
  "differentiation",
];

/* ──────────────────────────────────────────────────────── */
/*  Section                                                   */
/* ──────────────────────────────────────────────────────── */

export default function ProsperifyFeatures() {
  const { t } = useTranslation();

  const illustrations: Record<FeatureId, React.ReactNode> = {
    precision: (
      <FeatureIllustration>
        <CitedAnswerIllustration />
      </FeatureIllustration>
    ),
    coverage: (
      <FeatureIllustration>
        <CoverageIllustration />
      </FeatureIllustration>
    ),
    governance: (
      <FeatureIllustration>
        <GovernanceIllustration />
      </FeatureIllustration>
    ),
    orchestration: (
      <FeatureIllustration>
        <ReviewFlowIllustration />
      </FeatureIllustration>
    ),
    differentiation: (
      <div className="flex min-w-0 flex-1 items-center justify-center p-5 sm:p-6">
        <SovereigntyIllustration />
      </div>
    ),
  };

  const tabs: Tab[] = FEATURE_IDS.map((id) => ({
    value: id,
    title: t(`features.items.${id}.shortTitle`),
    content: <FeaturePanel id={id} illustration={illustrations[id]} />,
  }));

  return (
    <div className="[overflow-anchor:none]">
      <h2
        className="m-0 mx-auto max-w-[900px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("features.title")}{" "}
        <span className="text-[#FF6A13]">{t("features.titleHighlight")}</span>
      </h2>
      <p className="mx-auto mt-3 max-w-[640px] text-center text-base leading-7 text-[var(--pf-fg-muted)]">
        {t("features.subtitle")}
      </p>

      <div className="relative mt-[var(--pf-block-gap)] flex h-[769px] w-full flex-col items-start justify-start [perspective:1000px] sm:h-[713px] lg:h-[493px]">
        <Tabs
          activeTabClassName="rounded-none bg-[#FF6A13] dark:bg-[#FF6A13]"
          arrowClassName="border border-[var(--pf-border)] bg-white text-black shadow-[0_8px_20px_-8px_rgba(0,0,0,0.25)] transition-colors hover:border-[#FF6A13] hover:bg-[#FF6A13] hover:text-white"
          containerClassName="pf-feature-tabs gap-3 mb-[var(--pf-block-gap)] sm:justify-center"
          contentClassName="mt-[var(--pf-block-gap)]"
          tabClassName="rounded-none border text-[13px] font-semibold border-[var(--pf-border)] bg-white hover:bg-gray-100"
          tabs={tabs}
        />
      </div>
    </div>
  );
}
