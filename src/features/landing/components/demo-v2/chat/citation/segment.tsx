import { createContext, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/workspace-ui/ui/tooltip';
import { useIsTouch } from '@/hooks/use-is-touch';
import { cn } from '@/lib/cn';

import { usePortalContainer } from '../portal-context';

import { citationPreview } from './preview';

import type { Citation, Hallucination } from '@/lib/workspace-sdk-types';
import type { ReactNode } from 'react';

type CitationSegmentProps = {
  children: ReactNode;
  citation?: Citation;
  hallucination?: Hallucination;
  onOpen?: () => void;
  refNumber?: number;
};

const PinContext = createContext<{
  pinned: null | number;
  setPinned: (key: null | number) => void;
}>({ pinned: null, setPinned: () => undefined });

function SegmentsRoot({ children }: { children: ReactNode }) {
  const [pinned, setPinned] = useState<null | number>(null);
  const value = useMemo(() => ({ pinned, setPinned }), [pinned]);

  useEffect(() => {
    if (pinned === null) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}

const CitationSegment = memo(function CitationSegment({
  children,
  citation,
  hallucination,
  onOpen,
  refNumber,
}: CitationSegmentProps) {
  const portalContainer = usePortalContainer();
  const labels = citationPreview.useLabels();
  const isTouch = useIsTouch();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const { pinned, setPinned } = useContext(PinContext);
  const isPinned = pinned === segmentKey(citation, hallucination);
  const isDimmed = pinned !== null && !isPinned;
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setTooltipOpen(false), 0);
  };

  const closeNow = () => {
    cancelClose();
    setTooltipOpen(false);
  };

  useEffect(() => cancelClose, []);

  const isOpenable = Boolean(citation?.fileId && citation?.fileName) && Boolean(onOpen);
  const open = isOpenable || hallucination?.chunkId ? onOpen : undefined;
  const key = segmentKey(citation, hallucination);
  const activate = () => {
    cancelClose();
    setPinned(isPinned ? null : key);
    setTooltipOpen(!isPinned);
  };

  return (
    <Tooltip
      open={tooltipOpen || isPinned}
      onOpenChange={(next) => {
        setTooltipOpen(next);
        if (!next) {
          setPinned(null);
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
      <span
        className={cn(
          'underline underline-offset-4 transition-colors',
          hallucination
            ? 'decoration-wavy decoration-warning/60 hover:decoration-warning'
            : 'decoration-solid decoration-primary/40 hover:decoration-primary/70',
          isDimmed && 'decoration-transparent',
          isPinned && (hallucination ? 'decoration-warning' : 'decoration-primary'),
          'cursor-pointer',
        )}
        role="button"
        tabIndex={0}
        onPointerMove={(event) => setAnchor({ x: event.clientX, y: event.clientY })}
        onPointerEnter={(event) => {
          setAnchor({ x: event.clientX, y: event.clientY });
          if (event.pointerType !== 'touch') {
            cancelClose();
            setTooltipOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch' && !isPinned) {
            scheduleClose();
          }
        }}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }
          event.preventDefault();
          activate();
        }}
      >
        {children}
        {citation && refNumber ? (
          <sup className="ml-0.5 rounded-sm bg-primary/10 px-1 font-mono text-[11px] font-semibold text-primary">
            {refNumber}
          </sup>
        ) : null}
      </span>
      <TooltipContent
        className="rounded-none border-border/60 p-3"
        container={portalContainer}
        onPointerEnter={cancelClose}
        onPointerLeave={closeNow}
        side="top"
        sideOffset={14}
      >
        <citationPreview.Shell tone={hallucination ? 'warning' : 'primary'}>
          <div className="space-y-2.5">
            {hallucination ? (
              <citationPreview.Hallucination
                hallucination={hallucination}
                noSourceLabel={labels.noSource}
                riskLabel={labels.riskLabel}
                source={citation}
                title={labels.potentialInaccuracy}
              />
            ) : null}
            {citation ? (
              <div className={cn(hallucination && 'border-t border-border/50 pt-2.5')}>
                <citationPreview.Citation
                  citation={citation}
                  page={labels.page}
                  relevanceLabel={labels.relevanceLabel}
                />
              </div>
            ) : null}
          </div>
          {open && isPinned && isTouch ? <citationPreview.OpenInDocument onOpen={open} /> : null}
        </citationPreview.Shell>
      </TooltipContent>
    </Tooltip>
  );
});

function segmentKey(citation?: Citation, hallucination?: Hallucination): number {
  return hallucination?.start ?? citation?.start ?? 0;
}

export { CitationSegment, SegmentsRoot };
