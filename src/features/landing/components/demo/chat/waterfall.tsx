import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { format } from '@/lib/format';

import { usePortalContainer } from './portal-context';
import { STAGE_BAR_CLASS, STAGE_ICON, stageFor } from './stage';

import type { OrchestrationStep } from '@prosperify/sdk';

type WaterfallStep = OrchestrationStep & {
  duration: number;
  startedAt: number;
};

const TICK_COUNT = 4;
const ROW_GRID = 'grid grid-cols-[1.5rem_7rem_1fr_2.75rem] items-center gap-2';

type ChatWaterfallProps = {
  expanded?: boolean;
  isStreaming?: boolean;
  steps: OrchestrationStep[];
};

export function ChatWaterfall({
  expanded: expandedProp,
  isStreaming = false,
  steps,
}: ChatWaterfallProps) {
  const { t } = useTranslation('chat');
  const portalContainer = usePortalContainer();
  const [selfExpanded, setSelfExpanded] = useState(false);
  const expanded = expandedProp ?? selfExpanded;

  const timedSteps = useMemo(() => {
    const timed = steps.filter(
      (step): step is WaterfallStep =>
        typeof step.duration === 'number' &&
        step.duration >= 0 &&
        typeof step.startedAt === 'number' &&
        step.startedAt >= 0,
    );
    const collapsed: WaterfallStep[] = [];
    for (const step of timed) {
      const previous = collapsed[collapsed.length - 1];
      const isRetrieval = step.action === 'retrieved';
      const followsQuery = previous?.action === 'searching' || previous?.action === 'search';
      if (isRetrieval && previous && followsQuery) {
        collapsed[collapsed.length - 1] = {
          ...previous,
          duration: step.startedAt + step.duration - previous.startedAt,
        };
        continue;
      }
      collapsed.push(step);
    }
    return collapsed;
  }, [steps]);

  const totalMs = useMemo(() => {
    if (!timedSteps.length) {
      return 0;
    }
    return Math.max(...timedSteps.map((s) => s.startedAt + s.duration));
  }, [timedSteps]);

  const ticks = useMemo(() => {
    if (totalMs <= 0) {
      return [];
    }
    return Array.from({ length: TICK_COUNT + 1 }, (_, i) => (totalMs / TICK_COUNT) * i);
  }, [totalMs]);

  if (!timedSteps.length || totalMs <= 0) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        type="button"
        className="group flex items-center gap-1.5 text-left"
        onClick={() => setSelfExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        )}
        <span className="text-[10px] text-muted-foreground/70 transition-colors group-hover:text-foreground">
          {t('waterfall.title')}
        </span>
        {isStreaming && <span className="h-1 w-1 animate-pulse bg-primary" aria-hidden />}
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/50">
          {format.duration(totalMs)} · {timedSteps.length}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 border-l border-border/50 pl-2.5">
          <div className={cn(ROW_GRID, 'pb-1.5')}>
            <span />
            <span />
            <div className="relative h-3 min-w-0 text-[9px] text-muted-foreground/50">
              {ticks.map((tick, i) => (
                <span
                  key={i}
                  className="absolute -translate-x-1/2 font-mono tabular-nums first:translate-x-0 last:-translate-x-full"
                  style={{ left: `${(i / TICK_COUNT) * 100}%` }}
                >
                  {format.duration(tick)}
                </span>
              ))}
            </div>
            <span />
          </div>

          <div className="space-y-1">
            {timedSteps.map((step, i) => {
              const stage = stageFor(step.action);
              const Icon = STAGE_ICON[stage];
              const leftPct = (step.startedAt / totalMs) * 100;
              const widthPct = Math.max((step.duration / totalMs) * 100, 1.5);
              const endedAt = step.startedAt + step.duration;
              const label = step.function?.name ?? stage;

              return (
                <Tooltip key={`${i}:${step.action}:${step.startedAt}`}>
                  <TooltipTrigger asChild>
                    <div
                      tabIndex={0}
                      className={cn(
                        ROW_GRID,
                        'cursor-help py-0.5 outline-none focus-visible:bg-muted/50',
                      )}
                    >
                      <span className="font-mono text-[9px] tabular-nums text-muted-foreground/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Icon className="h-2.5 w-2.5 shrink-0 text-primary/70" />
                        <span className="truncate font-mono text-[10px] text-foreground/75">
                          {label}
                        </span>
                      </span>
                      <div className="relative h-1.5 min-w-0 bg-muted">
                        <div
                          className={cn('absolute inset-y-0 min-w-[2px]', STAGE_BAR_CLASS[stage])}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        />
                      </div>
                      <span className="shrink-0 text-right font-mono text-[9px] tabular-nums text-muted-foreground/50">
                        {format.duration(step.duration)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    container={portalContainer}
                    className="rounded-none font-mono text-[10px]"
                  >
                    {format.duration(step.startedAt)} → {format.duration(endedAt)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
