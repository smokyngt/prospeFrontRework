"use client";

import type React from "react";

import { Code2, Plug, RefreshCw, Server, Zap } from "lucide-react";
import { useState } from "react";

const ACCENT = "#FF6A13";

/* ──────────────────────────────────────────────────────── */
/*  Data                                                     */
/* ──────────────────────────────────────────────────────── */

type IntegrationPath = {
  n: string;
  tag: string;
  title: string;
  desc: string;
  chips: string[];
  Icon: React.ElementType;
};

const PATHS: IntegrationPath[] = [
  {
    n: "01",
    tag: "prêt à l'emploi",
    title: "Connecteurs",
    desc: "Branchez vos CRM, ERP et espaces documentaires existants. Aucune migration, aucune réécriture.",
    chips: ["CRM", "ERP", "Stockage"],
    Icon: Plug,
  },
  {
    n: "02",
    tag: "sur-mesure",
    title: "SDK Prosperify",
    desc: "Intégrez la recherche et la génération directement dans vos applications via une API sécurisée.",
    chips: ["API", "Contrôle total", "Développeurs"],
    Icon: Code2,
  },
];

const BENEFITS = [
  { label: "Aucune migration",   desc: "Vos données restent dans vos systèmes existants.",            Icon: Server    },
  { label: "Ingestion flexible", desc: "Manuelle à la demande ou automatique selon un planning.",     Icon: RefreshCw },
  { label: "Zéro refonte",       desc: "Une couche qui s'ajoute sans toucher à votre architecture.", Icon: Zap       },
];

/* ──────────────────────────────────────────────────────── */
/*  Path card                                                */
/* ──────────────────────────────────────────────────────── */

function PathCard({ path }: { path: IntegrationPath }) {
  const { n, tag, title, desc, chips, Icon } = path;
  return (
    <div
      className="flex flex-1 flex-col gap-4 border-t-2 border-transparent px-6 py-7 hover:border-t-[#FF6A13]"
      style={{ background: "var(--pf-bg-card)", border: "1px solid var(--pf-border)", borderTopWidth: "2px", borderTopColor: "transparent" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-[#FF6A13]">{n}</span>
        <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--pf-fg-dim)]">{tag}</span>
      </div>
      <div className="flex h-11 w-11 items-center justify-center" style={{ background: "var(--pf-accent-bg)", border: "1px solid var(--pf-accent-dim-border)" }}>
        <Icon size={20} style={{ color: ACCENT }} />
      </div>
      <div>
        <h4 className="m-0 text-[15px] font-bold text-[var(--pf-fg)]">{title}</h4>
        <p className="m-0 mt-2 text-[13px] leading-[1.55] text-[var(--pf-fg-muted)]">{desc}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {chips.map((c) => (
          <span
            key={c}
            className="font-mono text-[10px] text-[var(--pf-fg-dim)]"
            style={{ border: "1px solid var(--pf-border)", padding: "3px 8px" }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function OrConnector() {
  return (
    <div
      className="flex shrink-0 items-center justify-center py-2 md:flex-col md:px-2 md:py-0"
      style={{ borderTop: "1px solid var(--pf-border)", borderBottom: "1px solid var(--pf-border)" }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[10px] font-semibold tracking-[0.05em]"
        style={{ background: "var(--pf-bg-card-2)", border: "1px solid var(--pf-border)", color: "var(--pf-fg-dim)" }}
      >
        OU
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Ingestion bar                                           */
/* ──────────────────────────────────────────────────────── */

function IngestionBar({ defaultMode = "auto" }: { defaultMode?: "auto" | "manuel" }) {
  const [mode, setMode] = useState<"auto" | "manuel">(defaultMode);
  const isAuto = mode === "auto";

  const btnBase: React.CSSProperties = {
    fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.07em", padding: "4px 16px",
    cursor: "pointer", border: "1px solid",
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "center",
      justifyContent: "center", gap: 14,
      border: "1px solid var(--pf-border)", borderTop: 0,
      background: "var(--pf-bg-card-2)", padding: "12px 24px",
    }}>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--pf-fg-dim)", letterSpacing: "0.12em" }}>
        INGESTION
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => setMode("auto")}
          style={{
            ...btnBase,
            background: isAuto ? "var(--pf-accent)" : "transparent",
            color: isAuto ? "#fff" : "var(--pf-fg-dim)",
            borderColor: isAuto ? "var(--pf-accent)" : "var(--pf-border)",
          }}
        >
          AUTO
        </button>
        <button
          type="button"
          onClick={() => setMode("manuel")}
          style={{
            ...btnBase,
            background: !isAuto ? "var(--pf-accent)" : "transparent",
            color: !isAuto ? "#fff" : "var(--pf-fg-dim)",
            borderColor: !isAuto ? "var(--pf-accent)" : "var(--pf-border)",
          }}
        >
          MANUEL
        </button>
      </div>
      <span style={{ fontSize: 11, color: "var(--pf-accent)", fontFamily: "'JetBrains Mono', monospace" }}>
        {isAuto ? "Planifié · 02:00 CET" : "À la demande"}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Main section                                            */
/* ──────────────────────────────────────────────────────── */

export function SovereigntySection() {
  return (
    <div>
      <h2 style={{
        margin: 0, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.02em",
        color: "var(--pf-fg)", fontSize: "clamp(2.05rem, 4.5vw, 3.5rem)", maxWidth: 900,
      }}>
        Connectez vos systèmes.<br />
        <span style={{ color: "var(--pf-accent)" }}>Aucune refonte nécessaire.</span>
      </h2>
      <p style={{ margin: "18px 0 0", maxWidth: 640, fontSize: "1.05rem", lineHeight: 1.65, color: "var(--pf-fg-muted)" }}>
        Deux façons de brancher vos données à Prosperify : des connecteurs prêts à l&apos;emploi, ou une intégration sur-mesure via le SDK.
      </p>

      <div className="mt-11 flex flex-col md:flex-row md:items-stretch">
        <PathCard path={PATHS[0]} />
        <OrConnector />
        <PathCard path={PATHS[1]} />
      </div>

      <IngestionBar />

      {/* Benefits — responsive grid */}
      <div className="mt-6 grid grid-cols-1 gap-px border border-[var(--pf-border)] sm:grid-cols-3" style={{ background: "var(--pf-border)" }}>
        {BENEFITS.map(({ label, desc, Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 24, background: "var(--pf-bg-card)" }}>
            <div style={{
              marginTop: 2, width: 36, height: 36, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--pf-accent-bg)",
              border: "1px solid var(--pf-accent-dim-border)",
            }}>
              <Icon size={16} style={{ color: "var(--pf-accent)" }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-fg)" }}>{label}</div>
              <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.5, color: "var(--pf-fg-muted)" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
