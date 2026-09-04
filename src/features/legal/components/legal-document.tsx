"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { LegalControls } from "./legal-controls";

import type { ReactNode } from "react";

export type LegalTable = { headers: string[]; rows: string[][] };
export type LegalSection = {
  body: string;
  id?: string;
  items?: string[];
  table?: LegalTable;
  title: string;
};

/** Marqueur des informations que Prosperify doit renseigner avant publication. */
const PLACEHOLDER = "[À COMPLÉTER]";

/**
 * Surligne les `[À COMPLÉTER]` pour qu'ils ne partent jamais en production par
 * inadvertance : dans un document juridique, un trou doit se voir.
 */
function withPlaceholders(text: string): ReactNode {
  if (!text.includes(PLACEHOLDER)) {
    return text;
  }

  return text.split(PLACEHOLDER).flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <mark
            key={`ph-${i}`}
            className="rounded-sm bg-amber-100 px-1 font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
          >
            {PLACEHOLDER}
          </mark>,
          part,
        ],
  );
}

function slugify(section: LegalSection, index: number) {
  return section.id ?? `section-${index + 1}`;
}

function SectionTable({ table }: { table: LegalTable }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th
                key={header}
                className="border border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, i) => (
                <td
                  key={`${row[0]}-${i}`}
                  className="border border-neutral-200 px-3 py-2 align-top leading-6 text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
                >
                  {withPlaceholders(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Rendu commun aux trois documents légaux (confidentialité, conditions, RGPD) :
 * sommaire ancré, sections numérotées, listes et tableaux.
 */
export function LegalDocument({ namespace }: { namespace: "gdpr" | "privacy" | "terms" }) {
  const { t } = useTranslation();
  const sections = t(`legal.${namespace}.sections`, {
    returnObjects: true,
  }) as LegalSection[];
  const summaryLabel = t(`legal.${namespace}.summaryLabel`, { defaultValue: "Sommaire" });

  return (
    <main className="min-h-screen bg-white pt-24 pb-32 dark:bg-neutral-950">
      <div className="fixed top-4 right-6 z-50 sm:top-5 sm:right-8">
        <LegalControls />
      </div>
      <div className="mx-auto max-w-3xl px-6 sm:px-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          &larr; {t(`legal.${namespace}.back`)}
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl dark:text-neutral-50">
          {t(`legal.${namespace}.title`)}
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {t(`legal.${namespace}.updated`)}
        </p>

        {sections.length > 1 ? (
          <nav
            aria-label={summaryLabel}
            className="mt-10 border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <h2 className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400">
              {summaryLabel}
            </h2>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((section, i) => (
                <li key={section.title}>
                  <a
                    className="text-neutral-600 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
                    href={`#${slugify(section, i)}`}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-12 space-y-10">
          {sections.map((section, i) => (
            <section key={section.title} id={slugify(section, i)} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">
                {withPlaceholders(section.body)}
              </p>
              {section.items?.length ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-7 text-neutral-600 dark:text-neutral-400">
                  {section.items.map((item) => (
                    <li key={item}>{withPlaceholders(item)}</li>
                  ))}
                </ul>
              ) : null}
              {section.table ? <SectionTable table={section.table} /> : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
