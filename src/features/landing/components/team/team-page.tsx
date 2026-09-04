'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { LandingFooter } from '@/features/landing/components/footer';
import { LandingNavbar } from '@/features/landing/components/navigation';
import { TeamSection } from '@/features/landing/components/team/team-section';
import { useLandingLanguageSync } from '@/hooks/use-landing-language';

import type { WorkspaceTeamMember } from '@/features/landing/data/workspace-api';

type TeamPageProps = {
  initialMembers?: WorkspaceTeamMember[];
  lang?: string;
};

export function TeamPage({ initialMembers, lang }: TeamPageProps) {
  useLandingLanguageSync(lang);

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <LandingNavbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-orange-600"
          href="/"
          title={lang === 'en' ? 'Back to landing' : "Retour à l'accueil"}
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === 'en' ? 'Back to landing' : "Retour à l'accueil"}
        </Link>
        <TeamSection initialMembers={initialMembers} />
      </section>
      <LandingFooter />
    </main>
  );
}
