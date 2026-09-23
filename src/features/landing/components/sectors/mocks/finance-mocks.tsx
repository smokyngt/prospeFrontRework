"use client";

import { useTranslation } from "react-i18next";

import {
  CheckMark,
  MOCK_CARD,
  MockHeader,
  MockLabel,
  StepBox,
} from "@/features/landing/components/sectors/mocks/primitives";
import { cn } from "@/lib/utils";

const K = "sectors.financePage.useCases";

type BridgeData = {
  baseLabel: string;
  baseValue: string;
  checkLabel: string;
  file: string;
  pageLabel: string;
  resultLabel: string;
  resultValue: string;
  steps: { label: string; page: string; sign: "plus" | "minus"; value: string }[];
  title: string;
};

type ReconcileData = {
  docLabel: string;
  gapLabel: string;
  gapNote: string;
  gapValue: string;
  recalc: string;
  recalcLabel: string;
  rows: { doc: string; match: boolean; page: string; value: string }[];
  subtitle: string;
  title: string;
};

type DataroomData = {
  categories: { count: string; label: string; pct: string; warn: boolean }[];
  checklistLabel: string;
  footer: string;
  missing: { code: string; label: string }[];
  missingLabel: string;
  subtitle: string;
  title: string;
};

/* 01 · Le pont de normalisation : chaque ajustement chiffré et sourcé. */
function BridgeMock() {
  const { t } = useTranslation();
  const b = t(`${K}.bridge`, { returnObjects: true }) as BridgeData;

  return (
    <div className={cn(MOCK_CARD, "max-w-[410px]")}>
      <MockHeader right={<span className="font-mono text-[9.5px] text-[#9E9E9E]">{b.pageLabel}</span>}>
        <span className="inline-block h-4 w-3.5 bg-[#FF6A13]" />
        {b.file}
      </MockHeader>

      <div className="px-3.5 pt-3 pb-3.5">
        <MockLabel className="mb-2.5">{b.title}</MockLabel>

        <div className="flex items-baseline justify-between border-b border-[#EEE] pb-2">
          <span className="text-[11px] text-[#6B6B6B]">{b.baseLabel}</span>
          <span className="font-mono text-[12px] text-[#111]">{b.baseValue}</span>
        </div>

        {/* Les ajustements, avec leur page : c'est ce qui rend le pont vérifiable. */}
        <div className="flex flex-col">
          {b.steps.map((step) => (
            <div key={step.label} className="flex items-center gap-2 border-b border-[#F4F4F4] py-[9px]">
              <span
                className={cn(
                  "inline-flex h-[14px] w-[14px] flex-none items-center justify-center font-mono text-[11px] leading-none",
                  step.sign === "plus"
                    ? "bg-[rgba(255,106,19,0.12)] text-[#FF6A13]"
                    : "bg-[#F1F1F1] text-[#9E9E9E]",
                )}
              >
                {step.sign === "plus" ? "+" : "−"}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-[#6B6B6B]">{step.label}</span>
              <span className="flex-none font-mono text-[9px] text-[#C4C4C4]">{step.page}</span>
              <span
                className={cn(
                  "w-[62px] flex-none text-right font-mono text-[11px]",
                  step.sign === "plus" ? "text-[#111]" : "text-[#9E9E9E]",
                )}
              >
                {step.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between border-l-[3px] border-l-[#FF6A13] bg-[rgba(255,106,19,0.08)] px-3 py-2.5">
          <span className="text-[11.5px] font-bold text-[#111]">{b.resultLabel}</span>
          <span className="font-mono text-[15px] font-bold text-[#FF6A13]">{b.resultValue}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <CheckMark />
          <span className="font-mono text-[10px] text-[#6B6B6B]">{b.checkLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* 02 · Le même agrégat dans trois documents, et l'écart expliqué. */
function ReconcileMock() {
  const { t } = useTranslation();
  const r = t(`${K}.reconcile`, { returnObjects: true }) as ReconcileData;

  return (
    <div className={cn(MOCK_CARD, "max-w-[420px]")}>
      <MockHeader
        right={<span className="flex-none font-mono text-[9.5px] text-[#9E9E9E]">{r.subtitle}</span>}
      >
        {r.title}
      </MockHeader>

      <div className="flex items-center justify-between border-b border-[#EEE] px-3.5 py-2">
        <MockLabel>{r.docLabel}</MockLabel>
      </div>

      <div className="flex flex-col">
        {r.rows.map((row) => (
          <div
            key={row.doc}
            className={cn(
              "flex items-center gap-2 border-b border-[#F4F4F4] px-3.5 py-2.5",
              !row.match && "bg-[rgba(255,106,19,0.06)]",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[11px]",
                row.match ? "text-[#6B6B6B]" : "font-bold text-[#111]",
              )}
            >
              {row.doc}
            </span>
            <span className="flex-none font-mono text-[9px] text-[#C4C4C4]">{row.page}</span>
            <span
              className={cn(
                "w-[62px] flex-none px-1 py-[3px] text-right font-mono text-[11px]",
                row.match
                  ? "text-[#6B6B6B]"
                  : "border border-[rgba(255,106,19,0.35)] bg-white text-center font-bold text-[#FF6A13]",
              )}
            >
              {row.value}
            </span>
            <span className="flex-none">{row.match ? <CheckMark /> : null}</span>
          </div>
        ))}
      </div>

      <div className="px-3.5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="bg-[#FF6A13] px-[5px] py-[2px] font-mono text-[8.5px] uppercase tracking-[0.08em] text-white">
            {r.gapLabel}
          </span>
          <span className="font-mono text-[12px] font-bold text-[#111]">{r.gapValue}</span>
          <span className="min-w-0 flex-1 truncate text-[10px] text-[#9E9E9E]">{r.gapNote}</span>
        </div>

        {/* Le recalcul explicite : la réponse refait l'addition au lieu de la citer. */}
        <StepBox className="mt-2.5 border-[#EEE] bg-[#FAFAFA]">
          <MockLabel className="mb-1">{r.recalcLabel}</MockLabel>
          <span className="font-mono text-[12px] font-semibold text-[#111]">{r.recalc}</span>
        </StepBox>
      </div>
    </div>
  );
}

/* 03 · La couverture de la data room, et ce qui manque encore. */
function DataroomMock() {
  const { t } = useTranslation();
  const d = t(`${K}.dataroom`, { returnObjects: true }) as DataroomData;

  return (
    <div className={cn(MOCK_CARD, "max-w-[400px]")}>
      <MockHeader
        right={<span className="flex-none font-mono text-[9.5px] text-[#9E9E9E]">{d.subtitle}</span>}
      >
        {d.title}
      </MockHeader>

      <div className="px-3.5 pt-3 pb-3.5">
        <MockLabel className="mb-2">{d.checklistLabel}</MockLabel>

        <div className="flex flex-col gap-2.5">
          {d.categories.map((category) => (
            <div key={category.label} className="flex items-center gap-2.5">
              <span className="w-[64px] flex-none text-[11px] text-[#6B6B6B]">{category.label}</span>
              <span className="w-[26px] flex-none font-mono text-[9.5px] text-[#C4C4C4]">
                {category.count}
              </span>
              <span className="block h-[6px] flex-1 bg-[#F1F1F1]">
                <span
                  className={cn("block h-full", category.warn ? "bg-[#FF6A13]" : "bg-[#D6D6D6]")}
                  style={{ width: `${category.pct}%` }}
                />
              </span>
              <span
                className={cn(
                  "w-[34px] flex-none text-right font-mono text-[9.5px]",
                  category.warn ? "font-bold text-[#FF6A13]" : "text-[#9E9E9E]",
                )}
              >
                {category.pct} %
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3.5 border-t border-[#EEE] pt-3">
          <MockLabel className="mb-1.5">{d.missingLabel}</MockLabel>
          <div className="flex flex-col gap-1.5">
            {d.missing.map((item) => (
              <div
                key={item.code}
                className="flex items-center gap-2 border-l-[3px] border-l-[#FF6A13] bg-[rgba(255,106,19,0.08)] px-2.5 py-1.5"
              >
                <span className="flex-none font-mono text-[9.5px] font-bold text-[#FF6A13]">
                  {item.code}
                </span>
                <span className="min-w-0 truncate text-[11px] text-[#111]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 flex-none bg-[#FF6A13]" />
          <span className="text-[10.5px] font-semibold text-[#111]">{d.footer}</span>
        </div>
      </div>
    </div>
  );
}

export const FINANCE_MOCKS = [BridgeMock, ReconcileMock, DataroomMock];
