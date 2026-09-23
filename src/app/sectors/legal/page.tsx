import { SectorTemplatePage } from "@/features/landing/components/sectors";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.sectorLegal.title,
  description: tr.meta.pages.sectorLegal.description,
  alternates: { canonical: "https://prosperify.app/sectors/legal" },
};

export default function LegalSectorRoute() {
  return <SectorTemplatePage sector="legal" lang="fr" />;
}
