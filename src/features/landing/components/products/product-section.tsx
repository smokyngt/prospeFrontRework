'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { USE_CASE_ICONS, USE_CASE_IDS } from '@/features/landing/data/use-cases';
import { cn } from '@/lib/utils';

const CYCLE_MS = 4500;

export default function ProductSection() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || document.hidden) {
      return undefined;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % USE_CASE_IDS.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [isVisible, isPaused]);

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl [overflow-anchor:none] 2xl:max-w-[1300px]">
      <div className="scroll-mt-8 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
          {t('products.title_prefix')}{' '}
          <span className="text-orange-500">{t('products.title_highlight')}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base">
          {t('products.intro')}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-stretch">
        {USE_CASE_IDS.map((caseId, index) => {
          const Icon = USE_CASE_ICONS[caseId];
          const isActive = activeIndex === index;
          const path = `products.use_cases.${caseId}`;

          return (
            <div
              key={caseId}
              onMouseEnter={() => {
                setActiveIndex(index);
                setIsPaused(true);
              }}
              onMouseLeave={() => setIsPaused(false)}
              className="relative flex flex-1 flex-col overflow-hidden border border-neutral-200 bg-white p-6 transition-colors duration-300 ease-out dark:border-neutral-800 dark:bg-neutral-950 sm:p-7"
            >
              <Icon
                aria-hidden
                strokeWidth={0.75}
                className={cn(
                  'pointer-events-none absolute -bottom-8 -right-8 h-44 w-44 rotate-[-8deg] transition-colors duration-500',
                  isActive
                    ? 'text-orange-200/70 dark:text-orange-500/20'
                    : 'text-neutral-200 dark:text-neutral-800',
                )}
              />

              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                onFocus={() => {
                  setActiveIndex(index);
                  setIsPaused(true);
                }}
                onBlur={() => setIsPaused(false)}
                aria-pressed={isActive}
                className="relative z-10 flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-orange-200 bg-orange-50 text-orange-500 dark:border-orange-500/25 dark:bg-orange-500/10">
                  <Icon size={18} strokeWidth={1.7} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
                  {t(`${path}.label`)}
                </span>
              </button>

              <div className="relative z-10 mt-5">
                <h3 className="text-xl font-semibold leading-snug text-neutral-950 dark:text-neutral-50">
                  {t(`${path}.title`)}
                </h3>
                <Link
                  href={`/use-cases/${caseId}`}
                  className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors hover:text-orange-600 dark:text-neutral-50"
                >
                  {t('products.explore')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/use-cases"
          className="inline-flex items-center justify-center gap-2 border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:border-orange-500/25"
        >
          {t('products.view_all')}
        </Link>
        <a
          href="#contact"
          className="inline-flex items-center justify-center gap-2 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600"
        >
          {t('products.cta')}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
