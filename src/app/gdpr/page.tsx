import { headers } from 'next/headers';

import { uiLanguage } from '@/features/landing/lib/theme';
import GdprContent from '@/features/legal/components/gdpr-content';

import type { Metadata } from 'next';

const getLang = async (): Promise<'en' | 'fr'> => {
  try {
    const accept = (await headers()).get('Accept-Language') ?? '';
    return uiLanguage(accept);
  } catch {
    return 'en';
  }
};

export const generateMetadata = async (): Promise<Metadata> => {
  const lang = await getLang();
  return {
    title: lang === 'fr' ? 'Conformité RGPD - Prosperify' : 'GDPR Compliance - Prosperify',
    description:
      lang === 'fr'
        ? 'Conformité RGPD de Prosperify : vos droits et comment nous les mettons en œuvre.'
        : 'Prosperify GDPR compliance: your data protection rights and how we implement them.',
    alternates: {
      canonical: 'https://prosperify.app/gdpr',
      languages: {
        fr: 'https://prosperify.app/gdpr',
        en: 'https://prosperify.app/gdpr',
        'x-default': 'https://prosperify.app/gdpr',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default function GdprPage() {
  return <GdprContent />;
}
