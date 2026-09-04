import { headers } from 'next/headers';

import { canonicalUrl } from '@/config/constants';
import LegalNoticeContent from '@/features/legal/components/legal-notice-content';

import type { Metadata } from 'next';

const getLang = async (): Promise<'en' | 'fr'> => {
  try {
    const accept = (await headers()).get('Accept-Language') ?? '';
    return accept.startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
};

export const generateMetadata = async (): Promise<Metadata> => {
  const lang = await getLang();
  return {
    title: lang === 'fr' ? 'Mentions légales - Prosperify' : 'Legal Notice - Prosperify',
    description:
      lang === 'fr'
        ? 'Mentions légales de Prosperify SAS : éditeur, hébergement, propriété intellectuelle et droit applicable.'
        : 'Prosperify SAS legal notice: publisher, hosting, intellectual property and applicable law.',
    alternates: {
      canonical: canonicalUrl('/legal-notice'),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default function LegalNoticePage() {
  return <LegalNoticeContent />;
}
