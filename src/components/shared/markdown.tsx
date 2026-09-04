import 'katex/dist/katex.min.css';

import { Check, Copy } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { type BundledLanguage, createHighlighter, type Highlighter } from 'shiki';

import { useCopyToClipboard } from '@/hooks/use-copy';
import { cn } from '@/lib/utils';

import { readMarkerHref } from './markdown-markers';

import type { MarkerKind } from './markdown-markers';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
type MarkdownProps = {
  content: string;
  className?: string;
  inline?: boolean;
  renderMarker?: (kind: MarkerKind, index: number, children: React.ReactNode) => React.ReactNode;
};

const TABLE_SEPARATOR_RE = /\|(?:\s*:?-{3,}:?\s*\|){2,}/;

export const content = {
  normalize(input: string): string {
    const normalized = input.replace(/\r\n?/g, '\n');

    if (!TABLE_SEPARATOR_RE.test(normalized)) {
      return normalized;
    }

    return normalized
      .split('\n')
      .map((line) => {
        if (!TABLE_SEPARATOR_RE.test(line)) {
          return line;
        }

        let repaired = line.replace(/\|\|(?=\s*\|)/g, '|\n|');

        repaired = repaired.replace(
          /^(.*?)(\|[^\n]+\|\n\|(?:\s*:?-{3,}:?\s*\|){2,})/,
          (_match, prefix: string, tableStart: string) => {
            const trimmedPrefix = prefix.trimEnd();
            if (!trimmedPrefix) {
              return tableStart;
            }
            return `${trimmedPrefix}\n${tableStart}`;
          },
        );

        repaired = repaired.replace(
          /(\|)(?=(?:Contact Information:|Phone:|Email:|Adresse:|Telephone:|Tel:))/g,
          '$1\n',
        );

        return repaired;
      })
      .join('\n');
  },

  hasTable(input: string): boolean {
    return /(^|\n)\s*\|.*\|\s*\n\s*\|(?:\s*:?-{3,}:?\s*\|){2,}/m.test(content.normalize(input));
  },
};

const KATEX_TAGS = [
  'annotation',
  'annotation-xml',
  'maction',
  'math',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlabeledtr',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'none',
  'semantics',
] as const;

const markdownAttributes = defaultSchema.attributes ?? {};
const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...KATEX_TAGS],
  attributes: {
    ...markdownAttributes,
    ...Object.fromEntries(
      KATEX_TAGS.map((tag) => [
        tag,
        ['className', 'colSpan', 'encoding', 'rowSpan', 'src', 'style', 'xmlns'],
      ]),
    ),
    a: [...(markdownAttributes['a'] ?? []), 'rel', 'target'],
    div: ['className', 'itemScope', 'itemType', 'style'],
    img: [...(markdownAttributes['img'] ?? []), 'className', 'loading'],
    pre: ['className'],
    span: ['aria-hidden', 'className', 'style'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: [
      ...(defaultSchema.protocols?.href ?? ['http', 'https', 'mailto', 'xmpp', 'irc', 'ircs']),
      'cite',
      'halluc',
    ],
  },
};

const plugins: { remark: PluggableList; rehype: PluggableList } = {
  remark: [remarkGfm, remarkMath],
  rehype: [rehypeKatex, [rehypeSanitize, markdownSchema]],
};
let highlighterPromise: Promise<Highlighter> | undefined;
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark-default'],
      langs: [],
    });
  }
  return highlighterPromise;
}
const highlight = async (code: string, lang: string): Promise<string> => {
  const hl = await getHighlighter();
  const loaded = hl.getLoadedLanguages();
  if (!loaded.includes(lang as BundledLanguage)) {
    try {
      await hl.loadLanguage(lang as BundledLanguage);
    } catch {
      lang = 'text';
      if (!loaded.includes('text')) {
        await hl.loadLanguage('text');
      }
    }
  }
  return hl.codeToHtml(code, { lang, theme: 'github-dark-default' });
};
const CodeBlock = React.memo(function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const { t } = useTranslation();
  const { copied, copy } = useCopyToClipboard();
  useEffect(() => {
    let cancelled = false;
    highlight(code, language || 'text')
      .then((html) => {
        if (!cancelled) {
          setHighlighted(html);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, language]);
  return (
    <div className="group/code relative mb-2 overflow-hidden rounded-lg border border-border/40 bg-[#0d1117] text-sm">
      <div className="flex items-center justify-between border-b border-border/20 bg-[#161b22] px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground/70 select-none">
          {language || 'text'}
        </span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label={t('markdown.copy_code')}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">{t('markdown.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{t('markdown.copy')}</span>
            </>
          )}
        </button>
      </div>

      {highlighted ? (
        <div
          className="overflow-x-auto p-3 [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:!p-0"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <pre className="overflow-x-auto p-3">
          <code className="font-mono text-sm text-gray-300">{code}</code>
        </pre>
      )}
    </div>
  );
});
const InlineParagraph = React.memo(function InlineParagraph({
  components,
  paragraph,
  urlTransform,
}: {
  components: Components;
  paragraph: string;
  urlTransform: (url: string) => string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={plugins.remark}
      urlTransform={urlTransform}
      rehypePlugins={plugins.rehype}
      unwrapDisallowed
      disallowedElements={['p', 'div']}
      components={components}
    >
      {paragraph}
    </ReactMarkdown>
  );
});

export const Markdown = React.memo(function Markdown({
  content: mdContent,
  className,
  inline,
  renderMarker,
}: MarkdownProps) {
  const safeContent = useMemo(
    () =>
      content.normalize(
        typeof mdContent === 'string'
          ? mdContent
          : mdContent !== null &&
              mdContent !== undefined &&
              typeof mdContent === 'object' &&
              'content' in (mdContent as Record<string, unknown>) &&
              typeof (mdContent as Record<string, unknown>).content === 'string'
            ? ((mdContent as Record<string, unknown>).content as string)
            : '',
      ),
    [mdContent],
  );
  const urlTransform = useMemo(
    () => (url: string) => (readMarkerHref(url) ? url : defaultUrlTransform(url)),
    [],
  );
  const markerRenderer = useMemo(
    () =>
      renderMarker
        ? {
            a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
              const marker = readMarkerHref(href);
              if (marker) {
                return <>{renderMarker(marker.kind, marker.index, children)}</>;
              }
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              );
            },
          }
        : {},
    [renderMarker],
  );
  const components = useMemo(() => {
    if (inline) {
      return {
        code: ({
          children,
          ...props
        }: React.HTMLAttributes<HTMLElement> & {
          children?: React.ReactNode;
        }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
            {children}
          </code>
        ),
        a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {children}
          </a>
        ),
        table: ({ children }: { children?: React.ReactNode }) => (
          <div className="mb-2 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border">{children}</table>
          </div>
        ),
        th: ({ children }: { children?: React.ReactNode }) => (
          <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }: { children?: React.ReactNode }) => (
          <td className="border border-border px-3 py-2">{children}</td>
        ),
      };
    }
    return {
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-2 last:mb-0">{children}</p>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="mb-2 ml-4 list-disc">{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="mb-2 ml-4 list-decimal">{children}</ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => <li className="mb-1">{children}</li>,
      code: ({
        className: codeClassName,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement> & {
        children?: React.ReactNode;
      }) => {
        const match = /language-(\w+)/.exec(codeClassName || '');
        if (match) {
          const code = String(children).replace(/\n$/, '');
          return <CodeBlock language={match[1]} code={code} />;
        }
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => {
        if (
          children &&
          typeof children === 'object' &&
          'type' in (children as unknown as Record<string, unknown>) &&
          (
            children as unknown as {
              type?: unknown;
            }
          ).type === CodeBlock
        ) {
          return <>{children}</>;
        }
        return <pre className="mb-2 overflow-hidden rounded-lg bg-muted p-0">{children}</pre>;
      },
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      ),
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {children}
        </a>
      ),
      img: ({ src, alt }: { src?: string; alt?: string }) => (
        <img
          src={src}
          alt={alt || ''}
          className="my-2 max-w-full rounded-lg border border-border/40"
          loading="lazy"
        />
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="mb-2 overflow-x-auto">
          <table className="min-w-full border-collapse border border-border">{children}</table>
        </div>
      ),
      th: ({ children }: { children?: React.ReactNode }) => (
        <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
          {children}
        </th>
      ),
      td: ({ children }: { children?: React.ReactNode }) => (
        <td className="border border-border px-3 py-2">{children}</td>
      ),
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mb-2 mt-4 text-xl font-bold first:mt-0">{children}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 className="mb-2 mt-3 text-lg font-bold first:mt-0">{children}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="mb-2 mt-2 text-base font-bold first:mt-0">{children}</h3>
      ),
      hr: () => <hr className="my-4 border-border" />,
    };
  }, [inline]);
  const allComponents = useMemo(
    () => ({ ...components, ...markerRenderer }),
    [components, markerRenderer],
  );
  if (inline) {
    const paragraphs = safeContent.split(/\n{2,}/);
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <>
                <br />
                <br />
              </>
            )}
            <InlineParagraph
              components={allComponents}
              paragraph={paragraph}
              urlTransform={urlTransform}
            />
          </React.Fragment>
        ))}
      </>
    );
  }
  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={plugins.remark}
        urlTransform={urlTransform}
        rehypePlugins={plugins.rehype}
        components={allComponents}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
});
