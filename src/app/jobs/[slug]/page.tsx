import { JobDetailPage } from "@/features/landing/components/jobs";
import {
  getAllJobSlugs,
  getJobLanguage,
  getJobOpening,
} from "@/features/landing/data/jobs";
import { getServerTranslation } from "@/lib/translations";

type JobDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function JobDetailRoute({ params }: JobDetailRouteProps) {
  const { slug } = await params;

  return <JobDetailPage lang="fr" slug={slug} />;
}

export async function generateMetadata({ params }: JobDetailRouteProps) {
  const { slug } = await params;
  const language = getJobLanguage("fr");
  const tr = getServerTranslation(language);
  const job = await getJobOpening(slug).catch(() => null);

  if (!job) {
    return {
      title: tr.meta.pages.jobs.title,
      description: tr.meta.pages.jobs.description,
    };
  }

  const content = job[language];

  return {
    title: tr.meta.pages.jobDetail.title.replace("{{title}}", content.title),
    description: content.description.slice(0, 160),
  };
}

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs().catch(() => []);

  return slugs.map((slug) => ({ slug }));
}
