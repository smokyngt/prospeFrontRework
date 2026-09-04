import { ChevronDown, ChevronRight, ExternalLink, ImageIcon, TableIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { usePdfStore } from '@/stores/pdf';

import type { ToolResponse } from './types';

type SearchResultsViewProps = {
  embedded?: boolean;
  response: ToolResponse | null;
};

type Chunk = NonNullable<ToolResponse['chunks']>[number];

type FileGroup = {
  chunks: Chunk[];
  fileId?: string;
  fileName: string;
  key: string;
  topScore: number;
};

function dedupeByPage(chunks: Chunk[]): Chunk[] {
  const seenPages = new Set<number>();
  return chunks.filter((chunk) => {
    if (chunk.pageNumber === undefined) {
      return true;
    }
    if (seenPages.has(chunk.pageNumber)) {
      return false;
    }
    seenPages.add(chunk.pageNumber);
    return true;
  });
}

function groupChunks(response: ToolResponse): FileGroup[] {
  const chunks = [...(response.chunks ?? [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const files = new Map<string, FileGroup>();

  for (const chunk of chunks) {
    const key = chunk.fileId ?? chunk.fileName ?? 'document';
    const existing = files.get(key);
    if (existing) {
      existing.chunks.push(chunk);
      existing.topScore = Math.max(existing.topScore, chunk.score ?? 0);
      continue;
    }
    files.set(key, {
      chunks: [chunk],
      fileId: chunk.fileId,
      fileName: chunk.fileName ?? chunk.fileId ?? 'Document',
      key,
      topScore: chunk.score ?? 0,
    });
  }

  return [...files.values()]
    .map((file) => ({
      ...file,
      chunks: dedupeByPage(
        [...file.chunks].sort((a, b) => {
          const byPage = (a.pageNumber ?? 0) - (b.pageNumber ?? 0);
          return byPage || (b.score ?? 0) - (a.score ?? 0);
        }),
      ),
    }))
    .sort((a, b) => b.topScore - a.topScore);
}

function groupFiles(response: ToolResponse): FileGroup[] {
  return (response.files ?? []).map((file, index) => ({
    chunks: (file.pages ?? []).map((pageNumber) => ({
      content: '',
      pageNumber,
    })) as Chunk[],
    fileName: file.fileName,
    key: `file-summary-${index}-${file.fileName}`,
    topScore: 0,
  }));
}

export function SearchResultsView({ embedded = false, response }: SearchResultsViewProps) {
  const { t } = useTranslation('chat');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const openAtCitation = usePdfStore((s) => s.openAtCitation);

  const hasChunkDetails = (response?.chunks?.length ?? 0) > 0;
  const files = useMemo(
    () => (response ? (hasChunkDetails ? groupChunks(response) : groupFiles(response)) : []),
    [response, hasChunkDetails],
  );
  const totalChunks = (response?.chunks?.length ?? 0) || (response?.count ?? 0);

  if (!response || (totalChunks === 0 && files.length === 0)) {
    return null;
  }

  return (
    <div className={cn('w-full', embedded ? 'mt-0' : 'mt-1.5')}>
      {!embedded && (
        <p className="mb-1.5 text-[10px] text-muted-foreground/60">
          {t('status.search_results.matches', { count: totalChunks })} ·{' '}
          {t('status.search_results.documents', { count: files.length })}
        </p>
      )}

      <div className="max-h-[22rem] space-y-2 overflow-y-auto">
        {files.map((file) => {
          const isCollapsed = collapsed[file.key] ?? false;

          return (
            <div key={file.key}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [file.key]: !isCollapsed,
                  }))
                }
                className="group flex w-full items-center gap-1.5 py-0.5 text-left"
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                )}
                <span className="truncate text-[11px] font-medium text-foreground/85">
                  {file.fileName}
                </span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/40">
                  {file.chunks.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="ml-[5px] border-l border-border/50 pl-2.5">
                  {file.chunks.map((chunk, i) => {
                    const fileId = chunk.fileId ?? file.fileId;
                    const canOpen = fileId !== undefined && chunk.pageNumber !== undefined;

                    return (
                      <button
                        key={`${file.key}-${i}`}
                        type="button"
                        disabled={!canOpen}
                        onClick={() =>
                          canOpen &&
                          openAtCitation({
                            fileId: fileId!,
                            fileName: file.fileName,
                            pageNumber: chunk.pageNumber!,
                          })
                        }
                        title={canOpen ? t('status.search_results.open_page') : undefined}
                        className={cn(
                          'group/chunk block w-full py-1 text-left transition-colors',
                          canOpen ? 'cursor-pointer hover:bg-primary/5' : 'cursor-default',
                        )}
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="w-8 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/50">
                            {chunk.pageNumber !== undefined ? `p.${chunk.pageNumber}` : '-'}
                          </span>
                          {chunk.type === 'table' && (
                            <TableIcon className="h-3 w-3 shrink-0 self-center text-muted-foreground/50" />
                          )}
                          {(chunk.type === 'figure' || chunk.type === 'image') && (
                            <ImageIcon className="h-3 w-3 shrink-0 self-center text-muted-foreground/50" />
                          )}
                          {canOpen && (
                            <ExternalLink className="ml-auto h-3 w-3 shrink-0 self-center text-muted-foreground/0 transition-colors group-hover/chunk:text-primary" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
