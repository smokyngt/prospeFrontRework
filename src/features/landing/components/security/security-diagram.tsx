"use client";

import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Une boucle de consultation dans un environnement dédié : équipes, accès,
 * documents, IA et réponse. Même langage visuel que les schémas des pages
 * secteur (classes pf-diagram-*), avec un tracé adapté au téléphone.
 */

function LockBadge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="pf-diagram-lock" r="12" />
      <Lock className="pf-diagram-lock-glyph" x={-7} y={-7} width={14} height={14} strokeWidth={1.7} />
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
        {/* Desktop : aller en haut, retour de la réponse en bas. */}
        <svg viewBox="0 0 1200 380" role="img" aria-label={alt} className="hidden w-full md:block">
          <Markers id="pf-sec-arrow" />

          <rect className="pf-diagram-perimeter" x="20" y="24" width="1160" height="332" />
          <text className="pf-diagram-label-accent" x="42" y="52">
            {t("security.diagram.perimeter")}
          </text>

          <path className="pf-diagram-edge" d="M230,155 H310" markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M480,155 H560" markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M750,155 H890" markerEnd={arrow} />
          <path className="pf-diagram-edge" d="M1015,195 V292 H750" markerEnd={arrowAccent} />
          <path className="pf-diagram-edge" d="M560,292 H145 V195" markerEnd={arrowAccent} />

          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="12s" repeatCount="indefinite" path="M145,155 H1015 V292 H145 Z" />
          </circle>

          <Node x={60} y={115} w={170} h={80} title={t("security.diagram.question")} sub={t("security.diagram.questionSub")} />
          <Node x={310} y={115} w={170} h={80} title={t("security.diagram.gateway")} sub={t("security.diagram.gatewaySub")} />
          <Node accent x={560} y={115} w={190} h={80} title={t("security.diagram.data")} sub={t("security.diagram.dataSub")} />
          <Node x={890} y={115} w={250} h={80} title={t("security.diagram.compute")} sub={t("security.diagram.computeSub")} />
          <Node x={560} y={260} w={190} h={64} title={t("security.diagram.answer")} sub={t("security.diagram.answerSub")} />

          <LockBadge x={270} y={155} />
          <LockBadge x={520} y={155} />
          <LockBadge x={820} y={155} />
          <LockBadge x={1015} y={240} />
          <LockBadge x={365} y={292} />
        </svg>

        {/* Téléphone : même boucle, avec le retour sur le côté gauche. */}
        <svg viewBox="0 0 360 680" role="img" aria-label={alt} className="mx-auto block w-full max-w-[380px] md:hidden">
          <Markers id="pf-sec-arrow-v" />

          <rect className="pf-diagram-perimeter" x="8" y="8" width="344" height="660" />
          <text className="pf-diagram-label-accent" x="22" y="32">
            {t("security.diagram.perimeter")}
          </text>

          <path className="pf-diagram-edge" d="M180,125 V175" markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M180,235 V285" markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M180,349 V399" markerEnd={arrowV} />
          <path className="pf-diagram-edge" d="M180,463 V513" markerEnd={arrowVAccent} />
          <path className="pf-diagram-edge" d="M180,577 V620 H32 V95 H80" markerEnd={arrowVAccent} />

          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="12s" repeatCount="indefinite" path="M180,95 V620 H32 V95 Z" />
          </circle>

          <Node x={80} y={65} w={200} h={60} title={t("security.diagram.question")} sub={t("security.diagram.questionSub")} />
          <Node x={80} y={175} w={200} h={60} title={t("security.diagram.gateway")} sub={t("security.diagram.gatewaySub")} />
          <Node accent x={80} y={285} w={200} h={64} title={t("security.diagram.data")} sub={t("security.diagram.dataSub")} />
          <Node x={80} y={399} w={200} h={64} title={t("security.diagram.compute")} sub={t("security.diagram.computeSub")} />
          <Node x={80} y={513} w={200} h={64} title={t("security.diagram.answer")} sub={t("security.diagram.answerSub")} />

          <LockBadge x={180} y={150} />
          <LockBadge x={180} y={260} />
          <LockBadge x={180} y={374} />
          <LockBadge x={180} y={488} />
          <LockBadge x={32} y={340} />
        </svg>
      </figure>
      <p className="pf-diagram-caption m-0">{t("security.diagram.caption")}</p>
    </div>
  );
}
