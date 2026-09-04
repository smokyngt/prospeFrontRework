import { TeamPage } from '@/features/landing/components/team';
import { loadTeamMembers } from '@/features/landing/data/workspace-api';

export const metadata = {
  title: 'Team | Prosperify',
  description: 'Meet the Prosperify team building governed document AI for enterprise knowledge.',
  alternates: {
    canonical: 'https://prosperify.app/team',
    languages: {
      fr: 'https://prosperify.app/team',
      en: 'https://prosperify.app/team',
      'x-default': 'https://prosperify.app/team',
    },
  },
  openGraph: {
    title: 'Team | Prosperify',
    description: 'Meet the Prosperify team building governed document AI for enterprise knowledge.',
  },
};

const TeamRoute = async () => {
  const members = await loadTeamMembers();

  return <TeamPage initialMembers={members} lang="fr" />;
};

export default TeamRoute;
