import { ArrowLeft, CalendarDays, Mail, MapPin, Signal } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LandingFooter } from "@/features/landing/components/footer";
import {
  getJobCategoryIcon,
  JOBS_CONTACT_EMAIL,
} from "@/features/landing/components/jobs/job-meta";
import { LandingNavbar } from "@/features/landing/components/navigation";
import { getJobLanguage, getJobOpening } from "@/features/landing/data/jobs";
import { getServerTranslation } from "@/lib/translations";

import type { ReactNode } from "react";

type JobDetailPageProps = {
  lang?: string;
  slug: string;
};

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      {children}
    </span>
  );
}

function DetailList({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h2>
      <ul className="mt-4 space-y-3 border-l-2 border-orange-200 pl-5 dark:border-orange-500/40">
        {items.map((item) => (
          <li
            key={item}
            className="leading-8 text-neutral-600 dark:text-neutral-400"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function JobDetailPage({ lang, slug }: JobDetailPageProps) {
  const job = await getJobOpening(slug).catch(() => null);

  if (!job) {
    notFound();
  }

  const language = getJobLanguage(lang);
  const tr = getServerTranslation(language);
  const content = job[language];
  const CategoryIcon = getJobCategoryIcon(job.team);
  const isTaken = job.status === "taken";
  const showWorkMode =
    job.workMode.trim().toLowerCase() !== job.location.trim().toLowerCase();
  const applySubject = tr.jobs.applySubject.replace("{{title}}", content.title);
  const postedAtLabel = job.postedAt
    ? tr.jobs.detail.postedAt.replace(
        "{{date}}",
        new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(job.postedAt)),
      )
    : null;
  const applyHref = `mailto:${JOBS_CONTACT_EMAIL}?subject=${encodeURIComponent(applySubject)}`;

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <LandingNavbar />
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400"
          href="/jobs"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr.jobs.backToJobs}
        </Link>

        <header className="mt-12 border-b border-neutral-200 pb-12 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              <CategoryIcon className="h-3.5 w-3.5" />
              {job.team}
            </span>
            <MetaChip>
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </MetaChip>
            <MetaChip>{job.type}</MetaChip>
            {showWorkMode ? <MetaChip>{job.workMode}</MetaChip> : null}
            {job.seniority ? (
              <MetaChip>
                <Signal className="h-3.5 w-3.5" />
                {tr.jobs.detail.seniority.replace("{{value}}", job.seniority)}
              </MetaChip>
            ) : null}
            {isTaken ? (
              <span className="bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {tr.jobs.filters.closed}
              </span>
            ) : null}
            {postedAtLabel ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {postedAtLabel}
              </span>
            ) : null}
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {content.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            {content.description}
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {content.impact ? (
            <section>
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">
                {tr.jobs.detail.impact}
              </h2>
              <div className="mt-4 border-l-2 border-orange-200 pl-5 dark:border-orange-500/40">
                <p className="whitespace-pre-line leading-8 text-neutral-600 dark:text-neutral-400">
                  {content.impact}
                </p>
              </div>
            </section>
          ) : null}

          <DetailList
            items={content.responsibilities}
            title={tr.jobs.detail.responsibilities}
          />

          <DetailList
            items={content.requirements}
            title={tr.jobs.detail.requirements}
          />
        </div>

        <div className="mt-16 border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-orange-600 shadow-sm dark:bg-neutral-950">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                {isTaken ? tr.jobs.detail.takenTitle : tr.jobs.detail.applyTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {isTaken ? tr.jobs.detail.takenLead : tr.jobs.detail.applyLead}
              </p>
              {isTaken && job.occupantName ? (
                <p className="mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {tr.jobs.filters.filledBy} {job.occupantName}
                </p>
              ) : (
                <a
                  className="mt-4 inline-flex items-center gap-2 bg-orange-600 px-4 py-2 text-sm font-semibold text-[var(--pf-on-accent)] transition-colors hover:bg-orange-500"
                  href={applyHref}
                >
                  {tr.jobs.apply}
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400"
            href="/jobs"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr.jobs.backToJobs}
          </Link>
        </div>
      </article>
      <LandingFooter />
    </main>
  );
}
