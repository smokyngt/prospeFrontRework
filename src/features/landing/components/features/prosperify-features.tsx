'use client';

import { BookOpen, Bot, Brain, ChevronLeft, ChevronRight, Globe, Shield, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type TouchEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const features = [
  {
    id: 'precision',
    icon: Brain,
    shortTitleKey: 'features.items.precision.short_title',
    titleKey: 'features.items.precision.title',
    subtitleKey: 'features.items.precision.subtitle',
    descriptionKey: 'features.items.precision.description',
  },
  {
    id: 'coverage',
    icon: BookOpen,
    shortTitleKey: 'features.items.coverage.short_title',
    titleKey: 'features.items.coverage.title',
    subtitleKey: 'features.items.coverage.subtitle',
    descriptionKey: 'features.items.coverage.description',
  },
  {
    id: 'performance',
    icon: Zap,
    shortTitleKey: 'features.items.performance.short_title',
    titleKey: 'features.items.performance.title',
    subtitleKey: 'features.items.performance.subtitle',
    descriptionKey: 'features.items.performance.description',
  },
  {
    id: 'governance',
    icon: Shield,
    shortTitleKey: 'features.items.governance.short_title',
    titleKey: 'features.items.governance.title',
    subtitleKey: 'features.items.governance.subtitle',
    descriptionKey: 'features.items.governance.description',
  },
  {
    id: 'orchestration',
    icon: Bot,
    shortTitleKey: 'features.items.orchestration.short_title',
    titleKey: 'features.items.orchestration.title',
    subtitleKey: 'features.items.orchestration.subtitle',
    descriptionKey: 'features.items.orchestration.description',
  },
  {
    id: 'differentiation',
    icon: Globe,
    shortTitleKey: 'features.items.differentiation.short_title',
    titleKey: 'features.items.differentiation.title',
    subtitleKey: 'features.items.differentiation.subtitle',
    descriptionKey: 'features.items.differentiation.description',
  },
];

const AUTO_SLIDE_DELAY_MS = 8000;

const STEP_PANEL_PAD = 16;
const STEP_MARK_H = 36;
const STEP_ROW_H = STEP_MARK_H + 8 * 2;

export default function ProsperifyFeatures() {
  const { t } = useTranslation();
  const [[activeTab], setPage] = useState([0, 0]);
  const [autoResetKey, setAutoResetKey] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const wasVisibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      setIsCarouselPaused(false);
      setPage([0, -1]);
      setAutoResetKey((key) => key + 1);
    }

    wasVisibleRef.current = isVisible;
  }, [isVisible]);

  const selectSlide = useCallback((index: number, userInitiated = false) => {
    const next = (index + features.length) % features.length;

    setPage(([current]) => {
      if (current === next) {
        return [current, 0];
      }

      const direction =
        current === features.length - 1 && next === 0
          ? 1
          : current === 0 && next === features.length - 1
            ? -1
            : next > current
              ? 1
              : -1;

      return [next, direction];
    });

    if (userInitiated) {
      setAutoResetKey((key) => key + 1);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || isCarouselPaused || document.hidden) {
      return;
    }

    const timer = setTimeout(() => {
      selectSlide(activeTab + 1);
    }, AUTO_SLIDE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [activeTab, autoResetKey, isCarouselPaused, isVisible, selectSlide]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setIsCarouselPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;

    if (startX === null) {
      setIsCarouselPaused(false);
      return;
    }

    const deltaX = event.changedTouches[0]?.clientX ? event.changedTouches[0].clientX - startX : 0;

    if (Math.abs(deltaX) >= 42) {
      selectSlide(deltaX < 0 ? activeTab + 1 : activeTab - 1, true);
    }

    window.setTimeout(() => setIsCarouselPaused(false), 300);
  };

  const item = features[activeTab];

  return (
    <div
      ref={sectionRef}
      className="max-w-7xl mx-auto relative [overflow-anchor:none] 2xl:max-w-[1500px]"
    >
      <div className="text-center mb-6 scroll-mt-8 sm:mb-8">
        <h2 className="mb-3 text-balance text-3xl font-semibold leading-[1.08] sm:mb-4 sm:text-4xl lg:text-5xl">
          {t('features.title')} <br />{' '}
          <span className="text-orange-500"> {t('features.title_highlight')} </span>
        </h2>
        <p className="mx-auto max-w-4xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
          {t('features.subtitle')}{' '}
        </p>
      </div>

      <div className="relative lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-10">
        {/* Desktop vertical step indicators */}
        <div className="hidden lg:block">
          <div className="relative h-full border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
            <div
              className="absolute left-[66px] w-px bg-neutral-200 dark:bg-neutral-800"
              style={{
                top: `${STEP_PANEL_PAD + STEP_ROW_H / 2}px`,
                height: `${(features.length - 1) * STEP_ROW_H}px`,
              }}
            />
            <div
              className="absolute left-[66px] w-px bg-orange-500 transition-all duration-700 ease-out"
              style={{
                top: `${STEP_PANEL_PAD + activeTab * STEP_ROW_H + (STEP_ROW_H - STEP_MARK_H) / 2}px`,
                height: `${STEP_MARK_H}px`,
              }}
            />
            {features.map((feature, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={feature.id}
                  onClick={() => selectSlide(index, true)}
                  onMouseEnter={() => selectSlide(index, true)}
                  type="button"
                  className={`group relative w-full cursor-pointer text-left transition-all duration-500 ${isActive ? 'bg-orange-50/70 dark:bg-orange-500/10' : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50'}`}
                >
                  <div className="flex items-center gap-4 py-2 pl-8 pr-4">
                    <div
                      className={`relative z-10 flex h-9 w-9 items-center justify-center border text-xs font-mono font-bold transition-all duration-500 ${isActive ? 'border-orange-500 bg-white text-orange-500 shadow-sm dark:border-orange-500 dark:bg-neutral-900' : 'border-neutral-200 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-500'}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold leading-snug transition-colors duration-500 ${isActive ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-500 dark:text-neutral-400'}`}
                      >
                        {t(feature.shortTitleKey)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel */}
        <div
          className="min-w-0 border border-neutral-200 bg-white shadow-[0_20px_80px_-60px_rgba(15,23,42,0.65)] dark:border-neutral-800 dark:bg-neutral-950"
          onBlurCapture={() => setIsCarouselPaused(false)}
          onFocusCapture={() => setIsCarouselPaused(true)}
          onPointerEnter={() => setIsCarouselPaused(true)}
          onPointerLeave={() => setIsCarouselPaused(false)}
        >
          <div
            className="relative flex h-[340px] touch-pan-y overflow-hidden px-5 py-5 sm:h-[360px] sm:px-6 sm:py-6 lg:h-[380px] lg:px-10 lg:py-8"
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex w-full flex-col justify-center"
              >
                <div className="mb-4 flex min-h-11 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-orange-200 bg-orange-50 text-orange-500 dark:border-orange-500/30 dark:bg-orange-500/10 sm:h-11 sm:w-11">
                    {(() => {
                      const Icon = item.icon;
                      return <Icon size={18} strokeWidth={1.5} className="sm:size-5" />;
                    })()}
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-neutral-300 dark:text-neutral-600">
                    {String(activeTab + 1).padStart(2, '0')} /{' '}
                    {String(features.length).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mb-2 min-h-[56px] max-w-3xl text-xl font-bold text-neutral-900 text-balance dark:text-neutral-50 sm:min-h-[64px] sm:text-2xl lg:text-3xl">
                  {t(item.titleKey)}
                </h3>

                <p className="mb-3 flex min-h-[24px] items-start text-sm font-semibold leading-6 text-[#ff6a13] dark:text-[#ff8a3d]">
                  {t(item.subtitleKey)}
                </p>

                <p className="max-w-3xl text-sm text-neutral-600 leading-7 text-pretty dark:text-neutral-400 sm:text-base">
                  {t(item.descriptionKey)}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => selectSlide(activeTab - 1, true)}
              className="absolute left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center border border-neutral-200 bg-transparent text-neutral-500 transition-colors hover:border-orange-200 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-500/40 lg:flex"
              aria-label="Previous feature"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => selectSlide(activeTab + 1, true)}
              className="absolute right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center border border-neutral-200 bg-transparent text-neutral-500 transition-colors hover:border-orange-200 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-500/40 lg:flex"
              aria-label="Next feature"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 pb-2 lg:hidden">
            <button
              type="button"
              onClick={() => selectSlide(activeTab - 1, true)}
              className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-transparent text-neutral-500 transition-colors hover:border-orange-200 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-500/40"
              aria-label="Previous feature"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => selectSlide(activeTab + 1, true)}
              className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-transparent text-neutral-500 transition-colors hover:border-orange-200 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-500/40"
              aria-label="Next feature"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pb-4 sm:pb-5">
            {features.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSlide(index, true)}
                className="flex h-11 w-11 items-center justify-center"
                aria-label={`Go to feature ${index + 1}`}
              >
                <span
                  className={`h-2 transition-all duration-500 ${activeTab === index ? 'w-4 bg-orange-500' : 'w-2 bg-neutral-400 hover:bg-orange-400 dark:bg-neutral-500 dark:hover:bg-orange-400'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
