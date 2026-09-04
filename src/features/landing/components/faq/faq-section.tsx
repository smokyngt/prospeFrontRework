'use client';

import { ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { uiLanguage } from '@/features/landing/lib/theme';
import { cn } from '@/lib/utils';

const faqData = Array.from({ length: 10 }, (_, index) => ({
  answerKey: `faq.items.${index}.answer`,
  questionKey: `faq.items.${index}.question`,
}));

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:text-orange-600"
      >
        <span
          className={cn(
            'text-sm font-medium',
            isOpen ? 'text-neutral-950 dark:text-white' : 'text-neutral-700 dark:text-neutral-300',
          )}
        >
          {question}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 text-neutral-400 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const { i18n, t } = useTranslation();
  const language = uiLanguage(i18n.language);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item, index) => ({
      '@type': 'Question',
      name: t(`faq.items.${index}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.items.${index}.answer`),
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-6 scroll-mt-8 sm:mb-8">
          <h2 className="mb-3 text-balance text-3xl font-semibold leading-[1.08] text-neutral-950 dark:text-neutral-50 sm:mb-4 sm:text-4xl">
            {t('faq.title_line1')}{' '}
            <span className="text-orange-500">{t('faq.title_highlight')}</span> <br />
            {t('faq.title_line2')}
          </h2>
          <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
            {t('faq.subtitle')}{' '}
            <Link
              href="/blog"
              className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
              title={language === 'fr' ? 'Lire les articles' : 'Read the articles'}
            >
              {language === 'fr' ? 'Lire les articles' : 'Read the articles'}
            </Link>
          </p>
        </div>

        <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={t(item.questionKey)}
              answer={t(item.answerKey)}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
