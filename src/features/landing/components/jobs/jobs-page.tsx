"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LandingFooter } from "@/features/landing/components/footer";
import { JobsSection } from "@/features/landing/components/jobs/jobs-section";
import { LandingNavbar } from "@/features/landing/components/navigation";
import i18n from "@/lib/i18n";

import type { JobOpening } from "@/features/landing/data/jobs";

type JobsPageProps = {
  initialOpenings?: JobOpening[];
  lang?: string;
};

export function JobsPage({ initialOpenings, lang }: JobsPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (lang === "fr" || lang === "en") {
      i18n.changeLanguage(lang).catch(() => undefined);
    }
  }, [lang]);

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <LandingNavbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-orange-600"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToLanding")}
        </Link>
        <JobsSection initialOpenings={initialOpenings} />
      </section>
      <LandingFooter />
    </main>
  );
}
