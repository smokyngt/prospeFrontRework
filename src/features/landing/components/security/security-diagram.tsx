"use client";

import { useTranslation } from "react-i18next";

/**
 * Schéma d'infrastructure de la section sécurité : un périmètre de confiance
 * (bordure orange animée), une porte d'entrée contrôlée, des services isolés
 * reliés par des liens chiffrés (cadenas) — l'esprit d'un service mesh, sans
 * jargon. Même langage visuel que les schémas des pages secteur (classes
 * pf-diagram-*). Deux tracés : horizontal (desktop) et vertical (téléphone).
 */

function LockBadge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="pf-diagram-lock" r="12" />
      <rect className="pf-diagram-lock-glyph" x="-4.5" y="-1.5" width="9" height="7" />
      <path className="pf-diagram-lock-glyph" d="M-2.8,-1.5 V-3.6 a2.8,2.8 0 0 1 5.6,0 V-1.5" fill="none" />
    </g>
  );
}

type NodeProps = {
  accent?: boolean;
  h: number;
  sub?: string;
  title: string;
  w: number;
  x: number;
  y: number;
};

function Node({ accent, h, sub, title, w, x, y }: NodeProps) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const titleClass = accent ? "pf-diagram-title-accent" : "pf-diagram-title";
  const subClass = accent ? "pf-diagram-sub-accent" : "pf-diagram-sub";

  return (
    <g>
      <rect className={accent ? "pf-diagram-node-accent" : "pf-diagram-node"} x={x} y={y} width={w} height={h} />
      <text className={titleClass} x={cx} y={sub ? cy - 3 : cy + 5} textAnchor="middle">
        {title}
      </text>
      {sub ? (
        <text className={subClass} x={cx} y={cy + 14} textAnchor="middle">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Markers({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot-dim" />
      </marker>
      <marker id={`${id}-accent`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot" />
      </marker>
    </defs>
  );
}

export function SecurityDiagram() {
  const { t } = useTranslation();
  const arrow = "url(#pf-sec-arrow)";
  const arrowAccent = "url(#pf-sec-arrow-accent)";
  const arrowV = "url(#pf-sec-arrow-v)";
  const arrowVAccent = "url(#pf-sec-arrow-v-accent)";
  const alt = t("security.diagram.alt");

  return (
    <div className="pf-diagram-frame">
      <figure className="m-0">
        {/* Desktop : flux horizontal */}
        <svg viewBox="0 0 1200 380" role="img" aria-label={alt} className="hidden w-full md:block">
          <Markers id="pf-sec-arrow" />

          <rect className="pf-diagram-perimeter" x="240" y="24" width="720" height="332" />
          <text className="pf-diagram-label-accent" x="262" y="52">
            {t("security.diagram.perimeter")}
          </text>

          <path className="pf-diagram-edge" d="M190,190 L268,190" markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M398,190 L470,190" markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M650,190 L740,190" markerStart={arrow} markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M560,235 L560,300 L1010,300" markerEnd={arrowAccent} />

          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="4s" repeatCount="indefinite" path="M560,190 L560,300 L1095,300" />
          </circle>
          <circle className="pf-diagram-dot-dim" r="4">
            <animateMotion dur="7s" begin="2.4s" repeatCount="indefinite" path="M100,190 L470,190 L740,190 L825,190" />
          </circle>

          <Node x={20} y={145} w={170} h={90} title={t("security.diagram.question")} />
          <Node x={268} y={145} w={130} h={90} title={t("security.diagram.gateway")} sub={t("security.diagram.gatewaySub")} />
          <Node x={470} y={145} w={180} h={90} title={t("security.diagram.compute")} sub={t("security.diagram.computeSub")} />
          <Node accent x={740} y={145} w={190} h={90} title={t("security.diagram.data")} sub={t("security.diagram.dataSub")} />
          <Node x={1010} y={260} w={170} h={80} title={t("security.diagram.answer")} />

          <LockBadge x={240} y={190} />
          <LockBadge x={434} y={190} />
          <LockBadge x={695} y={190} />
          <LockBadge x={960} y={300} />
        </svg>

        {/* Téléphone : flux vertical */}
        <svg viewBox="0 0 360 680" role="img" aria-label={alt} className="mx-auto block w-full max-w-[380px] md:hidden">
          <Markers id="pf-sec-arrow-v" />

          <rect className="pf-diagram-perimeter" x="8" y="100" width="344" height="460" />
          <text className="pf-diagram-label-accent" x="22" y="122">
            {t("security.diagram.perimeter")}
          </text>

          <path className="pf-diagram-edge" d="M180,58 L180,140" markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M180,190 L180,250" markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M180,314 L180,370" markerStart={arrowV} markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M300,282 L330,282 L330,500 L180,500 L180,606" markerEnd={arrowVAccent} />

          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="4s" repeatCount="indefinite" path="M180,282 L330,282 L330,500 L180,500 L180,633" />
          </circle>
          <circle className="pf-diagram-dot-dim" r="4">
            <animateMotion dur="7s" begin="2.4s" repeatCount="indefinite" path="M180,33 L180,282 L180,402" />
          </circle>

          <Node x={100} y={8} w={160} h={50} title={t("security.diagram.question")} />
          <Node x={95} y={140} w={170} h={50} title={t("security.diagram.gateway")} sub={t("security.diagram.gatewaySub")} />
          <Node x={60} y={250} w={240} h={64} title={t("security.diagram.compute")} sub={t("security.diagram.computeSub")} />
          <Node accent x={60} y={370} w={240} h={64} title={t("security.diagram.data")} sub={t("security.diagram.dataSub")} />
          <Node x={100} y={608} w={160} h={50} title={t("security.diagram.answer")} />

          <LockBadge x={180} y={100} />
          <LockBadge x={180} y={220} />
          <LockBadge x={180} y={342} />
          <LockBadge x={180} y={560} />
        </svg>
      </figure>
      <p className="pf-diagram-caption m-0">{t("security.diagram.caption")}</p>
    </div>
  );
}
