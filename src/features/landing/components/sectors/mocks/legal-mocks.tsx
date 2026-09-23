"use client";

import { FileText, Search } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

import {
  Bar,
  MOCK_CARD,
  MockLabel,
  StepBox,
} from "@/features/landing/components/sectors/mocks/primitives";
import { cn } from "@/lib/utils";

const K = "sectors.legalPage.illustrations";
const LEGAL_MOCK_CARD = MOCK_CARD.replace("[zoom:1.15]", "[zoom:1.12] sm:[zoom:1.28] lg:[zoom:1.48]");

function LegalHeader({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E4E4E4] bg-[#FAFAFA] px-4 py-3">
      <span className="flex items-center gap-2 text-[13px] font-medium text-[#202124]">{children}</span>
      {right}
    </div>
  );
}

type ResearchData = {
  answer: string;
  citation: string;
  document: string;
  pages: string;
  pageTitle: string;
  question: string;
  questionLabel: string;
  responseLabel: string;
  section: string;
  quote: string;
};

type ComparisonData = {
  answer: string[];
  contract: { file: string; page: string; quote: string; title: string };
  folder: string;
  policy: { file: string; page: string; quote: string; title: string };
  question: string;
  questionLabel: string;
  responseLabel: string;
  title: string;
};

type DossierData = {
  answerLabel: string;
  documents: string[];
  events: { date: string; file: string; page: string; text: string }[];
  question: string;
  questionLabel: string;
  title: string;
  total: string;
};

type PrecedentData = {
  answer: string;
  documents: string;
  question: string;
  questionLabel: string;
  results: { file: string; page: string; quote: string }[];
  title: string;
};

function Question({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex flex-col items-end">
      <MockLabel className="mb-1.5 mr-1">{label}</MockLabel>
      <StepBox className="ml-auto flex max-w-[88%] items-start gap-2 border-[#FF6A13] bg-[#FF6A13] text-white">
        <Search size={12} className="mt-0.5 flex-none text-white/80" />
        <span className="text-[10px] font-medium leading-[1.5] text-white">{children}</span>
      </StepBox>
    </div>
  );
}

function Citation({ file, page }: { file: string; page: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 border border-[#E4E4E4] bg-[#F8F8F8] px-2 py-1.5 text-[9px] text-[#686868]">
      <FileText size={10} className="flex-none text-[#FF6A13]" />
      <span className="truncate">{file}</span>
      <span className="flex-none text-[#999]">{page}</span>
    </span>
  );
}

function ResearchMock() {
  const { t } = useTranslation();
  const d = t(`${K}.research`, { returnObjects: true }) as ResearchData;

  return (
    <div className={cn(LEGAL_MOCK_CARD, "max-w-[560px] overflow-hidden shadow-[0_24px_48px_-24px_rgba(82,35,8,0.34)]")}>
      <LegalHeader right={<span className="font-mono text-[10px] text-[#858585]">{d.pages}</span>}>
        <span className="inline-flex items-center gap-2"><FileText size={13} className="text-[#FF6A13]" />{d.document}</span>
      </LegalHeader>
      <div className="grid grid-cols-[0.82fr_1.18fr] gap-3 p-3.5">
        <div className="border border-[#E5E5E5] bg-[#F5F6F7] p-2.5">
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#8A8A8A]">{d.pageTitle}</span>
          <div className="mt-3 space-y-2.5">
            <span className="block h-[5px] w-[88%] bg-[#DADDE0]" />
            <span className="block h-[5px] w-full bg-[#DADDE0]" />
            <span className="block h-[5px] w-[74%] bg-[#DADDE0]" />
            <div className="border-l-2 border-[#FF6A13] bg-[#FFF0E7] px-2 py-2">
              <span className="mb-1 block text-[8px] font-semibold text-[#252525]">{d.section}</span>
              <span className="text-[8px] leading-[1.45] text-[#555]">{d.quote}</span>
            </div>
            <span className="block h-[5px] w-[82%] bg-[#DADDE0]" />
            <span className="block h-[5px] w-[65%] bg-[#DADDE0]" />
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <Question label={d.questionLabel}>{d.question}</Question>
          <div className="border-l-2 border-[#FF6A13] pl-3">
            <MockLabel className="mb-1.5">{d.responseLabel}</MockLabel>
            <p className="m-0 text-[10px] font-medium leading-[1.55] text-[#333]">{d.answer}</p>
            <div className="mt-2 space-y-1.5" aria-hidden="true">
              <Bar width="92%" />
              <Bar width="68%" tone="faint" />
            </div>
          </div>
          <span className="inline-flex max-w-full border border-[#E4E4E4] bg-[#F8F8F8] px-2 py-1.5 text-[9px] text-[#686868]">{d.citation}</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonMock() {
  const { t } = useTranslation();
  const d = t(`${K}.comparison`, { returnObjects: true }) as ComparisonData;

  return (
    <div className={cn(LEGAL_MOCK_CARD, "max-w-[560px] overflow-hidden shadow-[0_24px_48px_-24px_rgba(82,35,8,0.34)]")}>
      <LegalHeader right={<span className="font-mono text-[10px] text-[#858585]">2 DOCUMENTS</span>}>{d.folder}</LegalHeader>
      <div className="space-y-3 p-3.5">
        <Question label={d.questionLabel}>{d.question}</Question>
        <div className="grid grid-cols-2 gap-2">
          {[d.contract, d.policy].map((document) => (
            <div key={document.file} className="min-w-0 border border-[#E5E5E5] bg-[#F8F8F8] p-2.5">
              <span className="mb-1.5 block text-[8px] font-semibold text-[#444]">{document.title}</span>
              <span className="block truncate text-[8px] text-[#888]">{document.file} · {document.page}</span>
              <p className="mb-0 mt-2 border-l-2 border-[#FF6A13] pl-2 text-[10px] font-semibold leading-[1.45] text-[#282828]">{document.quote}</p>
              <div className="mt-2 space-y-1.5" aria-hidden="true">
                <Bar width="88%" />
                <Bar width="58%" tone="faint" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-l-2 border-[#FF6A13] bg-white py-1 pl-3">
          <MockLabel className="mb-1.5">{d.responseLabel}</MockLabel>
          {d.answer.map((paragraph) => <p key={paragraph} className="mb-1.5 last:mb-0 text-[10px] font-medium leading-[1.5] text-[#333]">{paragraph}</p>)}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Citation file={d.contract.file} page={d.contract.page} />
            <Citation file={d.policy.file} page={d.policy.page} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DossierMock() {
  const { t } = useTranslation();
  const d = t(`${K}.dossier`, { returnObjects: true }) as DossierData;

  return (
    <div className={cn(LEGAL_MOCK_CARD, "max-w-[560px] overflow-hidden shadow-[0_24px_48px_-24px_rgba(82,35,8,0.34)]")}>
      <LegalHeader right={<span className="font-mono text-[10px] text-[#858585]">{d.total}</span>}>{d.title}</LegalHeader>
      <div className="grid grid-cols-[0.72fr_1.28fr] gap-3 p-3.5">
        <div className="space-y-1.5">
          {d.documents.slice(0, 3).map((file, index) => (
            <div key={file} className={cn("flex items-center gap-1.5 border-b border-[#E5E5E5] px-2 py-2", index === 0 ? "bg-[#FFF0E7]" : "bg-[#F4F5F6]")}>
              <FileText size={11} className={cn("flex-none", index === 0 ? "text-[#FF6A13]" : "text-[#999]")} />
              <span className="min-w-0 truncate text-[8px] text-[#555]">{file}</span>
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <Question label={d.questionLabel}>{d.question}</Question>
          <MockLabel className="mb-2 mt-3">{d.answerLabel}</MockLabel>
          <div className="space-y-2 border-l border-[#E0E0E0] pl-2.5">
            {d.events.map((event) => (
              <div key={event.date} className="relative border-b border-[#E5E5E5] bg-white px-2 py-1.5 before:absolute before:-left-[13px] before:top-2 before:h-1.5 before:w-1.5 before:bg-[#FF6A13]">
                <span className="block font-mono text-[8px] font-semibold text-[#C94F0A]">{event.date}</span>
                <p className="mb-1 mt-0.5 text-[9px] font-medium leading-[1.4] text-[#333]">{event.text}</p>
                <span className="block truncate text-[7.5px] text-[#888]">{event.file} · p. {event.page}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrecedentMock() {
  const { t } = useTranslation();
  const d = t(`${K}.precedents`, { returnObjects: true }) as PrecedentData;

  return (
    <div className={cn(LEGAL_MOCK_CARD, "max-w-[560px] overflow-hidden shadow-[0_24px_48px_-24px_rgba(82,35,8,0.34)]")}>
      <LegalHeader right={<span className="font-mono text-[10px] text-[#858585]">{d.documents}</span>}>{d.title}</LegalHeader>
      <div className="space-y-3 p-3.5">
        <Question label={d.questionLabel}>{d.question}</Question>
        <p className="m-0 text-[10px] font-medium leading-[1.5] text-[#333]">{d.answer}</p>
        <div className="space-y-1.5" aria-hidden="true">
          <Bar width="86%" />
          <Bar width="64%" tone="faint" />
        </div>
        <div className="space-y-2">
          {d.results.map((result) => (
            <div key={result.file} className="border-b border-[#E5E5E5] bg-[#F8F8F8] p-2.5">
              <p className="mb-2 mt-0 text-[10px] font-medium leading-[1.45] text-[#333]">{result.quote}</p>
              <Citation file={result.file} page={result.page} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const LEGAL_MOCKS = [ResearchMock, ComparisonMock, DossierMock, PrecedentMock];
