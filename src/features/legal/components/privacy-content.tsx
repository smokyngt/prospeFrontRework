"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { LegalControls } from "./legal-controls";

type LegalSection = { body: string; items?: string[]; title: string };

export default function PrivacyContent() {
  const { t } = useTranslation();
  const sections = t("legal.privacy.sections", {
    returnObjects: true,
  }) as LegalSection[];

  return (
    <main className="min-h-screen bg-white pt-24 pb-32 dark:bg-neutral-950">
      <div className="fixed right-6 top-4 z-50 sm:right-8 sm:top-5">
        <LegalControls />
      </div>
      <div className="mx-auto max-w-3xl px-6 sm:px-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          &larr; {t("legal.privacy.back")}
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
          {t("legal.privacy.title")}
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {t("legal.privacy.updated")}
        </p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
