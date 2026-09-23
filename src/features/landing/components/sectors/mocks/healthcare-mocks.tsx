"use client";

import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MOCK_CARD, MockHeader, MockLabel, StepBox } from "@/features/landing/components/sectors/mocks/primitives";
import { cn } from "@/lib/utils";

type HealthcareVisual = {
  answer: string;
  answerLabel: string;
  documents: { detail: string; name: string; reference: string }[];
  question: string;
  questionLabel: string;
  title: string;
  count: string;
};

function HealthcareDocumentMock({ scenario }: { scenario: "summary" | "protocols" | "research" }) {
  const { t } = useTranslation();
  const visual = t(`sectors.healthcarePage.useCases.visuals.${scenario}`, {
    returnObjects: true,
  }) as HealthcareVisual;

  return (
    <div className={cn(MOCK_CARD, "max-w-[480px]")}>
      <MockHeader
        right={
          <span className="flex-none border border-[#E4E4E4] px-2 py-1 font-mono text-[9px] text-[#777]">
            {visual.count}
          </span>
        }
      >
        <FileText size={15} strokeWidth={1.7} className="flex-none text-[#FF6A13]" />
        {visual.title}
      </MockHeader>

      <div className="space-y-3 px-3.5 py-3.5">
        <div>
          <MockLabel className="mb-1.5">{visual.questionLabel}</MockLabel>
          <StepBox className="bg-[#FAFAFA] text-[11px] leading-[1.5] text-[#222]">
            {visual.question}
          </StepBox>
        </div>

        <div className="border-l-2 border-l-[#FF6A13] bg-[#F8F8F8] px-3 py-2.5">
          <MockLabel className="mb-1.5">{visual.answerLabel}</MockLabel>
          <p className="m-0 text-[11px] leading-[1.55] text-[#333]">{visual.answer}</p>
        </div>

        <div>
          <MockLabel className="mb-1.5">{t("sectors.common.sourcesLabel")}</MockLabel>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {visual.documents.map((document) => (
              <div key={document.name} className="border border-[#E4E4E4] px-2.5 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate text-[10.5px] font-semibold text-[#222]">
                    {document.name}
                  </span>
                  <span className="flex-none font-mono text-[9px] text-[#888]">{document.reference}</span>
                </div>
                <p className="mb-0 mt-1 text-[9.5px] leading-[1.4] text-[#777]">{document.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseSummaryMock() {
  return <HealthcareDocumentMock scenario="summary" />;
}

function ProtocolCompareMock() {
  return <HealthcareDocumentMock scenario="protocols" />;
}

function ScientificResearchMock() {
  return <HealthcareDocumentMock scenario="research" />;
}

export const HEALTHCARE_MOCKS = [CaseSummaryMock, ProtocolCompareMock, ScientificResearchMock];
