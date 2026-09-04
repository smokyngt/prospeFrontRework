'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SCHEMA_ORG, SITE_URL } from '@/config/constants';
import { LandingFooter } from '@/features/landing/components/footer';
import { LandingNavbar } from '@/features/landing/components/navigation';
import { USE_CASE_ICONS, USE_CASE_IDS, type UseCaseId } from '@/features/landing/data/use-cases';
import { arrayAt, stringListAt } from '@/features/landing/lib/i18n';
import { useLandingLanguageSync } from '@/hooks/use-landing-language';

const USE_CASE_ID_SET: ReadonlySet<string> = new Set(USE_CASE_IDS);

const PAGE_LINES = [92, 76, 88, 61, 84, 70, 95, 58];
const CITED_LINE_INDEX = 4;

function isUseCaseId(value: string): value is UseCaseId {
  return USE_CASE_ID_SET.has(value);
}

type UseCaseDetailPageProps = { slug: string };

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
        className="flex w-full items-center justify-between gap-6 py-4 text-left transition-colors hover:text-orange-600"
      >
        <span className="text-base text-neutral-800 dark:text-neutral-200">{question}</span>
        <span className="text-lg leading-none text-orange-500">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={isOpen ? 'block' : 'hidden'}>
        <p className="max-w-2xl pb-4 text-base leading-7 text-neutral-500 dark:text-neutral-400">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function UseCaseDetailPage({ slug }: UseCaseDetailPageProps) {
  const { t } = useTranslation();

  useLandingLanguageSync();

  if (!isUseCaseId(slug)) {
    notFound();
  }

  const path = `products.use_cases.${slug}`;
  const Icon = USE_CASE_ICONS[slug];
  const problemItems = stringListAt(t, `${path}.problems`);
  const benefitItems = stringListAt(t, `${path}.benefits`);
  const securityItems = stringListAt(t, `${path}.security`);
  const faqList = useMemo(
    () =>
      arrayAt<{ question: string; answer: string }>(t, `${path}.faq`).filter(
        (item) => item.question,
      ),
    [path, t],
  );
  const sampleQuestion = t(`${path}.sample_question`);
  const label = t(`${path}.label`);
  const otherIds = USE_CASE_IDS.filter((id) => id !== slug);
  const [openFaq, setOpenFaq] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const jsonLd = useMemo(() => {
    const useCaseUrl = `${SITE_URL}/use-cases/${slug}`;
    return [
      {
        '@context': SCHEMA_ORG,
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Use cases',
            item: `${SITE_URL}/use-cases`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: t(`${path}.label`),
            item: useCaseUrl,
          },
        ],
      },
      faqList.length
        ? {
            '@context': SCHEMA_ORG,
            '@type': 'FAQPage',
            mainEntity: faqList.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }
        : null,
      {
        '@context': SCHEMA_ORG,
        '@type': 'SoftwareApplication',
        name: `Prosperify - ${t(`${path}.label`)}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t(`${path}.description`),
        url: useCaseUrl,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
    ].filter(Boolean);
  }, [faqList, path, slug, t]);

  const pairs = problemItems
    .map((problem, index) => ({ problem, benefit: benefitItems[index] }))
    .filter((pair): pair is { problem: string; benefit: string } => Boolean(pair.benefit));

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <Script
        id="use-case-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-600 dark:text-neutral-400"
          href="/use-cases"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('use_cases_page.back_to_use_cases')}
        </Link>

        <div className="relative mt-12">
          <Icon
            aria-hidden
            strokeWidth={0.4}
            className="pointer-events-none absolute -top-16 right-0 hidden h-64 w-64 rotate-[8deg] text-orange-100 dark:text-orange-500/10 lg:block"
          />

          <div className="relative flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {label}
          </div>

          <h1 className="relative mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] text-neutral-950 dark:text-neutral-50 sm:text-5xl">
            {t(`${path}.title`)}
          </h1>

          <p className="relative mt-5 max-w-2xl text-xl leading-8 text-neutral-500 dark:text-neutral-400">
            {t(`${path}.description`)}
          </p>

          <Link
            href="/#contact"
            className="relative mt-8 inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {t('products.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pairs.length ? (
          <ol className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
            {pairs.map((pair, index) => (
              <li
                key={pair.problem}
                className="grid gap-x-8 gap-y-2 border-b border-neutral-200 py-8 dark:border-neutral-800 sm:grid-cols-[3rem_1fr_18rem] sm:items-baseline"
              >
                <span className="font-mono text-sm text-orange-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-balance text-2xl font-medium leading-snug text-neutral-950 dark:text-neutral-50">
                  {pair.benefit}
                </p>
                <p className="text-sm leading-6 text-neutral-400 dark:text-neutral-500">
                  {pair.problem}
                </p>
              </li>
            ))}
          </ol>
        ) : null}

        {sampleQuestion ? (
          <div className="mt-24 grid items-center gap-12 lg:grid-cols-[1fr_18rem] lg:gap-20">
            <div>
              <p className="text-balance text-2xl font-medium leading-[1.4] text-neutral-950 dark:text-neutral-50 sm:text-3xl">
                {sampleQuestion}
              </p>
              {benefitItems[2] ? (
                <p className="mt-5 max-w-md text-base leading-7 text-neutral-500 dark:text-neutral-400">
                  {benefitItems[2]}
                </p>
              ) : null}
            </div>

            <div aria-hidden className="relative hidden lg:block">
              <div className="absolute left-3 top-3 h-full w-full border border-neutral-200 dark:border-neutral-800" />
              <div className="relative border border-neutral-300 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-950">
                <div className="space-y-3">
                  {PAGE_LINES.map((width, index) =>
                    index === CITED_LINE_INDEX ? (
                      <div key={index} className="relative">
                        <span className="absolute -left-6 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-orange-500" />
                        <div className="h-2 bg-orange-500/85" style={{ width: `${width}%` }} />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="h-2 bg-neutral-200 dark:bg-neutral-800"
                        style={{ width: `${width}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {securityItems.length ? (
          <ul className="mt-24 grid gap-6 border-t border-neutral-200 pt-10 dark:border-neutral-800 sm:grid-cols-3 sm:gap-10">
            {securityItems.map((item) => (
              <li key={item} className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {faqList.length ? (
          <div className="mt-24 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {faqList.map((item, index) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openFaq.includes(index)}
                onToggle={() => toggleFaq(index)}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-24 flex flex-wrap gap-x-8 gap-y-3">
          {otherIds.map((id) => {
            const OtherIcon = USE_CASE_ICONS[id];

            return (
              <Link
                key={id}
                href={`/use-cases/${id}`}
                className="group inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-600 dark:text-neutral-400"
              >
                <OtherIcon className="h-4 w-4 text-orange-500" strokeWidth={1.8} />
                {t(`products.use_cases.${id}.label`)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
