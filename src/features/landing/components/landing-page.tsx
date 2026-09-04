'use client';

import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ContactForm } from '@/features/contact/components';
import { ArchitectureDemo } from '@/features/landing/components/architecture';
import { GridBackground } from '@/features/landing/components/background';
import { FAQSection } from '@/features/landing/components/faq';
import { ProsperifyFeatures } from '@/features/landing/components/features';
import { LandingFooter } from '@/features/landing/components/footer';
import { IntegrationsSection } from '@/features/landing/components/integrations';
import { LandingNavbar } from '@/features/landing/components/navigation';
import { ProductSection } from '@/features/landing/components/products';
import { SovereigntySection } from '@/features/landing/components/sovereignty';
import { WorkflowSection } from '@/features/landing/components/workflow';
import { uiLanguage } from '@/features/landing/lib/theme';
import { useLandingLanguageSync } from '@/hooks/use-landing-language';

type LandingPageProps = {
  lang?: string;
};

const SECTION_IDS = [
  'hero',
  'workflow',
  'features',
  'products',
  'sovereignty',
  'architecture',
  'integrations',
  'faq',
  'contact',
  'footer',
];

const SECTION_NAV_TOLERANCE = 8;

const DeferredDemo = dynamic(
  () => import('@/features/landing/components/demo').then((mod) => mod.IntelligenceDemo),
  {
    loading: () => <HeroDemoPlaceholder />,
    ssr: false,
  },
);

function HeroDemoPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="client-ui flex max-sm:h-[520px] h-[min(620px,calc(100dvh-13rem))] flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
    >
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-3 h-7 flex-1 rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
      <div className="grid flex-1 grid-cols-[0.36fr_0.64fr]">
        <div className="space-y-3 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
          <div className="h-9 rounded-md bg-orange-100 dark:bg-orange-500/15" />
          <div className="h-8 rounded-md bg-white dark:bg-neutral-800" />
          <div className="mt-5 h-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-12 rounded-xl bg-white dark:bg-neutral-800" />
          <div className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/70" />
          <div className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/70" />
        </div>
        <div className="flex flex-col bg-white p-5 dark:bg-neutral-950">
          <div className="h-14 max-w-[70%] rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-4 ml-auto h-20 w-[68%] rounded-xl bg-[#ff6a13]" />
          <div className="mt-4 h-24 max-w-[78%] rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-auto h-12 rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60" />
        </div>
      </div>
    </div>
  );
}

function LazyHeroDemo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      return undefined;
    }

    const load = () => setReady(true);

    if (typeof window.requestIdleCallback === 'function') {
      const idleHandle = window.requestIdleCallback(load, { timeout: 1800 });

      return () => window.cancelIdleCallback(idleHandle);
    }

    const timeout = window.setTimeout(load, 1200);

    return () => window.clearTimeout(timeout);
  }, [ready]);

  if (ready) {
    return <DeferredDemo />;
  }

  const loadDemo = () => setReady(true);

  return (
    <div onFocus={loadDemo} onPointerEnter={loadDemo} onTouchStart={loadDemo}>
      <HeroDemoPlaceholder />
    </div>
  );
}

function Section({
  children,
  className = '',
  fluid = false,
  id,
  sectionId,
}: {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  id?: string;
  sectionId?: string;
}) {
  return (
    <section
      id={sectionId ?? id}
      data-section={sectionId}
      className={`relative flex min-h-[100dvh] xl:min-h-0 flex-col justify-center pt-20 ${
        fluid ? 'xl:h-auto' : 'xl:h-[min(100dvh,900px)] xl:overflow-hidden'
      } ${className}`}
    >
      <div className={`min-h-0 flex-1 ${fluid ? '' : 'overflow-hidden'}`}>
        <div className="flex min-h-full flex-col justify-center">
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-6 md:px-8 lg:px-20 2xl:max-w-[1700px]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-transparent">
      <div className="relative">{children}</div>
    </div>
  );
}

function HeroSectionWrapper() {
  const { i18n: i18nInst } = useTranslation();
  const lang = uiLanguage(i18nInst.language);

  const copy =
    lang === 'fr'
      ? {
          title1: "L'agent de",
          highlight: 'recherche',
          title2: 'pour les documents de votre métier.',
          subtitle:
            'Posez une question sur vos contrats, dossiers financiers ou protocoles. Prosperify croise les sources, signale les contradictions et cite la page exacte, dans notre cloud européen ou entièrement dans votre périmètre.',
          primary: 'Demander une démo',
          secondary: 'Voir le workflow',
        }
      : {
          title1: 'The',
          highlight: 'research agent',
          title2: "for your profession's documents.",
          subtitle:
            'Ask one question across your contracts, financial files or protocols. Prosperify cross-checks the sources, flags contradictions and cites the exact page, in our EU cloud or entirely inside your own perimeter.',
          primary: 'Request a demo',
          secondary: 'See the workflow',
        };

  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-[100dvh] xl:min-h-0 flex-col justify-center pt-20 xl:h-[min(100dvh,900px)] xl:overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-full flex-col justify-center">
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-6 md:px-8 lg:px-20 2xl:max-w-[1700px]">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div className="space-y-6 lg:max-w-[520px]">
                <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-neutral-950 sm:text-5xl dark:text-neutral-50">
                  {copy.title1} <span className="text-orange-500">{copy.highlight}</span> <br />
                  {copy.title2}
                </h1>
                <p className="max-w-lg text-lg leading-8 text-neutral-500 dark:text-neutral-400">
                  {copy.subtitle}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-600"
                    title={copy.primary}
                  >
                    {copy.primary}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#workflow"
                    className="inline-flex items-center justify-center gap-2 border border-neutral-200 bg-white px-7 py-3.5 text-sm font-semibold text-neutral-800 transition-all hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-orange-800"
                    title={copy.secondary}
                  >
                    {copy.secondary}
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 -z-10 bg-orange-100/40 blur-3xl dark:bg-orange-500/10" />
                <div className="overflow-hidden border border-neutral-200 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
                  <LazyHeroDemo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchSectionWrapper({ sectionId }: { sectionId?: string }) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-transparent">
      <section
        id={sectionId}
        data-section={sectionId}
        className="relative flex min-h-[100dvh] xl:min-h-0 flex-col justify-center pt-20 py-5 xl:h-[min(100dvh,900px)] xl:overflow-hidden sm:py-6 lg:py-8"
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-full flex-col justify-center">
            <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-6 md:px-8 lg:px-20 2xl:max-w-[1700px]">
              <div className="mb-4 scroll-mt-8 text-center sm:mb-5">
                <h2 className="mb-2 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 sm:mb-3 sm:text-4xl lg:text-5xl">
                  {t('architecture.title_prefix')}{' '}
                  <span className="text-orange-500">{t('architecture.title_highlight')}</span>
                </h2>
                <p className="mx-auto max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
                  {t('architecture.subtitle')}
                </p>
              </div>
              <ArchitectureDemo />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionNavigator() {
  const [navState, setNavState] = useState({
    canGoNext: true,
    canGoPrevious: false,
  });
  const sectionIds = useMemo(() => SECTION_IDS, []);

  const getSections = useCallback(
    () =>
      sectionIds
        .map((id) =>
          id === 'footer'
            ? document.querySelector<HTMLElement>('footer#site-footer')
            : document.querySelector<HTMLElement>(`section#${id}`),
        )
        .filter((section): section is HTMLElement => Boolean(section)),
    [sectionIds],
  );

  const getHeaderOffset = useCallback(
    () =>
      [...document.querySelectorAll<HTMLElement>('nav')]
        .find((element) => getComputedStyle(element).position === 'fixed')
        ?.getBoundingClientRect().height ?? 0,
    [],
  );

  const getSectionPositions = useCallback(() => {
    const offset = getHeaderOffset();

    return getSections().map((section) => ({
      element: section,
      top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset),
    }));
  }, [getHeaderOffset, getSections]);

  const updateNavState = useCallback(() => {
    const positions = getSectionPositions();

    if (positions.length === 0) {
      setNavState({ canGoNext: false, canGoPrevious: false });
      return;
    }

    const currentTop = window.scrollY;
    const firstTop = positions[0]?.top ?? 0;
    const lastTop = positions.at(-1)?.top ?? firstTop;

    setNavState({
      canGoNext: currentTop < lastTop - SECTION_NAV_TOLERANCE,
      canGoPrevious: currentTop > firstTop + SECTION_NAV_TOLERANCE,
    });
  }, [getSectionPositions]);

  const scrollByDirection = (direction: -1 | 1) => {
    const positions = getSectionPositions();
    const currentTop = window.scrollY;
    const target =
      direction > 0
        ? positions.find((section) => section.top > currentTop + SECTION_NAV_TOLERANCE)
        : positions
            .toReversed()
            .find((section) => section.top < currentTop - SECTION_NAV_TOLERANCE);

    if (!target) {
      return;
    }

    window.scrollTo({
      behavior: 'smooth',
      top: target.top,
    });

    window.setTimeout(updateNavState, 700);
  };

  useEffect(() => {
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState);

    return () => {
      window.removeEventListener('scroll', updateNavState);
      window.removeEventListener('resize', updateNavState);
    };
  }, [updateNavState]);

  return (
    <div className="fixed bottom-5 right-5 z-40 hidden flex-col gap-1.5 xl:flex">
      <button
        type="button"
        aria-label="Previous section"
        className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-transparent text-neutral-400 transition-colors hover:border-orange-200 hover:text-orange-500 disabled:pointer-events-none disabled:opacity-0 dark:border-neutral-800 dark:text-neutral-600 dark:hover:border-orange-500/40"
        disabled={!navState.canGoPrevious}
        onClick={() => scrollByDirection(-1)}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next section"
        className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-transparent text-neutral-400 transition-colors hover:border-orange-200 hover:text-orange-500 disabled:pointer-events-none disabled:opacity-0 dark:border-neutral-800 dark:text-neutral-600 dark:hover:border-orange-500/40"
        disabled={!navState.canGoNext}
        onClick={() => scrollByDirection(1)}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function ContactWrapper({ sectionId }: { sectionId?: string }) {
  const { i18n: i18nInst } = useTranslation();
  const lang = uiLanguage(i18nInst.language);

  const copy =
    lang === 'fr'
      ? {
          title: 'Cadrons votre premier pilote métier',
          lead: 'Choisissez un ensemble de documents (contrats, data rooms ou protocoles) et nous répondons avec un parcours de pilote concret et mesurable, dans votre périmètre.',
        }
      : {
          title: 'Frame your first domain pilot',
          lead: 'Pick a document set (contracts, deal files or protocols) and we will respond with a concrete, measurable pilot path, inside your perimeter.',
        };

  return (
    <section
      id={sectionId}
      data-section={sectionId}
      className="relative flex min-h-[100dvh] xl:min-h-[min(100dvh,900px)] flex-col justify-center pt-20 py-8 sm:py-10 lg:py-12"
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-full flex-col justify-center">
          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-6 md:px-8 lg:px-20 2xl:max-w-[1500px]">
            <div className="grid gap-6 border border-neutral-200 bg-white/88 p-5 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
              <div>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-orange-500">
                  {lang === 'fr' ? 'Contact' : 'Contact'}
                </span>
                <h2 className="mt-3 text-2xl font-bold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-3xl lg:text-4xl">
                  {copy.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400 sm:text-base">
                  {copy.lead}
                </p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ lang }: LandingPageProps) {
  useLandingLanguageSync(lang);

  return (
    <div className="relative min-h-screen bg-transparent [overflow-anchor:none]">
      <GridBackground />
      <LandingNavbar />
      <SectionNavigator />

      <main className="relative z-10 [overflow-anchor:none]">
        <HeroSectionWrapper />

        <div className="relative overflow-hidden bg-white dark:bg-neutral-950">
          <Section sectionId="workflow" className="py-10 sm:py-12 lg:py-14">
            <WorkflowSection />
          </Section>
        </div>

        <Section sectionId="features" className="py-12 sm:py-16 lg:py-20 xl:py-8">
          <ProsperifyFeatures />
        </Section>

        <SectionBg>
          <Section sectionId="products" className="py-12 sm:py-16 lg:py-20">
            <ProductSection />
          </Section>
        </SectionBg>

        <Section sectionId="sovereignty" className="py-12 sm:py-16 lg:py-20">
          <SovereigntySection />
        </Section>

        <ArchSectionWrapper sectionId="architecture" />

        <Section sectionId="integrations" className="py-12 sm:py-16 lg:py-20">
          <IntegrationsSection />
        </Section>

        <SectionBg>
          <Section fluid sectionId="faq" className="py-8 sm:py-10 lg:py-12">
            <FAQSection />
          </Section>
        </SectionBg>

        <ContactWrapper sectionId="contact" />
      </main>

      <LandingFooter />
    </div>
  );
}
