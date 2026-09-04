import { canonicalUrl } from '@/config/constants';
import { JobsPage } from '@/features/landing/components/jobs';
import { workspace } from '@/features/landing/data/workspace-api';

export const metadata = {
  title: 'Jobs | Prosperify',
  description:
    'Open roles and hiring updates from Prosperify, the governed document AI platform for enterprise teams.',
  alternates: {
    canonical: canonicalUrl('/jobs'),
  },
  openGraph: {
    title: 'Jobs | Prosperify',
    description:
      'Open roles and hiring updates from Prosperify, the governed document AI platform for enterprise teams.',
  },
};

const JobsRoute = async () => {
  const openings = await workspace.job.openings();

  return <JobsPage initialOpenings={openings} lang="fr" />;
};

export default JobsRoute;
