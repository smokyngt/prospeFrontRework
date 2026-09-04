import { Link2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/use-is-touch';
import { cn } from '@/lib/cn';
import { usePdfStore } from '@/stores/pdf';

import { usePortalContainer } from '../portal-context';

import { citationPreview } from './preview';
import { utils } from './utils';

import type { CitationWithPdfHints } from './utils';

type ChatCitationBadgeProps = {
  citation: CitationWithPdfHints;
  index: number;
  onOpen?: (citation: CitationWithPdfHints) => void;
  siblings?: CitationWithPdfHints[];
  variant?: 'badge' | 'inline';
};

export const ChatCitationBadge = memo(function ChatCitationBadge({
  citation,
  index,
  onOpen,
  siblings,
  variant = 'badge',
}: ChatCitationBadgeProps) {
  const portalContainer = usePortalContainer();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isTouch = useIsTouch();
  const openAtCitation = usePdfStore((s) => s.openAtCitation);
  const { t } = useTranslation('chat');
  const labels = citationPreview.useLabels();
  const isOpenable = !!citation.fileId && !!citation.fileName;
  const confidence =
    citation.confidence !== undefined ? Math.round(citation.confidence * 100) : null;
  const openPayload = utils.getCitationPayload(citation);
  const open = useCallback(() => {
    if (onOpen) {
      onOpen(citation);
      return;
    }
    if (!openPayload) {
      return;
    }
    const sameFileSiblings = (siblings ?? [citation]).filter((s) => s.fileId === citation.fileId);
    const siblingPayloads = sameFileSiblings
      .map((s) => utils.getCitationPayload(s))
      .filter(Boolean) as NonNullable<ReturnType<typeof utils.getCitationPayload>>[];
    const focusedIndex = sameFileSiblings.findIndex((s) => s === citation);
    if (siblingPayloads.length > 1) {
      openAtCitation(openPayload, siblingPayloads, focusedIndex >= 0 ? focusedIndex : undefined);
    } else {
      openAtCitation(openPayload);
    }
  }, [onOpen, openAtCitation, openPayload, siblings, citation]);

  const handleActivate = useCallback(() => {
    if (isTouch) {
      setTooltipOpen((value) => !value);
      return;
    }
    open();
  }, [isTouch, open]);

  const tooltip = (
    <TooltipContent
      className="rounded-none border-border/60 p-3"
      container={portalContainer}
      side="top"
      sideOffset={14}
    >
      <citationPreview.Shell tone="primary">
        <citationPreview.Citation citation={citation} {...labels} />
        {isOpenable && isTouch ? <citationPreview.OpenInDocument onOpen={open} /> : null}
      </citationPreview.Shell>
    </TooltipContent>
  );

  if (variant === 'inline') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleActivate}
            disabled={!isOpenable}
            className={cn(
              'inline-flex items-center gap-1 px-1 py-0.5',
              'text-primary underline-offset-2 hover:underline hover:decoration-primary',
              'cursor-pointer text-sm font-medium transition-colors',
              !isOpenable && 'cursor-not-allowed opacity-60',
            )}
          >
            <Link2 className="h-3 w-3" />
            <span>{t('citations.reference', { index })}</span>
          </button>
        </TooltipTrigger>
        {tooltip}
      </Tooltip>
    );
  }

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'cursor-pointer items-center gap-1.5 rounded-none border-border/70 bg-background px-2 py-1.5',
            'hover:border-primary/40 hover:bg-primary/8',
            'transition-colors',
            !isOpenable && 'cursor-not-allowed opacity-70',
          )}
          role="button"
          aria-disabled={!isOpenable}
          onClick={handleActivate}
        >
          <Link2 className="h-3 w-3 text-primary" />
          {citation.pageNumber && (
            <span className="font-mono text-[10px] font-semibold text-primary">
              {t('citations.page_short', { number: citation.pageNumber })}
            </span>
          )}
          <span className="text-[11px] font-medium text-foreground">
            {t('citations.reference', { index })}
          </span>
          {confidence !== null && (
            <span
              className={cn(
                'shrink-0 font-mono text-[10px] tabular-nums',
                utils.strengthClass(citation.confidence),
              )}
            >
              {confidence}%
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      {tooltip}
    </Tooltip>
  );
});
