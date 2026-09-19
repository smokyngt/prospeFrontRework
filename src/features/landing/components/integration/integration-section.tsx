"use client";

import {
  ArrowUpRight,
  BookOpen,
  Check,
  Cloud,
  Copy,
  FileText,
  Folder,
  HardDrive,
  KeyRound,
  Lock,
  type LucideIcon,
  MessageSquare,
  Plus,
  Puzzle,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Safari } from "@/components/shared";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────── */
/*  Code sample — tokenised lines, no external highlighter    */
/* ──────────────────────────────────────────────────────── */

/** `key` : commentaire de snippet traduit à l'affichage (clé integration.snippets.*). */
type Seg = { k?: "cm" | "kw" | "str" | "type"; key?: string; t: string };
type CodeLine = Seg[];

const CODE_TS: CodeLine[] = [
  [
    { k: "kw", t: "import " },
    { t: "{ ProsperifyClient } " },
    { k: "kw", t: "from " },
    { k: "str", t: '"@prosperify/sdk"' },
    { t: ";" },
  ],
  [],
  [
    { k: "kw", t: "const " },
    { t: "client = " },
    { k: "kw", t: "new " },
    { k: "type", t: "ProsperifyClient" },
    { t: "({" },
  ],
  [{ t: "  baseUrl: env.PROSPERIFY_API_URL," }],
  [{ t: "  clientId: env.PROSPERIFY_CLIENT_ID," }],
  [{ t: "  clientSecret: env.CLIENT_SECRET," }],
  [{ t: "});" }],
  [],
  [{ k: "cm", t: "// OAuth 2.0 client-credentials" }],
  [{ k: "kw", t: "await " }, { t: "client.authenticate();" }],
  [],
  [{ k: "cm", key: "createStore", t: "// " }],
  [
    { k: "kw", t: "const " },
    { t: "{ store } = " },
    { k: "kw", t: "await " },
    { t: "client.stores.create({" },
  ],
  [{ t: "  name: " }, { k: "str", t: '"knowledge-base"' }, { t: "," }],
  [{ t: "});" }],
  [
    { k: "kw", t: "await " },
    { t: "client.uploads.documents(store.id, files);" },
  ],
  [],
  [{ k: "cm", key: "query", t: "// " }],
  [
    { k: "kw", t: "const " },
    { t: "thread = " },
    { k: "kw", t: "await " },
    { t: "client.threads.create({ storeIds: [store.id] });" },
  ],
];

const CODE_PY: CodeLine[] = [
  [
    { k: "kw", t: "from " },
    { t: "prosperify " },
    { k: "kw", t: "import " },
    { t: "ProsperifyClient" },
  ],
  [],
  [{ t: "client = " }, { k: "type", t: "ProsperifyClient" }, { t: "(" }],
  [
    { t: '    base_url=env["' },
    { k: "str", t: "PROSPERIFY_API_URL" },
    { t: '"],' },
  ],
  [
    { t: '    client_id=env["' },
    { k: "str", t: "PROSPERIFY_CLIENT_ID" },
    { t: '"],' },
  ],
  [
    { t: '    client_secret=env["' },
    { k: "str", t: "CLIENT_SECRET" },
    { t: '"],' },
  ],
  [{ t: ")" }],
  [],
  [{ k: "cm", t: "# OAuth 2.0 client-credentials" }],
  [{ t: "client.authenticate()" }],
  [],
  [{ k: "cm", key: "createStore", t: "# " }],
  [{ t: "store = client.stores.create(" }],
  [{ t: "    name=" }, { k: "str", t: '"knowledge-base"' }, { t: "," }],
  [{ t: ")" }],
  [{ t: "client.uploads.documents(store.id, files)" }],
  [],
  [{ k: "cm", key: "query", t: "# " }],
  [{ t: "thread = client.threads.create(store_ids=[store.id])" }],
];

function CodeToken({ seg }: { seg: Seg }) {
  const { t } = useTranslation();
  const text = seg.key ? seg.t + t(`integration.snippets.${seg.key}`) : seg.t;
  if (seg.k === "kw") {
    return <span className="text-[var(--pf-accent)]">{text}</span>;
  }
  if (seg.k === "str") {
    return <span className="text-[#16A34A] dark:text-[#4ADE80]">{text}</span>;
  }
  if (seg.k === "type") {
    return <span className="font-semibold text-[var(--pf-fg)]">{text}</span>;
  }
  if (seg.k === "cm") {
    return <span className="text-[var(--pf-fg-dim)]">{text}</span>;
  }
  return <span className="text-[var(--pf-fg-muted)]">{text}</span>;
}

function lineToText(line: CodeLine, translate: (key: string) => string) {
  return line
    .map((seg) => (seg.key ? seg.t + translate(`integration.snippets.${seg.key}`) : seg.t))
    .join("");
}

/**
 * Contenu de l'ecran uniquement : ni bordure ni ombre propres, le cadre
 * `Safari` qui l'enveloppe s'en charge.
 */
function CodePanel() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<"py" | "ts">("ts");
  const [copied, setCopied] = useState(false);
  const lines = lang === "ts" ? CODE_TS : CODE_PY;

  const handleCopy = async () => {
    const text = lines.map((line) => lineToText(line, t)).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable — ignore
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div style={{ background: "var(--pf-bg-card)" }}>
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: "1px solid var(--pf-border)",
          background: "var(--pf-bg-card-2)",
        }}
      >
        <div className="flex items-center gap-2">
          {(["ts", "py"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={lang === key}
              onClick={() => setLang(key)}
              className={cn(
                "px-4 py-2 font-mono text-[12.5px] font-bold tracking-[0.02em] transition-colors",
                lang !== key && "hover:border-[#FF6A13] hover:text-[var(--pf-fg)]",
              )}
              style={
                lang === key
                  ? {
                      background: "#FF6A13",
                      border: "1px solid #FF6A13",
                      color: "var(--pf-on-accent)",
                    }
                  : {
                      background: "var(--pf-bg)",
                      border: "1px solid var(--pf-border-2)",
                      color: "var(--pf-fg-muted)",
                    }
              }
            >
              {key === "ts" ? "TypeScript" : "Python"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t("integration.stack.copy")}
          className="flex items-center gap-1.5 px-2 py-1.5 font-mono text-[11px] text-[var(--pf-fg-dim)] transition-colors hover:text-[#FF6A13]"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="flex overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.85]">
        <div
          aria-hidden="true"
          className="mr-4 shrink-0 select-none text-right text-[var(--pf-fg-dim)] opacity-50"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div>
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line.length > 0
                ? line.map((seg, si) => <CodeToken key={si} seg={seg} />)
                : " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Connected systems — three columns                        */
/* ──────────────────────────────────────────────────────── */

type IntegrationItem = {
  icon: LucideIcon;
  /** Nom de marque : jamais traduit. */
  label: string;
  /** Nom de fichier dans `public/assets/integrations`, sans extension. */
  logo: string;
  /** Logo textuel : il porte deja le nom, on masque alors le libelle. */
  wordmark?: boolean;
};
/**
 * Service documente du meme groupe, non mis en avant. Ces entrees ne sont pas
 * rendues : elles alimentent le compteur « + N autres » de la colonne. Leur
 * `label` est donc de la documentation de code, pas du texte d'interface — il
 * n'a pas a passer par l'i18n.
 */
type RestItem = {
  label: string;
  logo: string;
};

type IntegrationGroup = {
  icon: LucideIcon;
  /** Les quatre mis en avant, avec leur logo. */
  items: IntegrationItem[];
  /**
   * Cle i18n affichee a la place de « + N autres » quand `rest` est vide : la
   * colonne est complete, la note dit ce qui la prolonge malgre tout.
   */
  noteKey?: string;
  /** Le reste documente du meme groupe : alimente « + N autres ». */
  rest: RestItem[];
};

/**
 * Chaque service pointe vers sa page de doc. Le nom de fichier du logo sert
 * aussi de slug (`amazon-s3` -> /integrations/amazon-s3) : les 19 pages de
 * `docs.prosperify.app/integrations` suivent cette convention. N'ajouter ici
 * qu'un service qui a sa page, sinon le lien casse.
 */
const DOCS_URL = "https://docs.prosperify.app/integrations";

function docsHref(logo: string): string {
  return `${DOCS_URL}/${logo}`;
}

// Marques officielles servies depuis `public/assets/integrations`. Les CDN
// externes (Simple Icons, favicons Google) sont bloques par la CSP du site, qui
// limite `img-src` a 'self' : ces logos ne s'affichaient jamais en production
// et retombaient systematiquement sur l'icone lucide de secours.
const GROUPS: IntegrationGroup[] = [
  {
    icon: Cloud,
    items: [
      { icon: Folder, label: "SharePoint", logo: "sharepoint" },
      { icon: Cloud, label: "OneDrive", logo: "onedrive" },
      { icon: HardDrive, label: "Google Drive", logo: "google-drive" },
      { icon: Cloud, label: "Dropbox", logo: "dropbox" },
    ],
    rest: [
      { label: "Amazon S3", logo: "amazon-s3" },
      { label: "MinIO", logo: "minio" },
      { label: "File servers", logo: "file-servers" },
      { label: "Network drive", logo: "network-drive" },
    ],
  },
  {
    icon: Puzzle,
    items: [
      { icon: MessageSquare, label: "Slack", logo: "slack" },
      { icon: FileText, label: "Confluence", logo: "confluence" },
      { icon: BookOpen, label: "Notion", logo: "notion" },
      { icon: FileText, label: "GitHub", logo: "github" },
    ],
    rest: [
      { label: "Jira", logo: "jira" },
      { label: "Zendesk", logo: "zendesk" },
    ],
  },
  {
    icon: KeyRound,
    items: [
      { icon: Shield, label: "Entra ID", logo: "entra-id" },
      {
        icon: Users,
        label: "Google Workspace",
        logo: "google-workspace",
        wordmark: true,
      },
      { icon: Lock, label: "Okta", logo: "okta", wordmark: true },
      { icon: Lock, label: "Keycloak", logo: "keycloak" },
    ],
    noteKey: "identityNote",
    rest: [],
  },
];

/**
 * Logo officiel sur pastille claire. La pastille n'est pas decorative :
 * plusieurs marques sont monochromes sombres (GitHub, Okta, MinIO, Zendesk) et
 * disparaitraient sur le fond du theme sombre. On ne recolore pas un logo
 * officiel, on lui donne donc un fond constant.
 */
function IntegrationLogo({
  fallback: Fallback,
  label,
  logo,
  wordmark = false,
}: {
  fallback?: LucideIcon;
  label: string;
  logo: string;
  wordmark?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center px-1.5",
        wordmark ? "w-auto" : "w-6",
      )}
      style={{ background: "#FFFFFF", border: "1px solid var(--pf-border)" }}
    >
      {failed && Fallback ? (
        <Fallback size={14} className="text-[var(--pf-fg-muted)]" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- SVG local statique, rien a optimiser
        <img
          alt={wordmark ? label : ""}
          className="h-3.5 w-auto max-w-[104px] object-contain"
          onError={() => setFailed(true)}
          src={`/assets/integrations/${logo}.svg`}
          title={wordmark ? label : undefined}
        />
      )}
    </span>
  );
}

function IntegrationItemRow({ item }: { item: IntegrationItem }) {
  return (
    <a
      className="group/row flex items-center gap-3 py-2.5 transition-colors"
      href={docsHref(item.logo)}
      rel="noopener noreferrer"
      target="_blank"
      style={{ borderBottom: "1px solid var(--pf-border)" }}
    >
      <IntegrationLogo
        fallback={item.icon}
        label={item.label}
        logo={item.logo}
        wordmark={item.wordmark}
      />
      {item.wordmark ? null : (
        <span className="text-[13.5px] font-medium text-[var(--pf-fg)] transition-colors group-hover/row:text-[#FF6A13]">
          {item.label}
        </span>
      )}
      <ArrowUpRight
        aria-hidden="true"
        className="ml-auto shrink-0 text-[var(--pf-fg-dim)] opacity-0 transition-opacity group-hover/row:opacity-100"
        size={14}
      />
    </a>
  );
}

/** Carte autoportante : un groupe de logos, chacun cliquable vers sa page de doc. */
function IntegrationGroupCard({
  group,
}: {
  group: IntegrationGroup & { moreLabel: string; title: string };
}) {
  const { t } = useTranslation();
  const GroupIcon = group.icon;

  return (
    <div
      className="px-5 py-5"
      style={{ border: "1px solid var(--pf-border)", background: "var(--pf-bg)" }}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center"
          style={{
            background: "var(--pf-accent-bg)",
            border: "1px solid var(--pf-accent-dim-border)",
            color: "var(--pf-accent)",
          }}
        >
          <GroupIcon size={16} />
        </span>
        <span className="text-[13.5px] font-bold text-[var(--pf-fg)]">
          {group.title}
        </span>
      </div>
      <div className="flex flex-col">
        {group.items.map((item) => (
          <IntegrationItemRow item={item} key={item.logo} />
        ))}
        {group.rest.length > 0 ? (
          <span className="flex items-center gap-3 pt-2.5">
            <Plus size={14} className="shrink-0 text-[var(--pf-fg-dim)]" />
            <span className="text-[13px] text-[var(--pf-fg-dim)]">
              {group.moreLabel}
            </span>
          </span>
        ) : group.noteKey ? (
          <span className="flex items-center gap-3 pt-2.5">
            <Shield size={14} className="shrink-0 text-[var(--pf-fg-dim)]" />
            <span className="text-[13px] text-[var(--pf-fg-dim)]">
              {t(`integration.stack.${group.noteKey}`)}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Stack mockup — l'interface de code au centre, les          */
/*  intégrations qu'elle relie affichées de part et d'autre,   */
/*  chaque logo cliquable renvoyant vers sa page de doc.        */
/* ──────────────────────────────────────────────────────── */

function StackMockup({
  copy,
  docsUrl,
}: {
  copy: IntegrationCopy;
  docsUrl: string;
}) {
  const namedGroups = GROUPS.map((group, i) => ({
    ...group,
    moreLabel: copy.moreLabel(group.rest.length),
    title: copy.groupTitles[i] ?? "",
  }));
  const [sources, platforms, identity] = namedGroups;

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_1fr_260px] lg:gap-6">
        {/* Colonne gauche : ce que l'agent lit */}
        <div className="flex flex-col gap-5 lg:order-1">
          {sources && <IntegrationGroupCard group={sources} />}
          {platforms && <IntegrationGroupCard group={platforms} />}
        </div>

        {/* Interface de code, au centre */}
        <div
          className="lg:order-2"
          style={{ boxShadow: "var(--pf-demo-shadow)" }}
        >
          <Safari className="shadow-none" opaque url="docs.prosperify.app">
            <CodePanel />
          </Safari>
        </div>

        {/* Colonne droite : comment l'agent authentifie ses accès */}
        <div className="flex flex-col gap-5 lg:order-3">
          {identity && <IntegrationGroupCard group={identity} />}
          <p
            className="m-0 px-5 py-4 text-[12.5px] leading-[1.6] text-[var(--pf-fg-muted)]"
            style={{ border: "1px solid var(--pf-border)", background: "var(--pf-bg-card-2)" }}
          >
            {copy.authText}
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#FF6A13] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff8232]"
        >
          <BookOpen size={16} />
          {copy.docsLabel}
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Copy                                                      */
/* ──────────────────────────────────────────────────────── */

type IntegrationCopy = {
  authText: string;
  docsLabel: string;
  groupTitles: string[];
  moreLabel: (n: number) => string;
};

/* ──────────────────────────────────────────────────────── */
/*  Section                                                   */
/* ──────────────────────────────────────────────────────── */

export function IntegrationSection() {
  const { t } = useTranslation();
  const copy: IntegrationCopy = {
    groupTitles: t("integration.stack.groupTitles", {
      returnObjects: true,
    }) as string[],
    moreLabel: (count) => t("integration.stack.more", { count }),
    authText: t("integration.stack.auth"),
    docsLabel: t("integration.stack.docs"),
  };
  const docsUrl = DOCS_URL;

  return (
    <div>
      <h2
        className="m-0 mx-auto max-w-[900px] text-center font-bold leading-[1.06] tracking-[-0.02em] text-[var(--pf-fg)]"
        style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
      >
        {t("integration.titlePrefix")}{" "}
        <span className="text-[#FF6A13]">
          {t("integration.titleHighlight")}
        </span>{" "}
        {t("integration.titleSuffix")}
      </h2>
      <p className="mx-auto mt-[18px] max-w-[640px] text-center text-[1.05rem] leading-[1.65] text-[var(--pf-fg-muted)]">
        {t("integration.subtitle")}
      </p>

      <div className="mt-11">
        <StackMockup copy={copy} docsUrl={docsUrl} />
      </div>
    </div>
  );
}
