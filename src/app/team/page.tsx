import { TeamPage } from "@/features/landing/components/team";
import { workspace } from "@/features/landing/data/workspace-api";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.team.title,
  description: tr.meta.pages.team.description,
};

export default async function TeamRoute() {
  const members = await workspace.team.members();

  return <TeamPage initialMembers={members} lang="fr" />;
}
