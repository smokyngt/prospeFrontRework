'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { uiLanguage } from '@/features/landing/lib/theme';

const FOOTER_LINK_CLASS =
  'text-sm text-neutral-600 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400 transition-colors';

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const title = typeof children === 'string' ? children : undefined;

  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={FOOTER_LINK_CLASS}
        title={title}
      >
        {children}
      </a>
    );
  }

  const resolvedHref = href.startsWith('#') && pathname !== '/' ? `/${href}` : href;

  return (
    <Link href={resolvedHref} className={FOOTER_LINK_CLASS} title={title}>
      {children}
    </Link>
  );
}

type FooterGroup = {
  links: { href: string; labelKey: string }[];
  title?: { en: string; fr: string };
  titleKey?: string;
};

const footerGroups: FooterGroup[] = [
  {
    titleKey: 'footer.product',
    links: [
      { labelKey: 'footer.links.workflow', href: '#workflow' },
      { labelKey: 'footer.links.features', href: '#features' },
      { labelKey: 'footer.links.deployment', href: '#products' },
      { labelKey: 'footer.links.use_cases', href: '/use-cases' },
      { labelKey: 'footer.links.sovereignty', href: '#sovereignty' },
      { labelKey: 'footer.links.architecture', href: '#architecture' },
      { labelKey: 'footer.links.integrations', href: '#integrations' },
    ],
  },
  {
    title: { en: 'Resources', fr: 'Ressources' },
    links: [
      { labelKey: 'footer.links.docs', href: 'https://docs.prosperify.app' },
      { labelKey: 'footer.links.blog', href: '/blog' },
      { labelKey: 'footer.links.faq', href: '#faq' },
    ],
  },
  {
    title: { en: 'Company', fr: 'Entreprise' },
    links: [
      { labelKey: 'footer.links.team', href: '/team' },
      { labelKey: 'footer.links.jobs', href: '/jobs' },
      { labelKey: 'footer.links.contact', href: '#contact' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { labelKey: 'footer.links.legal_notice', href: '/legal-notice' },
      { labelKey: 'footer.links.privacy', href: '/privacy' },
      { labelKey: 'footer.links.terms', href: '/terms' },
      { labelKey: 'footer.links.rgpd', href: '/gdpr' },
    ],
  },
];

const partners = [
  {
    src: '/assets/partners/pepite-beelyss.png',
    alt: 'Pépite BEELYS Lyon Saint-Étienne',
    label: 'Pépite BEELYS - Lyon Saint-Étienne',
    href: 'https://www.univ-st-etienne.fr/fr/entrepreneuriat/beelys.html',
  },
  {
    src: '/assets/partners/french-tech.png',
    alt: 'La French Tech',
    label: 'La French Tech',
    href: 'https://lafrenchtech.gouv.fr/',
  },
];

export function LandingFooter() {
  const { i18n, t } = useTranslation();
  const lang = uiLanguage(i18n.language);
  const pathname = usePathname();
  const contactHref = pathname === '/' ? '#contact' : '/#contact';

  return (
    <footer
      id="site-footer"
      className="relative z-10 border-t border-neutral-200 bg-white/72 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/72"
    >
      <div className="max-w-7xl mx-auto px-5 py-12 sm:px-6 md:px-8 lg:px-20 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-3 lg:grid-cols-[1.35fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center border border-orange-200 bg-white/70 px-3 py-2 dark:border-orange-500/30 dark:bg-neutral-950/70"
              aria-label="Prosperify home"
              title="Prosperify - Accueil"
            >
              <Image
                src="/assets/brand/logo-full.png"
                alt="Prosperify"
                width={148}
                height={80}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <Link
              href={contactHref}
              className="mt-5 inline-flex border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              title={t('footer.links.contact')}
            >
              {t('footer.links.contact')}
            </Link>
          </div>

          {footerGroups.map((group) => (
            <div key={group.titleKey ?? group.title?.en ?? 'footer-group'}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">
                {group.titleKey ? t(group.titleKey) : (group.title?.[lang] ?? '')}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{t(link.labelKey)}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-10 sm:mt-12 pt-8 sm:pt-10">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mb-6 font-medium uppercase tracking-widest">
            {t('footer.partners_title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {partners.map((partner) => (
              <a
                key={partner.src}
                className="flex flex-col items-center gap-2 group"
                href={partner.href}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={partner.label}
                title={partner.label}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={120}
                  height={48}
                  className="h-10 sm:h-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 text-center">
                  {partner.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-8 sm:mt-10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <a
            href="https://www.linkedin.com/company/prosperify-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-orange-500 transition-colors"
            aria-label="Prosperify LinkedIn"
            title="Prosperify LinkedIn"
          >
            <svg width="18" height="18" fill="current_color" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
