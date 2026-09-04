import { headers } from "next/headers";

import PrivacyContent from "@/features/legal/components/privacy-content";
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
    title: tr.meta.pages.privacy.title,
    description: tr.meta.pages.privacy.description,
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
