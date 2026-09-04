import { workspace } from "./workspace-api";

export type JobOpening = {
  en: {
    description: string;
    impact?: string;
    requirements: string[];
    responsibilities: string[];
    title: string;
  };
  fr: {
    description: string;
    impact?: string;
    requirements: string[];
    responsibilities: string[];
    title: string;
  };
  id: string;
  location: string;
  occupantName?: string;
  postedAt?: string;
  seniority?: string;
  status: "open" | "taken";
  team: string;
  type: string;
  workMode: string;
};

export type JobLanguage = "en" | "fr";

export async function getJobOpening(id: string): Promise<JobOpening | null> {
  const openings = await workspace.job.openings();

  return openings.find((job) => job.id === id) ?? null;
}

export async function getAllJobSlugs(): Promise<string[]> {
  const openings = await workspace.job.openings();

  return openings.map((job) => job.id);
}

/** Le site est francophone par défaut : tout ce qui n'est pas `en` reste `fr`. */
export function getJobLanguage(value?: string): JobLanguage {
  return value === "en" ? "en" : "fr";
}
