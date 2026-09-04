import { Check, Copy } from "lucide-react";
import React, { useMemo } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import { useCopyToClipboard } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

import { readMarkerHref } from "./markdown-markers";

import type { MarkerKind } from "./markdown-markers";
import type { Components } from "react-markdown";

/**
 * Version allégée du `Markdown` du workspace, pour la landing.
 *
 * API identique (`Markdown`, `content.normalize`, `content.hasTable`,
 * marqueurs `cite:` / `halluc:` via `renderMarker`) et même arbre DOM, donc
 * même rendu pour tout ce que la démo affiche.
 *
 * Retiré par rapport au workspace, faute d'usage ici et pour ne pas embarquer
 * ~1 Mo de JS sur une landing :
 *   - coloration syntaxique Shiki   → bloc `<pre><code>` simple + bouton copier
 *   - formules LaTeX (KaTeX + remark-math)
 *   - rehype-sanitize
 * Pour revenir à la version complète : reprendre design/components/shared/
 * markdown.tsx et installer rehype-katex, rehype-sanitize, remark-math, shiki,
 * unified et katex.
 */

type MarkdownProps = {
  content: string;
  className?: string;
  inline?: boolean;
  renderMarker?: (
    kind: MarkerKind,
    index: number,
    children: React.ReactNode,
  ) => React.ReactNode;
};

const TABLE_SEPARATOR_RE = /\|(?:\s*:?-{3,}:?\s*\|){2,}/;

export const content = {
  normalize(input: string): string {
    const normalized = input.replace(/\r\n?/g, "\n");

    if (!TABLE_SEPARATOR_RE.test(normalized)) {
      return normalized;
    }

    return normalized
      .split("\n")
      .map((line) => {
        if (!TABLE_SEPARATOR_RE.test(line)) {
          return line;
        }

        let repaired = line.replace(/\|\|(?=\s*\|)/g, "|\n|");

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
          "$1\n",
        );

        return repaired;
      })
      .join("\n");
  },

  hasTable(input: string): boolean {
    return /(^|\n)\s*\|.*\|\s*\n\s*\|(?:\s*:?-{3,}:?\s*\|){2,}/m.test(
      content.normalize(input),
    );
  },
};

const remarkPlugins = [remarkGfm];

/** Remplace le bloc Shiki : même structure, sans coloration. */
const CodeBlock = React.memo(function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="relative mb-2 overflow-hidden rounded-lg border border-border bg-muted">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{language}</span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label={language}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-sm">{code}</code>
      </pre>
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
      remarkPlugins={remarkPlugins}
      urlTransform={urlTransform}
      unwrapDisallowed
      disallowedElements={["p", "div"]}
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
        typeof mdContent === "string"
          ? mdContent
          : mdContent !== null &&
              mdContent !== undefined &&
              typeof mdContent === "object" &&
              "content" in (mdContent as Record<string, unknown>) &&
              typeof (mdContent as Record<string, unknown>).content === "string"
            ? ((mdContent as Record<string, unknown>).content as string)
            : "",
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
            a: ({
              children,
              href,
              ...props
            }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
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
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
            {...props}
          >
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
            <table className="min-w-full border-collapse border border-border">
              {children}
            </table>
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
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="mb-1">{children}</li>
      ),
      code: ({
        className: codeClassName,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement> & {
        children?: React.ReactNode;
      }) => {
        const match = /language-(\w+)/.exec(codeClassName || "");
        if (match) {
          const code = String(children).replace(/\n$/, "");
          return <CodeBlock code={code} language={match[1]} />;
        }
        return (
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => {
        if (
          children &&
          typeof children === "object" &&
          "type" in (children as unknown as Record<string, unknown>) &&
          (children as unknown as { type?: unknown }).type === CodeBlock
        ) {
          return <>{children}</>;
        }
        return (
          <pre className="mb-2 overflow-hidden rounded-lg bg-muted p-0">
            {children}
          </pre>
        );
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ""}
          className="my-2 max-w-full rounded-lg border border-border/40"
          loading="lazy"
        />
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="mb-2 overflow-x-auto">
          <table className="min-w-full border-collapse border border-border">
            {children}
          </table>
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
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        urlTransform={urlTransform}
        components={allComponents}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
});
