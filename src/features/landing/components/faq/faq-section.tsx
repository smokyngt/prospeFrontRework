"use client";

import Script from "next/script";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const faqData = Array.from({ length: 8 }, (_, index) => ({
  answerKey: `faq.items.${index}.answer`,
  questionKey: `faq.items.${index}.question`,
}));

export function FAQSection() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: t(item.questionKey),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(item.answerKey),
      },
    })),
  };

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div>
        <h2
          className="m-0 mx-auto text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
        >
          {t("faq.titleLine1")}{" "}
          <span className="text-[#FF6A13]">{t("faq.titleHighlight")}</span>
        </h2>
        <p className="mx-auto mb-11 mt-[18px] max-w-[640px] text-center text-[1.05rem] text-[var(--pf-fg-muted)]">
          {t("faq.subtitle")}
        </p>

        <div className="border border-[var(--pf-border)]">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={index}
                className="border-b border-[var(--pf-border)] last:border-b-0"
                style={{ background: isOpen ? "var(--pf-bg-card-2)" : "transparent" }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 border-none bg-transparent text-left"
                  style={{ padding: "20px clamp(18px, 2.4vw, 28px)" }}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="shrink-0 font-mono text-xs text-[#FF6A13]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[15px] font-semibold",
                        isOpen ? "text-[var(--pf-fg)]" : "text-[var(--pf-fg-muted)]",
                      )}
                    >
                      {t(item.questionKey)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[18px] text-[#FF6A13]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p
                    className="m-0 text-sm leading-[1.65] text-[var(--pf-fg-muted)]"
                    style={{
                      padding: "0 clamp(18px, 2.4vw, 28px) 22px 50px",
                    }}
                  >
                    {t(item.answerKey)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
