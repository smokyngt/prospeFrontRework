import { SectorPage } from "@/features/landing/components/sectors";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.sectorFinance.title,
  description: tr.meta.pages.sectorFinance.description,
  alternates: { canonical: "https://prosperify.app/sectors/finance" },
};

export default function FinanceSectorRoute() {
  return <SectorPage sector="finance" lang="fr" />;
}
