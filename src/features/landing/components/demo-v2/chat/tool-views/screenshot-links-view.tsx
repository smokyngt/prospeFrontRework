import { ChevronLeft, ChevronRight, ScanSearch } from 'lucide-react';
import { useState } from 'react';

import { usePdfStore } from '@/stores/pdf';

import { PagePreview } from '../citation/page-preview';

import type { ToolChunk, ToolResponse } from './types';

type ScreenshotLinksViewProps = { response: ToolResponse | null };

function isScreenshotChunk(chunk: ToolChunk): boolean {
  return Boolean(
    chunk.fileId &&
    chunk.pageNumber !== null &&
    chunk.pageNumber !== undefined &&
    (chunk.metadata?.type === 'screenshot' || chunk.type === 'image') &&
    chunk.metadata?.type !== 'screenshot-summary',
  );
}

function FileScreenshots({
  fileId,
  fileName,
  pages,
}: {
  fileId: string;
  fileName: string;
  pages: ToolChunk[];
}) {
  const [index, setIndex] = useState(0);
  const openAtCitation = usePdfStore((s) => s.openAtCitation);
  const current = pages[index];
  const hasMultiple = pages.length > 1;

  return (
    <div className="space-y-1.5">
      <div className="flex w-full items-center gap-1.5 text-[10px] text-foreground/70">
        <ScanSearch className="h-2.5 w-2.5 shrink-0 text-warning" />
        <span className="min-w-0 flex-1 truncate">{fileName}</span>
        {hasMultiple && (
          <div className="flex shrink-0 items-center border border-border/60 bg-background">
            <button
              aria-label="Previous page"
              className="flex h-5 w-5 items-center justify-center text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              type="button"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="px-1 font-mono text-[10px] font-medium tabular-nums text-foreground/70">
              {index + 1}/{pages.length}
            </span>
            <button
              aria-label="Next page"
              className="flex h-5 w-5 items-center justify-center text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              disabled={index === pages.length - 1}
              onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
              type="button"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <PagePreview className="mx-auto w-40" fileId={fileId} pageNumber={current.pageNumber} />

      <button
        className="mx-auto flex items-center gap-1 border border-border/30 bg-background/50 px-2 py-0.5 text-[10px] text-foreground/70 transition-colors hover:bg-muted/40 hover:text-foreground"
        onClick={() =>
          current.pageNumber &&
          openAtCitation({
            fileId,
            fileName,
            pageNumber: current.pageNumber,
          })
        }
        type="button"
      >
        <ScanSearch className="h-2.5 w-2.5" />
        Open page {current.pageNumber}
      </button>
    </div>
  );
}

export function ScreenshotLinksView({ response }: ScreenshotLinksViewProps) {
  if (!response?.chunks?.length) {
    return null;
  }

  const chunks = response.chunks.filter(isScreenshotChunk);
  if (!chunks.length) {
    return null;
  }

  const groups: { fileId: string; fileName: string; pages: ToolChunk[] }[] = [];
  for (const chunk of chunks) {
    const fileId = chunk.fileId!;
    const group = groups.find((g) => g.fileId === fileId);
    if (group) {
      group.pages.push(chunk);
    } else {
      groups.push({ fileId, fileName: chunk.fileName ?? fileId, pages: [chunk] });
    }
  }

  return (
    <div className="mt-1.5 space-y-3">
      {groups.map((group) => (
        <FileScreenshots
          key={group.fileId}
          fileId={group.fileId}
          fileName={group.fileName}
          pages={group.pages}
        />
      ))}
    </div>
  );
}
