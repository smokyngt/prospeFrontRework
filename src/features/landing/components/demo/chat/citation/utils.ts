import type { Citation, Hallucination } from '@prosperify/sdk';

export type CitationWithPdfHints = Citation & {
  pdfPhrase?: string;
};

type CitationGroup = {
  citations: CitationWithPdfHints[];
  fileId?: string;
  fileName: string;
  key: string;
  pages: number[];
};

function getCitationPayload(
  citation: CitationWithPdfHints,
  responseText?: string,
): null | {
  bboxes?: number[][];
  chunkId: string;
  fileId: string;
  fileName: string;
  pageNumber: number;
  text?: string;
} {
  if (!citation.fileId || !citation.fileName || typeof citation.fileName !== 'string') {
    return null;
  }

  const sourceSnippet = citation.evidence?.trim();
  const responseFallback =
    citation.pdfPhrase ||
    (citation.start !== null &&
    citation.start !== undefined &&
    citation.end !== null &&
    citation.end !== undefined &&
    responseText
      ? responseText.slice(citation.start, citation.end)
      : undefined);
  const rawPhrase = sourceSnippet || responseFallback;

  const phrase =
    rawPhrase
      ?.replace(/\*{1,3}|_{1,3}/g, '')
      .replace(/^#{1,6} /gm, '')
      .replace(/^[>\-*+] /gm, '')
      .replace(/`/g, '')
      .trim() || rawPhrase;
  const bboxes = Array.isArray(citation.bboxes)
    ? citation.bboxes.filter((item) => Array.isArray(item) && item.length === 4)
    : undefined;

  return {
    ...(bboxes?.length ? { bboxes } : {}),
    chunkId: citation.chunkId,
    fileId: citation.fileId,
    fileName: citation.fileName,
    pageNumber: citation.pageNumber ?? 1,
    ...(phrase || citation.answer ? { text: phrase || citation.answer } : {}),
  };
}

function getHallucinationPayload(
  hallucination: Hallucination,
  citations: CitationWithPdfHints[],
): null | {
  bboxes?: number[][];
  chunkId: string;
  fileId: string;
  fileName: string;
  kind: 'hallucination';
  pageNumber: number;
  text?: string;
} {
  if (!hallucination.chunkId) {
    return null;
  }

  const source = citations.find((citation) => citation.chunkId === hallucination.chunkId);

  if (!source?.fileId || !source.fileName) {
    return null;
  }

  const bboxes = Array.isArray(source.bboxes)
    ? source.bboxes.filter((item) => Array.isArray(item) && item.length === 4)
    : undefined;
  const evidence = hallucination.evidence?.trim();

  return {
    ...(bboxes?.length ? { bboxes } : {}),
    chunkId: hallucination.chunkId,
    fileId: source.fileId,
    fileName: source.fileName,
    kind: 'hallucination',
    pageNumber: source.pageNumber ?? 1,
    ...(evidence ? { text: evidence } : {}),
  };
}

function groupCitations(citations: CitationWithPdfHints[]): CitationGroup[] {
  const groups = new Map<string, CitationGroup>();

  citations.forEach((citation) => {
    const fileName = typeof citation.fileName === 'string' ? citation.fileName : 'Unknown source';
    const key = `${citation.fileId ?? fileName}:${fileName}`;
    const existing = groups.get(key);

    if (existing) {
      existing.citations.push(citation);
      if (citation.pageNumber && !existing.pages.includes(citation.pageNumber)) {
        existing.pages.push(citation.pageNumber);
      }
      return;
    }

    groups.set(key, {
      citations: [citation],
      fileId: citation.fileId,
      fileName,
      key,
      pages: citation.pageNumber ? [citation.pageNumber] : [],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      citations: [...group.citations].sort((left, right) => {
        const leftPage = left.pageNumber ?? 0;
        const rightPage = right.pageNumber ?? 0;
        if (leftPage !== rightPage) {
          return leftPage - rightPage;
        }
        return left.chunkId.localeCompare(right.chunkId);
      }),
      pages: [...group.pages].sort((left, right) => left - right),
    }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}

function strengthClass(value: number | undefined, tone: 'primary' | 'warning' = 'primary'): string {
  if (value === undefined || Number.isNaN(value)) {
    return 'text-muted-foreground';
  }
  const pct = Math.round(value * 100);
  if (tone === 'warning') {
    if (pct >= 75) {
      return 'text-warning';
    }
    if (pct >= 40) {
      return 'text-warning/70';
    }
    return 'text-warning/40';
  }
  if (pct >= 75) {
    return 'text-primary';
  }
  if (pct >= 40) {
    return 'text-primary/70';
  }
  return 'text-muted-foreground';
}

function fileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toUpperCase() : 'FILE';
}

function summarizePages(
  pages: number[],
  t: (key: string, opts?: Record<string, unknown>) => string,
) {
  if (pages.length === 0) {
    return [] as string[];
  }
  if (pages.length <= 3) {
    return pages.map((page) => t('citations.page_short', { number: page }));
  }
  return [
    t('citations.page_short', { number: pages[0] }),
    t('citations.page_short', { number: pages[1] }),
    `+${pages.length - 2}`,
  ];
}

export const utils = {
  fileExtension,
  getCitationPayload,
  getHallucinationPayload,
  groupCitations,
  strengthClass,
  summarizePages,
};
