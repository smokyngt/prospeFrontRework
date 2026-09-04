import { headers } from 'next/headers';

import { uiLanguage } from '@/features/landing/lib/theme';
import PrivacyContent from '@/features/legal/components/privacy-content';

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
      lang === 'fr' ? 'Politique de confidentialité - Prosperify' : 'Privacy Policy - Prosperify',
    description:
      lang === 'fr'
        ? 'Politique de confidentialité Prosperify : comment nous collectons, traitons et protégeons vos données personnelles.'
        : 'Prosperify privacy policy: how we collect, process and protect your personal data.',
    alternates: {
      canonical: 'https://prosperify.app/privacy',
      languages: {
        fr: 'https://prosperify.app/privacy',
        en: 'https://prosperify.app/privacy',
        'x-default': 'https://prosperify.app/privacy',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
