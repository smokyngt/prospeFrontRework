import { headers } from 'next/headers';

import { uiLanguage } from '@/features/landing/lib/theme';
import TermsContent from '@/features/legal/components/terms-content';

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
    title:
      lang === 'fr' ? "Conditions d'utilisation - Prosperify" : 'Terms of Service - Prosperify',
    description:
      lang === 'fr'
        ? "Conditions générales d'utilisation de Prosperify."
        : 'Prosperify terms and conditions for the use of our services.',
    alternates: {
      canonical: 'https://prosperify.app/terms',
      languages: {
        fr: 'https://prosperify.app/terms',
        en: 'https://prosperify.app/terms',
        'x-default': 'https://prosperify.app/terms',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default function TermsPage() {
  return <TermsContent />;
}
