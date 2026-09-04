export type ToolChunk = {
  bboxes?: number[][];
  chunkId?: string;
  content: string;
  displayChunkId?: string;
  fileId?: string;
  fileName?: string;
  metadata?: Record<string, unknown>;
  pageId?: string;
  pageNumber?: number;
  score?: number;
  text?: string;
  type?: string;
};

export type ToolFileRef = {
  fileName: string;
  pages?: number[];
};

export type ToolResponse = {
  action?: string;
  chunks?: ToolChunk[];
  count?: number;
  files?: ToolFileRef[];
  message?: string;
  status?: string;
};

function str(v: unknown): string {
  if (typeof v === 'string') {
    return v;
  }
  if (v === null || v === undefined) {
    return '';
  }
  return String(v);
}

export function parseToolResponse(v: unknown): ToolResponse | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    return null;
  }
  const payload = v as Record<string, unknown>;
  const raw =
    payload.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
      ? (payload.result as Record<string, unknown>)
      : payload.response && typeof payload.response === 'object' && !Array.isArray(payload.response)
        ? (payload.response as Record<string, unknown>)
        : payload;
  const chunks = Array.isArray(raw.chunks)
    ? ((raw.chunks as Record<string, unknown>[]).map((c) => ({
        ...c,
        bboxes: Array.isArray(c.bboxes)
          ? (c.bboxes as unknown[]).filter(
              (item): item is number[] =>
                Array.isArray(item) &&
                item.length === 4 &&
                item.every((value) => typeof value === 'number'),
            )
          : undefined,
        chunkId: c.chunkId ? str(c.chunkId) : undefined,
        content: str(c.content),
        displayChunkId: c.displayChunkId ? str(c.displayChunkId) : undefined,
        fileName: c.fileName ? str(c.fileName) : undefined,
        pageId: c.pageId ? str(c.pageId) : undefined,
        text: c.text ? str(c.text) : undefined,
      })) as ToolChunk[])
    : undefined;
  const files = Array.isArray(raw.files)
    ? (raw.files as Record<string, unknown>[])
        .filter((file) => typeof file.fileName === 'string')
        .map((file) => ({
          fileName: str(file.fileName),
          pages: Array.isArray(file.pages)
            ? file.pages.map((page) => Number(page)).filter((page) => Number.isFinite(page))
            : undefined,
        }))
    : undefined;
  return { ...raw, chunks, files } as ToolResponse;
}
