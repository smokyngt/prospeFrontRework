"use client";

import { useTranslation } from "react-i18next";

/**
 * Schémas du pipeline documentaire, communs aux trois secteurs (même
 * mécanisme, même gabarit). Couleurs et animations reprennent les tokens
 * --pf-* et les keyframes pf-dash / pf-pulse déjà utilisés ailleurs sur la
 * landing : les deux thèmes clair/sombre sont donc gérés automatiquement.
 */

/** Schéma 01 : de la question à la réponse sourcée, jusqu'à la vérification humaine. */
export function PipelineDiagram() {
  const { t } = useTranslation();

  return (
    <div className="pf-diagram-frame">
      <figure className="m-0">
        <svg
          viewBox="0 0 1450 300"
          role="img"
          aria-label={t("sectors.common.diagrams.pipeline.alt")}
          className="block w-full"
        >
          <defs>
            <marker id="pf-diagram-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot-dim" />
            </marker>
            <marker id="pf-diagram-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot" />
            </marker>
          </defs>

          {/* branchement recherche hybride */}
          <path className="pf-diagram-edge" d="M170,150 L300,65" markerEnd="url(#pf-diagram-arrow)" />
          <path className="pf-diagram-edge" d="M170,150 L300,235" markerEnd="url(#pf-diagram-arrow)" />
          <text className="pf-diagram-edge-label" x="205" y="140" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.hybridLabel")}
          </text>

          {/* fusion vers le recoupement */}
          <path className="pf-diagram-edge" d="M490,65 L610,150" markerEnd="url(#pf-diagram-arrow)" />
          <path className="pf-diagram-edge" d="M490,235 L610,150" markerEnd="url(#pf-diagram-arrow)" />

          {/* colonne vertébrale */}
          <line className="pf-diagram-edge" x1="820" y1="150" x2="938" y2="150" markerEnd="url(#pf-diagram-arrow)" />
          <text className="pf-diagram-edge-label" x="879" y="136" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.answerLabel")}
          </text>

          <line className="pf-diagram-edge" x1="1170" y1="150" x2="1288" y2="150" markerEnd="url(#pf-diagram-arrow-accent)" />
          <text className="pf-diagram-edge-label" x="1229" y="136" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.citationLabel")}
          </text>

          {/* pulses : deux recherches en parallèle qui convergent */}
          <circle className="pf-diagram-dot-dim" r="4">
            <animateMotion dur="6s" repeatCount="indefinite" path="M95,150 L395,65 L715,150 L1054,150 L1363,150" />
          </circle>
          <circle className="pf-diagram-dot-dim" r="4">
            <animateMotion dur="6s" begin="0.35s" repeatCount="indefinite" path="M95,150 L395,235 L715,150 L1054,150 L1363,150" />
          </circle>
          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="6s" begin="1.9s" repeatCount="indefinite" path="M95,150 L395,150 L715,150 L1054,150 L1363,150" />
          </circle>

          {/* Question */}
          <rect className="pf-diagram-node" x="20" y="120" width="150" height="60" />
          <text className="pf-diagram-title" x="95" y="146" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.question")}
          </text>
          <text className="pf-diagram-sub" x="95" y="164" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.questionSub")}
          </text>

          {/* Lexicale */}
          <rect className="pf-diagram-node" x="300" y="40" width="190" height="50" />
          <text className="pf-diagram-title" x="395" y="61" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.lexical")}
          </text>
          <text className="pf-diagram-sub" x="395" y="78" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.lexicalSub")}
          </text>

          {/* Sémantique */}
          <rect className="pf-diagram-node" x="300" y="210" width="190" height="50" />
          <text className="pf-diagram-title" x="395" y="231" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.semantic")}
          </text>
          <text className="pf-diagram-sub" x="395" y="248" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.semanticSub")}
          </text>

          {/* Recoupement */}
          <rect className="pf-diagram-node" x="610" y="120" width="210" height="60" />
          <text className="pf-diagram-title" x="715" y="146" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.crossCheck")}
          </text>
          <text className="pf-diagram-sub" x="715" y="164" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.crossCheckSub")}
          </text>

          {/* Réponse */}
          <rect className="pf-diagram-node" x="938" y="120" width="232" height="60" />
          <text className="pf-diagram-title" x="1054" y="146" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.answer")}
          </text>
          <text className="pf-diagram-sub" x="1054" y="164" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.answerSub")}
          </text>

          {/* Vérification humaine */}
          <rect className="pf-diagram-node-accent" x="1288" y="110" width="150" height="80" />
          <text className="pf-diagram-title-accent" x="1363" y="144" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.verify")}
          </text>
          <text className="pf-diagram-title-accent" x="1363" y="160" textAnchor="middle">
            {t("sectors.common.diagrams.pipeline.verifySub")}
          </text>
        </svg>
      </figure>
      <p className="pf-diagram-caption m-0">{t("sectors.common.diagrams.pipeline.caption")}</p>
    </div>
  );
}

/** Schéma 02 : l'agent et l'expert se répondent, la correction revient nourrir l'agent. */
export function HumanLoopDiagram() {
  const { t } = useTranslation();

  return (
    <div className="pf-diagram-frame">
      <figure className="m-0">
        <svg
          viewBox="0 0 760 400"
          role="img"
          aria-label={t("sectors.common.diagrams.humanLoop.alt")}
          className="mx-auto block w-full max-w-[560px]"
        >
          <defs>
            <marker id="pf-diagram-arrow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot-dim" />
            </marker>
            <marker id="pf-diagram-arrow-2-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="pf-diagram-dot" />
            </marker>
          </defs>

          <line className="pf-diagram-edge" x1="270" y1="70" x2="490" y2="70" markerEnd="url(#pf-diagram-arrow-2)" />
          <text className="pf-diagram-edge-label" x="380" y="56" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.forwardLabel")}
          </text>

          <line className="pf-diagram-edge-dashed" x1="490" y1="108" x2="270" y2="108" markerEnd="url(#pf-diagram-arrow-2)" />
          <text className="pf-diagram-edge-label" x="380" y="128" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.feedbackLabel")}
          </text>

          <path className="pf-diagram-edge" d="M605,120 L385,290" markerEnd="url(#pf-diagram-arrow-2-accent)" />
          <text
            className="pf-diagram-edge-label"
            x="495"
            y="197"
            textAnchor="middle"
            transform="rotate(-38 495 197)"
          >
            {t("sectors.common.diagrams.humanLoop.decideLabel")}
          </text>

          <circle className="pf-diagram-dot" r="4.5">
            <animateMotion dur="5s" repeatCount="indefinite" path="M155,75 L605,70 L385,290" />
          </circle>
          <circle className="pf-diagram-dot-dim" r="4">
            <animateMotion dur="2.2s" begin="2.8s" repeatCount="indefinite" path="M605,108 L270,108" />
          </circle>

          {/* Agent */}
          <rect className="pf-diagram-node" x="40" y="30" width="230" height="90" />
          <text className="pf-diagram-title" x="155" y="66" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.agent")}
          </text>
          <text className="pf-diagram-sub" x="155" y="84" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.agentSub1")}
          </text>
          <text className="pf-diagram-sub" x="155" y="98" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.agentSub2")}
          </text>

          {/* Expert */}
          <rect className="pf-diagram-node" x="490" y="30" width="230" height="90" />
          <text className="pf-diagram-title" x="605" y="66" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.expert")}
          </text>
          <text className="pf-diagram-sub" x="605" y="84" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.expertSub1")}
          </text>
          <text className="pf-diagram-sub" x="605" y="98" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.expertSub2")}
          </text>

          {/* Décision */}
          <rect className="pf-diagram-node-accent" x="270" y="290" width="230" height="90" />
          <text className="pf-diagram-title-accent" x="385" y="328" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.decision")}
          </text>
          <text className="pf-diagram-sub-accent" x="385" y="346" textAnchor="middle">
            {t("sectors.common.diagrams.humanLoop.decisionSub")}
          </text>
        </svg>
      </figure>
      <p className="pf-diagram-caption m-0">{t("sectors.common.diagrams.humanLoop.caption")}</p>
    </div>
  );
}
