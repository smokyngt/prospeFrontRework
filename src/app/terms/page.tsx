import { headers } from "next/headers";

import TermsContent from "@/features/legal/components/terms-content";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

async function getLang(): Promise<"en" | "fr"> {
  try {
    const accept = (await headers()).get("Accept-Language") ?? "";
    return accept.startsWith("fr") ? "fr" : "en";
  } catch {
    return "en";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const tr = getServerTranslation(await getLang());

  return {
    title: tr.meta.pages.terms.title,
    description: tr.meta.pages.terms.description,
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
