'use client';
/* eslint-disable @next/next/no-img-element */

import { Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  workspace,
  type WorkspaceTeamApiMember,
  type WorkspaceTeamMember,
} from '@/features/landing/data/workspace-api';
import { uiLanguage } from '@/features/landing/lib/theme';

type TeamSectionProps = {
  hideHeading?: boolean;
  initialMembers?: WorkspaceTeamMember[];
};

const EMPTY_MEMBERS: WorkspaceTeamMember[] = [];

function MemberAvatar({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!avatarUrl || failed) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
        {initials}
      </div>
    );
  }

  return (
    <img
      alt={`${name} avatar`}
      className="h-12 w-12 rounded-full border border-neutral-200 object-cover dark:border-neutral-700"
      src={avatarUrl}
      onError={() => setFailed(true)}
    />
  );
}

function extractVanity(url: string): string {
  try {
    const u = new URL(url);
    const match = /^\/in\/(.+?)\/?$/.exec(u.pathname);
    return match ? decodeURIComponent(match[1]) : '';
  } catch {
    return '';
  }
}

export function TeamSection({
  hideHeading = false,
  initialMembers = EMPTY_MEMBERS,
}: TeamSectionProps) {
  const { i18n, t } = useTranslation();
  const language = uiLanguage(i18n.language);
  const [members, setMembers] = useState<WorkspaceTeamMember[]>(initialMembers);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const page = await workspace.resource.load<WorkspaceTeamApiMember>('team', { limit: 50 });
      if (!cancelled) {
        const workspaceMembers = page.items.map(workspace.team.toMember);
        setMembers(workspaceMembers.length ? workspaceMembers : initialMembers);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [initialMembers]);

  return (
    <div className="mx-auto max-w-7xl">
      {hideHeading ? null : (
        <div className="mb-10 grid gap-6 border-b border-neutral-200 pb-8 dark:border-neutral-800 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
              {t('team.title_prefix')}{' '}
              <span className="text-orange-500">{t('team.title_highlight')}</span>
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
            {t('team.subtitle')}
          </p>
        </div>
      )}

      {members.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-orange-500 dark:text-orange-400">
                  {member.role}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {member[language].bio}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <MemberAvatar avatarUrl={member.avatarUrl} name={member.name} />
                {member.linkedinUrl || member.linkedinVanity ? (
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:text-orange-600 hover:underline dark:text-neutral-100 dark:hover:text-orange-400"
                    href={
                      member.linkedinUrl ||
                      `https://www.linkedin.com/in/${
                        member.linkedinVanity || extractVanity(member.linkedinUrl || '')
                      }/`
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`LinkedIn - ${member.name}`}
                    aria-label={`LinkedIn - ${member.name}`}
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    <span>LinkedIn</span>
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-neutral-200 bg-neutral-50 p-6 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          {language === 'fr'
            ? "Les profils publics de l'équipe apparaîtront ici dès qu'ils seront activés dans l'espace de travail."
            : 'Public team profiles will appear here once they are enabled in the workspace.'}
        </div>
      )}
    </div>
  );
}
