'use client';

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  Cpu,
  GraduationCap,
  LineChart,
  type LucideIcon,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { workspace } from '@/features/landing/data/workspace-api';
import { uiLanguage } from '@/features/landing/lib/theme';

import type { JobOpening } from '@/features/landing/data/jobs';

const CONTACT_EMAIL = 'hello@prosperify.app';

const copy = {
  en: {
    allStatuses: 'All statuses',
    allTeams: 'All teams',
    clear: 'Clear',
    closed: 'Filled',
    filledBy: 'Filled by',
    filters: 'Filters',
    open: 'Open',
    search: 'Search roles',
    showing: 'Showing',
    status: 'Status',
  },
  fr: {
    allStatuses: 'Tous les statuts',
    allTeams: 'Toutes les équipes',
    clear: 'Effacer',
    closed: 'Pourvu',
    filledBy: 'Pourvu par',
    filters: 'Filtres',
    open: 'Ouvert',
    search: 'Rechercher un poste',
    showing: 'Affichage',
    status: 'Statut',
  },
};

type JobsSectionProps = {
  compact?: boolean;
  initialOpenings?: JobOpening[];
};

const EMPTY_OPENINGS: JobOpening[] = [];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getJobCategoryIcon(category?: string): LucideIcon {
  const normalized = category?.trim().toLowerCase() ?? '';

  if (/(engineer|engineering|tech|software|product)/.test(normalized)) {
    return Code2;
  }

  if (/(ai|data|ml|research|science)/.test(normalized)) {
    return Cpu;
  }

  if (/(sales|growth|business|revenue|go.?to.?market)/.test(normalized)) {
    return LineChart;
  }

  if (/(marketing|content|brand|communication)/.test(normalized)) {
    return Megaphone;
  }

  if (/(design|creative|ux|ui)/.test(normalized)) {
    return Palette;
  }

  if (/(security|legal|compliance|trust)/.test(normalized)) {
    return ShieldCheck;
  }

  if (/(intern|student|apprentice|stage)/.test(normalized)) {
    return GraduationCap;
  }

  if (/(people|hr|talent|operations|ops)/.test(normalized)) {
    return Users;
  }

  return Building2;
}

export function JobsSection({
  compact = false,
  initialOpenings = EMPTY_OPENINGS,
}: JobsSectionProps) {
  const { i18n, t } = useTranslation();
  const language = uiLanguage(i18n.language);
  const labels = copy[language];
  const [workspaceOpenings, setWorkspaceOpenings] = useState<JobOpening[]>(initialOpenings);
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const page = await workspace.resource.load<Parameters<typeof workspace.job.toOpening>[0]>(
        'jobs',
        { limit: 100 },
      );
      if (!cancelled) {
        const jobs = page.items.map(workspace.job.toOpening);
        setWorkspaceOpenings(jobs.length ? jobs : initialOpenings);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [initialOpenings]);

  const teams = useMemo(() => {
    return Array.from(new Set(workspaceOpenings.map((job) => job.team).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [workspaceOpenings]);

  const filteredOpenings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return workspaceOpenings.filter((job) => {
      const content = job[language];
      const matchesTeam = team === 'all' || slugify(job.team) === team;
      const matchesStatus = job.status === 'open';
      const matchesQuery =
        !normalizedQuery ||
        `${content.title} ${content.description} ${job.team} ${job.location} ${job.type} ${job.workMode}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesTeam && matchesQuery;
    });
  }, [language, query, team, workspaceOpenings]);

  const openings = compact
    ? workspaceOpenings.filter((job) => job.status === 'open').slice(0, 2)
    : filteredOpenings;
  const hasFilters = Boolean(query.trim()) || team !== 'all';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 border-b border-neutral-200 pb-8 dark:border-neutral-800 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.08] text-neutral-950 dark:text-neutral-50 sm:text-6xl">
            {t('jobs.title_prefix')}{' '}
            <span className="text-orange-600">{t('jobs.title_highlight')}</span>
          </h1>
        </div>
        <p className="max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300 sm:text-xl">
          {t('jobs.subtitle')}
        </p>
      </div>

      {!compact && workspaceOpenings.length ? (
        <div className="mt-8 border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="h-10 bg-white pl-9 dark:bg-neutral-950"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.search}
                value={query}
              />
            </div>

            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {labels.open}
            </p>
          </div>

          {teams.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                {labels.filters}
              </span>
              <button
                className={`inline-flex h-9 items-center gap-1.5 border px-3 text-sm font-semibold transition-colors ${
                  team === 'all'
                    ? 'border-orange-200 bg-white text-orange-700 shadow-sm dark:bg-neutral-950 dark:text-orange-400'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
                }`}
                onClick={() => setTeam('all')}
                type="button"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                {labels.allTeams}
              </button>
              {teams.map((item) => {
                const Icon = getJobCategoryIcon(item);
                const value = slugify(item);

                return (
                  <button
                    key={item}
                    className={`inline-flex h-9 items-center gap-1.5 border px-3 text-sm font-semibold transition-colors ${
                      team === value
                        ? 'border-orange-200 bg-white text-orange-700 shadow-sm dark:bg-neutral-950 dark:text-orange-400'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
                    }`}
                    onClick={() => setTeam(value)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {item}
                  </button>
                );
              })}
              {hasFilters ? (
                <button
                  className="inline-flex h-9 items-center gap-1.5 border border-transparent px-3 text-sm font-semibold text-neutral-500 transition-colors hover:text-orange-600 dark:text-neutral-400"
                  onClick={() => {
                    setQuery('');
                    setTeam('all');
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  {labels.clear}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {openings.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {openings.map((job) => {
            const content = job[language];
            const CategoryIcon = getJobCategoryIcon(job.team);
            const isTaken = job.status === 'taken';
            const showWorkMode =
              job.workMode.trim().toLowerCase() !== job.location.trim().toLowerCase();

            return (
              <article
                key={job.id}
                className="border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
                  <span className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {job.team}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                    {job.type}
                  </span>
                  {showWorkMode ? (
                    <span className="bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                      {job.workMode}
                    </span>
                  ) : null}
                  {isTaken ? (
                    <span className="bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {labels.closed}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
                  {content.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-neutral-600 dark:text-neutral-300">
                  {content.description}
                </p>
                {isTaken && job.occupantName ? (
                  <p className="mt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {labels.filledBy} {job.occupantName}
                  </p>
                ) : (
                  <a
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 hover:text-orange-600 dark:text-neutral-50"
                    href={`mailto:${CONTACT_EMAIL}?subject=Prosperify%20job%20application`}
                  >
                    {t('jobs.apply')}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-orange-600 shadow-sm dark:bg-neutral-950">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                {t('jobs.empty_title')}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {t('jobs.empty_description')}
              </p>
            </div>
          </div>
        </div>
      )}

      {compact ? (
        <div className="mt-6 text-center">
          <Link
            className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm hover:border-orange-200 hover:text-orange-600"
            href="/jobs"
            title={t('jobs.view_all')}
          >
            {t('jobs.view_all')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
