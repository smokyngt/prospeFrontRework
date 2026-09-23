"use client";

import Script from "next/script";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Collapse } from "@/features/landing/components/collapse/collapse";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type FAQEntry = { answer: string; question: string };

const faqData = Array.from({ length: 8 }, (_, index) => ({
  answerKey: `faq.items.${index}.answer`,
  questionKey: `faq.items.${index}.question`,
}));

export function FAQSection({
  items: customItems,
  title,
  subtitle,
  schemaId = "faq-jsonld",
}: {
  items?: FAQEntry[];
  title?: ReactNode;
  subtitle?: ReactNode;
  schemaId?: string;
} = {}) {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [accordionHeight, setAccordionHeight] = useState<number>();
  const accordionRef = useRef<HTMLDivElement>(null);
  const answerMeasureRef = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () =>
      customItems ??
      faqData.map((item) => ({
        answer: t(item.answerKey),
        question: t(item.questionKey),
      })),
    [customItems, t],
  );

  useLayoutEffect(() => {
    const accordion = accordionRef.current;
    const answerMeasure = answerMeasureRef.current;
    if (!accordion || !answerMeasure) return;

    const measure = () => {
      const buttons = Array.from(
        accordion.querySelectorAll<HTMLButtonElement>("[data-faq-question]"),
      );
      const answerHeights = Array.from(answerMeasure.children).map((answer) =>
        Math.ceil(answer.getBoundingClientRect().height),
      );
      answerHeights.sort((a, b) => b - a);

      const closedRowsHeight = buttons.reduce(
        (height, button) => height + button.getBoundingClientRect().height,
        Math.max(0, buttons.length - 1),
      );
      // Reserve the two tallest answers so the outgoing and incoming collapses
      // can animate together without changing the accordion's outer height.
      const transitionReserve = (answerHeights[0] ?? 0) + (answerHeights[1] ?? 0);
      setAccordionHeight(Math.ceil(closedRowsHeight + transitionReserve + 2));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(accordion);
    Array.from(answerMeasure.children).forEach((answer) => observer.observe(answer));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  const toggleItem = (index: number) => {
    setOpenItem((prev) => (prev === index ? null : index));
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <Script
        id={schemaId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="[overflow-anchor:none]">
        <h2
          className="m-0 mx-auto text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
        >
          {title ?? (
            <>
              {t("faq.titleLine1")} {" "}
              <span className="text-[#FF6A13]">{t("faq.titleHighlight")}</span>
            </>
          )}
        </h2>

        {subtitle ? (
          <p className="mx-auto mt-3 max-w-[640px] text-center text-base leading-7 text-[var(--pf-fg-muted)]">
            {subtitle}
          </p>
        ) : customItems ? null : (
          <p className="mx-auto mt-3 max-w-[640px] text-center text-base leading-7 text-[var(--pf-fg-muted)]">
            {t("faq.subtitle")}
          </p>
        )}

        <div
          ref={accordionRef}
          className="mt-[var(--pf-block-gap)] [overflow-anchor:none]"
          style={{ height: accordionHeight ? `${accordionHeight}px` : undefined }}
        >
          {items.map((item, index) => {
            const isOpen = openItem === index;
            return (
              <div
                key={item.question}
                className="border-x border-b border-[var(--pf-border)] first:border-t last:border-b-0 [overflow-anchor:none]"
                style={{ background: isOpen ? "var(--pf-bg-card-2)" : "transparent" }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${schemaId}-answer-${index}`}
                  data-faq-question
                  onClick={() => toggleItem(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent text-left"
                  style={{ padding: "13px clamp(14px, 1.6vw, 20px)" }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 font-sans text-[13px] font-semibold text-[#FF6A13]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[16px] font-semibold leading-snug",
                        isOpen ? "text-[var(--pf-fg)]" : "text-[var(--pf-fg-muted)]",
                      )}
                    >
                      {item.question}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[20px] text-[#FF6A13]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <Collapse open={isOpen}>
                  <p
                    id={`${schemaId}-answer-${index}`}
                    className="m-0 text-[15px] leading-[1.6] text-[var(--pf-fg-muted)]"
                    style={{ padding: "0 clamp(14px, 1.6vw, 20px) 15px 44px" }}
                  >
                    {item.answer}
                  </p>
                </Collapse>
              </div>
            );
          })}
          <div ref={answerMeasureRef} aria-hidden="true" className="pointer-events-none invisible h-0 overflow-hidden">
            {items.map((item) => (
              <p
                key={item.question}
                className="m-0 text-[15px] leading-[1.6] text-[var(--pf-fg-muted)]"
                style={{ padding: "0 clamp(14px, 1.6vw, 20px) 15px 44px" }}
              >
                {item.answer}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
