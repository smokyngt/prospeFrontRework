'use client';

import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SCHEMA_ORG, SITE_URL } from '@/config/constants';
import { LandingFooter } from '@/features/landing/components/footer';
import { LandingNavbar } from '@/features/landing/components/navigation';
import { USE_CASE_ICONS, USE_CASE_IDS, type UseCaseId } from '@/features/landing/data/use-cases';
import { useLandingLanguageSync } from '@/hooks/use-landing-language';

export function UseCaseCard({ id, bare = false }: { id: UseCaseId; bare?: boolean }) {
  const { t } = useTranslation();
  const Icon = USE_CASE_ICONS[id];

  return (
    <Link
      href={`/use-cases/${id}`}
      className={
        bare
          ? 'group flex flex-col p-5 transition-colors hover:bg-neutral-50 sm:p-6 dark:hover:bg-white/[0.05]'
          : 'group flex flex-col border border-neutral-200 bg-white p-5 transition-colors hover:border-orange-200 dark:border-neutral-800 dark:bg-neutral-950 sm:p-6'
      }
    >
      <div className="flex h-9 w-9 items-center justify-center border border-orange-200/60 bg-orange-100 text-orange-500 dark:border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400">
        <Icon size={16} strokeWidth={1.7} />
      </div>
      <div className="flex-1">
        <span className="mt-2.5 block text-xs font-semibold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
          {t(`products.use_cases.${id}.label`)}
        </span>
        <h2 className="mt-1.5 text-lg font-semibold leading-snug text-neutral-950 dark:text-neutral-50">
          {t(`products.use_cases.${id}.title`)}
        </h2>
        <p className="mt-1.5 text-[13px] leading-5 text-neutral-600 dark:text-neutral-300">
          {t(`products.use_cases.${id}.description`)}
        </p>
      </div>

      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors group-hover:text-orange-600 dark:text-neutral-50">
        {t('use_cases_page.view_details')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function UseCasesPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  useLandingLanguageSync();

  const jsonLd = useMemo(
    () => ({
      '@context': SCHEMA_ORG,
      '@type': 'ItemList',
      itemListElement: USE_CASE_IDS.map((id, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: t(`products.use_cases.${id}.title`),
        url: `${SITE_URL}/use-cases/${id}`,
      })),
    }),
    [t],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredIds = normalizedQuery
    ? USE_CASE_IDS.filter((id) => {
        const haystack = [
          t(`products.use_cases.${id}.label`),
          t(`products.use_cases.${id}.title`),
          t(`products.use_cases.${id}.description`),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : USE_CASE_IDS;

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <Script
        id="use-cases-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
          {t('use_cases_page.badge')}
        </span>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.08] text-neutral-950 dark:text-neutral-50 sm:text-5xl">
          {t('use_cases_page.title_prefix')}{' '}
          <span className="text-orange-600">{t('use_cases_page.title_highlight')}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
          {t('use_cases_page.subtitle')}
        </p>

        <div className="relative mt-8 max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('use_cases_page.search_placeholder')}
            className="w-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500"
          />
        </div>

        {filteredIds.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {filteredIds.map((id) => (
              <UseCaseCard key={id} id={id} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
            {t('use_cases_page.search_empty')}
          </p>
        )}
      </section>
      <LandingFooter />
    </main>
  );
}
