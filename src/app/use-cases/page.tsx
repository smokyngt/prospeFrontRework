import { SITE_URL } from '@/config/constants';
import { UseCasesPage } from '@/features/landing/components/use-cases';

export const metadata = {
  title: 'Use cases - AI document search for legal, finance & medical teams | Prosperify',
  description:
    'See how the Prosperify research agent works for legal, accounting and medical teams: cited answers, contradictions flagged, controlled access. Search contracts, statements and clinical files in minutes.',
  keywords: [
    'AI document search',
    'AI contract review software',
    'financial statement analysis AI',
    'clinical document search AI',
    'legal research agent',
    'due diligence AI',
  ],
  alternates: {
    canonical: `${SITE_URL}/use-cases`,
  },
  openGraph: {
    title: 'Use cases - AI document search for legal, finance & medical teams | Prosperify',
    description:
      'See how the Prosperify research agent works for legal, accounting and medical teams: cited answers, contradictions flagged, controlled access.',
    url: `${SITE_URL}/use-cases`,
    type: 'website',
  },
};

const UseCasesRoute = () => {
  return <UseCasesPage />;
};

export default UseCasesRoute;
