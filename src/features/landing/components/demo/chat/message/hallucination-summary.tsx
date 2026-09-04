import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/use-is-touch';
import { cn } from '@/lib/cn';

import { citationPreview } from '../citation/preview';
import { utils } from '../citation/utils';
import { usePortalContainer } from '../portal-context';

import type { Citation, Hallucination } from '@prosperify/sdk';

type HallucinationSummaryProps = {
  citations?: Citation[];
  hallucinations: Hallucination[];
  onOpen?: () => void;
};

export function HallucinationSummary({
  citations = [],
  hallucinations,
  onOpen,
}: HallucinationSummaryProps) {
  const { t } = useTranslation('chat');
  const portalContainer = usePortalContainer();
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 0);
  };

  const closeNow = () => {
    cancelClose();
    setOpen(false);
  };

  useEffect(() => cancelClose, []);
  const maxScore = Math.max(...hallucinations.map((h) => h.score));

  return (
    <Tooltip
      open={open || pinned}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPinned(false);
        }
      }}
    >
      <TooltipTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed h-0 w-0"
          style={{ left: anchor.x, top: anchor.y }}
        />
      </TooltipTrigger>
      <>
        <span
          className="inline-flex items-center gap-2 rounded-none border border-border/60 bg-muted/40 px-2.5 py-1 text-xs cursor-help"
          onPointerMove={(event) => setAnchor({ x: event.clientX, y: event.clientY })}
          onClick={() => {
            if (!isTouch) {
              onOpen?.();
              return;
            }
            cancelClose();
            setPinned((value) => !value);
            setOpen((value) => !value || !pinned);
          }}
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (!pinned) {
              scheduleClose();
            }
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            {hallucinations.length} hallucination
            {hallucinations.length > 1 ? 's' : ''} detected
          </span>
          <span className="text-muted-foreground">·</span>
          <span className={cn('font-mono tabular-nums', utils.strengthClass(maxScore, 'warning'))}>
            {Math.round(maxScore * 100)}%
          </span>
        </span>
      </>
      <TooltipContent
        className="rounded-none border-border/60 p-3"
        container={portalContainer}
        onPointerEnter={cancelClose}
        onPointerLeave={closeNow}
        side="top"
        sideOffset={14}
      >
        <citationPreview.Shell tone="warning">
          <div className="space-y-2.5">
            {hallucinations.map((h, i) => (
              <div key={i} className={cn(i > 0 && 'border-t border-border/50 pt-2.5')}>
                <citationPreview.Hallucination
                  hallucination={h}
                  noSourceLabel={t('hallucination.no_source')}
                  riskLabel={t('hallucination.risk_label')}
                  source={citations.find((citation) => citation.chunkId === h.chunkId)}
                  title={t('hallucination.detected')}
                />
              </div>
            ))}
          </div>
          {onOpen && isTouch && pinned ? <citationPreview.OpenInDocument onOpen={onOpen} /> : null}
        </citationPreview.Shell>
      </TooltipContent>
    </Tooltip>
  );
}
