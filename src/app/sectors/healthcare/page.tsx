import { SectorTemplatePage } from "@/features/landing/components/sectors";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.sectorHealthcare.title,
  description: tr.meta.pages.sectorHealthcare.description,
  alternates: { canonical: "https://prosperify.app/sectors/healthcare" },
};

export default function HealthcareSectorRoute() {
  return <SectorTemplatePage sector="healthcare" lang="fr" />;
}
