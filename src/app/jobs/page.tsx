import { JobsPage } from "@/features/landing/components/jobs";
import { workspace } from "@/features/landing/data/workspace-api";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.jobs.title,
  description: tr.meta.pages.jobs.description,
};

export default async function JobsRoute() {
  const openings = await workspace.job.openings();

  return <JobsPage initialOpenings={openings} lang="fr" />;
}
