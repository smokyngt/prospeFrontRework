'use client';

import { Cloud, EyeOff, Server } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { uiLanguage } from '@/features/landing/lib/theme';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

function Mark({ children }: { children: ReactNode }) {
  return (
    <mark className="border border-orange-500/80 bg-orange-500/25 px-0.5 font-semibold text-neutral-900 dark:text-neutral-50">
      {children}
    </mark>
  );
}

function Fact({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-orange-200 bg-orange-50 text-orange-500 dark:border-orange-500/25 dark:bg-orange-500/10">
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
      <span className="text-sm leading-5 text-neutral-700 dark:text-neutral-300">{label}</span>
    </div>
  );
}

export default function SovereigntySection() {
  const { i18n, t } = useTranslation();
  const language = uiLanguage(i18n.language);

  const clauseRef =
    language === 'fr' ? 'Politique de sécurité, prosperify.pdf' : 'Security policy, prosperify.pdf';

  const facts =
    language === 'fr'
      ? [
          { icon: Cloud, label: 'Huit fournisseurs cloud européens (Hetzner, Scaleway, OVH)' },
          {
            icon: EyeOff,
            label: 'Recherche sur vecteurs chiffrés (DCPE) : jamais de contenu en clair',
          },
          { icon: Server, label: 'Cluster dédié possible (BYOC)' },
        ]
      : [
          { icon: Cloud, label: 'Eight European cloud providers (Hetzner, Scaleway, OVH)' },
          {
            icon: EyeOff,
            label: 'Encrypted vector search (DCPE): content never queried in plaintext',
          },
          { icon: Server, label: 'Dedicated cluster available (BYOC)' },
        ];

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="text-center mb-6 scroll-mt-8 sm:mb-8">
        <h2 className="mb-3 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 sm:mb-4 sm:text-4xl lg:text-5xl">
          {t('sovereignty.title_prefix')}{' '}
          <span className="text-orange-500">{t('sovereignty.title_highlight')}</span> <br />
          {t('sovereignty.title_suffix')}
        </h2>
      </div>

      <motion.div
        className="border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:p-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <blockquote className="border-l-4 border-orange-500 pl-5">
          {language === 'fr' ? (
            <p className="text-lg leading-9 text-neutral-800 dark:text-neutral-200 sm:text-xl">
              « Les documents sont hébergés <Mark>en Europe</Mark>, dans un environnement{' '}
              <Mark>jamais partagé</Mark> entre organisations. Les accès sont{' '}
              <Mark>restreints par rôle</Mark> et chaque consultation reste{' '}
              <Mark>journalisée et traçable</Mark>. »
            </p>
          ) : (
            <p className="text-lg leading-9 text-neutral-800 dark:text-neutral-200 sm:text-xl">
              &quot;Documents are hosted <Mark>in Europe</Mark>, in an environment{' '}
              <Mark>never shared</Mark> between organizations. Access is{' '}
              <Mark>restricted by role</Mark> and every consultation remains{' '}
              <Mark>logged and traceable</Mark>.&quot;
            </p>
          )}
        </blockquote>

        <p className="mt-5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
          · {clauseRef}
        </p>

        <div className="mt-6 grid grid-cols-1 divide-y divide-neutral-100 border-t border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {facts.map((fact) => (
            <Fact key={fact.label} icon={fact.icon} label={fact.label} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
