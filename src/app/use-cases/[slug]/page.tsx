import { canonicalUrl } from '@/config/constants';
import { UseCaseDetailPage } from '@/features/landing/components/use-cases';

type UseCaseRouteProps = {
  params: Promise<{ slug: string }>;
};

const USE_CASE_METADATA: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  legal: {
    title: 'AI contract review software | Prosperify',
    description:
      'Turn contract review into minutes, not days: clause-level search across contracts and data rooms, contradictions flagged, citations to the exact clause and page.',
    keywords: [
      'AI contract review',
      'contract review software',
      'due diligence AI',
      'data room search',
      'legal document search',
      'clause extraction',
    ],
  },
  accounting: {
    title: 'AI financial statement analysis | Prosperify',
    description:
      'Verify figures across reports in minutes: cross-document search, discrepancies flagged between sources, every number cited to its originating page.',
    keywords: [
      'financial statement analysis AI',
      'audit document search',
      'EBITDA reconciliation',
      'financial due diligence AI',
      'discrepancy detection',
    ],
  },
  medical: {
    title: 'AI clinical document search | Prosperify',
    description:
      'Find the relevant clinical detail, fast: search across patient files, studies and protocols, with answers cited to the exact page for review.',
    keywords: [
      'clinical document search AI',
      'medical file search',
      'protocol analysis AI',
      'patient records search',
      'clinical study analysis',
    ],
  },
};

const UseCaseRoute = async ({ params }: UseCaseRouteProps) => {
  const { slug } = await params;

  return <UseCaseDetailPage slug={slug} />;
};

export default UseCaseRoute;

export const generateMetadata = async ({ params }: UseCaseRouteProps) => {
  const { slug } = await params;
  const meta = USE_CASE_METADATA[slug];
  const seoTitle = meta?.title ?? 'Use cases | Prosperify';
  const description = meta?.description ?? 'Prosperify use cases.';
  const pageUrl = canonicalUrl(`/use-cases/${slug}`);

  return {
    title: seoTitle,
    description,
    keywords: meta?.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seoTitle,
      description,
      url: pageUrl,
      type: 'website',
    },
  };
};

export const generateStaticParams = async () => {
  return Object.keys(USE_CASE_METADATA).map((slug) => ({ slug }));
};
