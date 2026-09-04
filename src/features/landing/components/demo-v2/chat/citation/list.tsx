import {
  ChevronDown,
  ChevronRight,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/workspace-ui/ui/collapsible';
import { cn } from '@/lib/cn';

import { ChatCitationBadge } from './badge';
import { utils } from './utils';

import type { CitationWithPdfHints } from './utils';
import type { Citation } from '@/lib/workspace-sdk-types';

type ChatCitationListProps = {
  citations: Citation[];
  className?: string;
  onOpen?: (citation: CitationWithPdfHints) => void;
};

function FileTypeIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const Icon =
    ext === 'pdf'
      ? FileType
      : ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
        ? FileImage
        : ['csv', 'xls', 'xlsx'].includes(ext)
          ? FileSpreadsheet
          : FileText;
  return <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />;
}

export function ChatCitationList({ citations, className, onOpen }: ChatCitationListProps) {
  const { t } = useTranslation('chat');
  const [open, setOpen] = useState(false);
  const groups = useMemo(
    () =>
      utils.groupCitations(
        (citations as CitationWithPdfHints[]).filter((c) => {
          if (!c.fileId) {
            return false;
          }
          const hasText = typeof c.answer === 'string' && c.answer.trim().length > 0;
          const hasSourceText = typeof c.evidence === 'string' && c.evidence.trim().length > 0;
          const hasBbox =
            Array.isArray(c.bboxes) && c.bboxes.some((b) => Array.isArray(b) && b.length === 4);
          return hasText || hasSourceText || hasBbox;
        }),
      ),
    [citations],
  );

  if (!groups.length) {
    return null;
  }

  const total = groups.reduce((sum, group) => sum + group.citations.length, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('mt-2', className)}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 border border-border/50 bg-muted/25 px-2.5 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <FileText className="h-3 w-3 shrink-0 text-primary" />
          <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-foreground">
            {t('citations.sources', { count: total })}
          </span>
          <span className="ml-auto min-w-0 truncate text-[10px] text-muted-foreground">
            {[...new Set(groups.map((group) => group.fileName))].join(' · ')}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1.5 pt-1.5">
        {groups.map((group) => {
          const offset = groups
            .slice(0, groups.indexOf(group))
            .reduce((sum, previous) => sum + previous.citations.length, 0);
          return (
            <div
              key={group.key}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 border border-border/50 bg-muted/25 px-2.5 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <FileTypeIcon fileName={group.fileName} />
                <span className="truncate text-[11px] font-medium text-foreground">
                  {group.fileName}
                </span>
              </span>
              {group.citations.map((citation, idx) => (
                <ChatCitationBadge
                  key={`${citation.chunkId}-${citation.pageNumber ?? 0}-${idx}`}
                  citation={citation}
                  index={offset + idx + 1}
                  onOpen={onOpen}
                  siblings={group.citations}
                />
              ))}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
