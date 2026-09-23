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
    <div ref={rootRef} className="w-full [overflow-anchor:none]">
      <div className="scroll-mt-8 text-center">
        <h2
          className="mx-auto max-w-2xl text-balance font-bold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
        >
          {t('products.title_prefix')}{' '}
          <span className="text-orange-500">{t('products.title_highlight')}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
          {t('products.intro')}
        </p>
      </div>

      <div className="mt-[var(--pf-block-gap)] flex flex-col gap-[var(--pf-block-gap)] sm:flex-row sm:items-stretch">
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
              className="relative flex min-h-[260px] min-w-0 flex-1 flex-col items-center overflow-hidden border border-neutral-200 bg-transparent px-6 py-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_20px_40px_-24px_rgba(255,106,19,0.5)] dark:border-neutral-800 dark:hover:border-orange-500/50 sm:min-h-[300px] lg:px-8 lg:py-10"
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
                className="relative z-10 flex w-full flex-col items-center gap-3 text-center"
              >
                <span className="text-base font-semibold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400 sm:text-lg">
                  {t(`${path}.label`)}
                </span>
              </button>

              <div className="relative z-10 mt-[var(--pf-block-gap)] flex w-full flex-1 flex-col items-center text-center">
                <h3 className="text-xl font-semibold leading-snug text-neutral-950 dark:text-neutral-50">
                  {t(`${path}.title`)}
                </h3>
                <Link
                  href={`/sectors/${caseId === "accounting" ? "finance" : caseId === "medical" ? "healthcare" : "legal"}`}
                  className="group mt-auto inline-flex items-center gap-2 pt-[var(--pf-cta-gap)] text-sm font-semibold text-neutral-950 transition-colors hover:text-orange-600 dark:text-neutral-50"
                >
                  {t('products.explore')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-[var(--pf-cta-gap)] flex flex-col items-center justify-center gap-3 sm:flex-row">
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
