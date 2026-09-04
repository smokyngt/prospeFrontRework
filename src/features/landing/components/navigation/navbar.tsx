'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeToggle } from '@/features/landing/components/theme';
import { useLandingLanguage } from '@/hooks/use-landing-language';
import { cn } from '@/lib/utils';

const FlagFR = () => (
  <span className="inline-flex h-3 w-4 items-center justify-center overflow-hidden rounded-[2px] border border-orange-300 align-middle">
    <span className="flex h-full w-full">
      <span className="h-full w-1/3 bg-[#0055A4]" />
      <span className="h-full w-1/3 bg-white" />
      <span className="h-full w-1/3 bg-[#EF4135]" />
    </span>
  </span>
);

const FlagEN = () => (
  <span className="inline-flex h-3 w-4 items-center justify-center overflow-hidden rounded-[2px] border border-orange-300 bg-[#012169] align-middle">
    <span className="relative block h-full w-full">
      <span className="absolute inset-y-0 left-1/2 w-[60%] -translate-x-1/2 bg-white" />
      <span className="absolute inset-x-0 top-1/2 h-[60%] -translate-y-1/2 bg-white" />
      <span className="absolute inset-y-0 left-1/2 w-[30%] -translate-x-1/2 bg-red-600" />
      <span className="absolute inset-x-0 top-1/2 h-[30%] -translate-y-1/2 bg-red-600" />
    </span>
  </span>
);

const navLinks = [
  { labelEn: 'Features', labelFr: 'Fonctionnalités', href: '#features' },
  { labelEn: 'Products', labelFr: 'Offres', href: '#products' },
  { labelEn: 'Use cases', labelFr: "Cas d'usage", href: '/use-cases' },
  { labelEn: 'Sovereignty', labelFr: 'Souveraineté', href: '#sovereignty' },
  { labelEn: 'Architecture', labelFr: 'Architecture', href: '#architecture' },
  { labelEn: 'Integrations', labelFr: 'Intégrations', href: '#integrations' },
  { labelEn: 'Blog', labelFr: 'Blog', href: '/blog' },
  { labelEn: 'Team', labelFr: 'Équipe', href: '/team' },
  { labelEn: 'Jobs', labelFr: 'Recrutement', href: '/jobs' },
];

function ProsperifyLogo() {
  return (
    <Image
      src="/assets/brand/logo-full.png"
      alt="Prosperify"
      width={148}
      height={80}
      className="h-11 w-auto object-contain"
      priority
    />
  );
}

export function LandingNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('#features');
  const { currentLang, switchLang } = useLandingLanguage();

  const isHome = pathname === '/';
  const contactHref = isHome ? '#contact' : '/#contact';

  useEffect(() => {
    if (!isHome) {
      return undefined;
    }

    const sectionIds = navLinks
      .map((link) => (link.href.startsWith('#') ? link.href.slice(1) : null))
      .filter((id): id is string => Boolean(id));
    const sections = sectionIds
      .map((id) => document.querySelector(`[data-section="${id}"]`))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveHash(`#${visible.target.id}`);
        }
      },
      { rootMargin: '-32% 0px -52% 0px', threshold: [0.08, 0.18, 0.32] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) {
      return href;
    }

    if (isHome) {
      return href;
    }

    return `/${href}`;
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 md:px-8 lg:px-20 2xl:max-w-[1700px]">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Prosperify"
          title="Prosperify - Accueil"
        >
          <ProsperifyLogo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isHome && link.href === activeHash;

            return (
              <Link
                key={link.href}
                href={resolveHref(link.href)}
                className={cn(
                  'relative whitespace-nowrap px-2.5 py-2 text-sm font-medium transition-colors hover:text-orange-500 dark:hover:text-orange-400',
                  active
                    ? 'text-neutral-950 dark:text-neutral-50'
                    : 'text-neutral-600 dark:text-neutral-300',
                )}
                scroll
                title={currentLang === 'en' ? link.labelEn : link.labelFr}
              >
                {currentLang === 'en' ? link.labelEn : link.labelFr}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-orange-500" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 border border-neutral-200 bg-white p-0.5 text-xs dark:border-neutral-800 dark:bg-neutral-950">
            <button
              type="button"
              onClick={() => switchLang('fr')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 font-medium transition-colors',
                currentLang === 'fr'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-500 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400',
              )}
            >
              <FlagFR /> FR
            </button>
            <button
              type="button"
              onClick={() => switchLang('en')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 font-medium transition-colors',
                currentLang === 'en'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-500 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400',
              )}
            >
              <FlagEN /> EN
            </button>
          </div>

          <ThemeToggle />

          <a
            href={contactHref}
            className="hidden items-center gap-2 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 md:inline-flex lg:ml-6 xl:ml-10"
            title={t('footer.links.contact')}
          >
            {t('footer.links.contact')}
          </a>

          <button
            type="button"
            className="text-neutral-600 lg:hidden dark:text-neutral-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-6 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={resolveHref(link.href)}
                className={cn(
                  'px-3 py-2.5 text-base font-medium transition-colors hover:bg-neutral-50 hover:text-orange-500 dark:hover:bg-neutral-900 dark:hover:text-orange-400',
                  isHome && link.href === activeHash
                    ? 'border-l-2 border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                    : 'text-neutral-600 dark:text-neutral-300',
                )}
                scroll
                onClick={() => setMobileOpen(false)}
                title={currentLang === 'en' ? link.labelEn : link.labelFr}
              >
                {currentLang === 'en' ? link.labelEn : link.labelFr}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-0.5 border border-neutral-200 bg-white p-0.5 text-xs dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
              <button
                type="button"
                onClick={() => switchLang('fr')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 font-medium transition-colors',
                  currentLang === 'fr'
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-500 dark:text-neutral-400',
                )}
              >
                <FlagFR /> FR
              </button>
              <button
                type="button"
                onClick={() => switchLang('en')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 font-medium transition-colors',
                  currentLang === 'en'
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-500 dark:text-neutral-400',
                )}
              >
                <FlagEN /> EN
              </button>
            </div>
            <a
              href={contactHref}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 md:hidden"
              onClick={() => setMobileOpen(false)}
              title={t('footer.links.contact')}
            >
              {t('footer.links.contact')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
