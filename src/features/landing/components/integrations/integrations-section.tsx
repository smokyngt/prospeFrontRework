'use client';

import { Cloud, KeyRound, Plus, Puzzle } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { stringListAt } from '@/features/landing/lib/i18n';

import type { LucideIcon } from 'lucide-react';

const DOCS_URL = 'https://docs.prosperify.app/integrations';

const GROUPS: { icon: LucideIcon; key: 'sources' | 'platforms' | 'identity' }[] = [
  { icon: Cloud, key: 'sources' },
  { icon: Puzzle, key: 'platforms' },
  { icon: KeyRound, key: 'identity' },
];

const VISIBLE_COUNT = 3;
const CODE_LOGOS = ['SharePoint', 'Slack', 'Google Drive', 'Entra ID', 'Notion'];

const CODE_SNIPPETS = {
  typescript: `import { ProsperifyClient } from "@prosperify/sdk";

const client = new ProsperifyClient({
  baseUrl: env.PROSPERIFY_API_URL,
  clientId: process.env.PROSPERIFY_CLIENT_ID!,
  clientSecret: process.env.PROSPERIFY_CLIENT_SECRET!,
});

// Interroge avec réponses sourcées
const { thread } = await client.threads.create({ storeIds: [storeId] });
const answer = await client.chat.send({
  thread: thread.id,
  text: question,
  effort: 15,
});
// answer.response + answer.citations`,
  python: `from prosperify import ProsperifyClient

client = ProsperifyClient(
    base_url=os.environ["PROSPERIFY_API_URL"],
    client_id=os.environ["PROSPERIFY_CLIENT_ID"],
    client_secret=os.environ["PROSPERIFY_CLIENT_SECRET"],
)

# Interroge avec réponses sourcées
thread = await client.threads.create(store_ids=[store_id])
answer = await client.chat.send(
    thread=thread.id, text=question, effort=15
)
# answer.response + answer.citations`,
} as const;

const INTEGRATION_LOGOS: Record<string, string> = {
  SharePoint: '/assets/integrations/sharepoint.svg',
  OneDrive: '/assets/integrations/onedrive.svg',
  'Google Drive': '/assets/integrations/google-drive.svg',
  'Amazon S3': '/assets/integrations/amazon-s3.svg',
  MinIO: '/assets/integrations/minio.svg',
  'File servers': '/assets/integrations/file-servers.svg',
  'Serveurs de fichiers': '/assets/integrations/file-servers.svg',
  Slack: '/assets/integrations/slack.svg',
  Confluence: '/assets/integrations/confluence.svg',
  Notion: '/assets/integrations/notion.svg',
  Zendesk: '/assets/integrations/zendesk.svg',
  Dropbox: '/assets/integrations/dropbox.svg',
  GitHub: '/assets/integrations/github.svg',
  Jira: '/assets/integrations/jira.svg',
  'Entra ID': '/assets/integrations/entra-id.svg',
  'Google Workspace': '/assets/integrations/google-workspace.svg',
  Okta: '/assets/integrations/okta.svg',
  Keycloak: '/assets/integrations/keycloak.svg',
};

function integrationDocsUrl(name: string): string {
  const src = INTEGRATION_LOGOS[name];
  const slug = src
    ? (src.split('/').pop() ?? '').replace(/\.svg$/, '')
    : name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

  return `${DOCS_URL}/${slug}`;
}

function IntegrationLogo({ name }: { name: string }) {
  const src = INTEGRATION_LOGOS[name];

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 bg-white p-1.5 dark:border-neutral-700 dark:bg-neutral-800/60">
      {src ? (
        <Image
          src={src}
          alt={`${name} logo`}
          width={20}
          height={20}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-500">
          <span className="font-mono text-[9px] font-bold">{name.slice(0, 2).toUpperCase()}</span>
        </span>
      )}
    </span>
  );
}

export default function IntegrationsSection() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<keyof typeof CODE_SNIPPETS>('typescript');

  return (
    <div className="max-w-5xl mx-auto 2xl:max-w-[1300px]">
      <div className="scroll-mt-8 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
          {t('integrations.title_prefix')}{' '}
          <span className="text-orange-500">{t('integrations.title_highlight')}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base">
          {t('integrations.intro')}
        </p>
      </div>

      <div className="mt-4 border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex h-7 items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
            <span className="flex-1 border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              🔒 docs.prosperify.app
            </span>
            <div className="ml-3 flex shrink-0 border border-neutral-200 p-0.5 dark:border-neutral-700">
              {(Object.keys(CODE_SNIPPETS) as Array<keyof typeof CODE_SNIPPETS>).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                    language === item
                      ? 'bg-orange-500 text-white'
                      : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50'
                  }`}
                >
                  {item === 'typescript' ? 'TypeScript' : 'Python'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-12 items-center justify-center gap-3 border-b border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
            {CODE_LOGOS.map((name) => (
              <IntegrationLogo key={name} name={name} />
            ))}
          </div>
          <pre className="max-h-[360px] overflow-auto bg-neutral-50 px-4 py-5 text-[11px] leading-5 text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 sm:px-6 sm:text-xs">
            <code>{CODE_SNIPPETS[language]}</code>
          </pre>
        </div>

        <div className="grid md:grid-cols-3">
          {GROUPS.map(({ icon: Icon, key }, index) => {
            const items = stringListAt(t, `integrations.groups.${key}.items`);
            const visible = items.slice(0, VISIBLE_COUNT);
            const hidden = items.length - visible.length;

            return (
              <motion.div
                key={key}
                className={`group flex flex-col p-4 sm:p-5 ${
                  index > 0
                    ? 'border-t border-neutral-100 dark:border-neutral-800 md:border-t-0 md:border-l'
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-orange-200 bg-orange-50 text-orange-500 dark:border-orange-500/25 dark:bg-orange-500/10">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                    {t(`integrations.groups.${key}.label`)}
                  </span>
                </div>

                <ul className="mt-3 grid flex-1 content-start gap-2">
                  {visible.map((item) => (
                    <li key={item}>
                      <a
                        href={integrationDocsUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item}
                        className="flex min-h-10 items-center gap-3 border border-neutral-200 px-3 py-2 transition-colors hover:border-orange-300 dark:border-neutral-800 dark:hover:border-orange-500/50"
                      >
                        <IntegrationLogo name={item} />
                        <span className="text-sm font-medium leading-5 text-neutral-700 dark:text-neutral-300">
                          {item}
                        </span>
                      </a>
                    </li>
                  ))}

                  {hidden > 0 ? (
                    <li className="flex min-h-10 items-center gap-3 border border-dashed border-neutral-200 px-3 py-2 dark:border-neutral-700">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <a
                        href={DOCS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-neutral-500 transition-colors hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
                      >
                        {t('integrations.more', { count: hidden })}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-100 px-4 py-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            <span className="font-semibold text-neutral-950 dark:text-neutral-50">
              {t('integrations.auth_note_label')}
            </span>{' '}
            {t('integrations.auth_note')}
          </p>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600"
          >
            {t('integrations.cta')}
          </a>
        </div>
      </div>
    </div>
  );
}
