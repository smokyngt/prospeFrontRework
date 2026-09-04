import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Markdown } from '@/components/workspace-ui/shared/markdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/workspace-ui/ui/collapsible';
import { cn } from '@/lib/cn';

import { actionIcons } from './action-icons';
import { ChatClarifyOptions, type ClarifySendMeta } from './clarify-options';
import { STAGE_ICON } from './stage';
import {
  LsTreeView,
  parseToolResponse,
  ReadFileLink,
  ScreenshotLinksView,
  SearchResultsView,
} from './tool-views';

import type { OrchestrationStep } from '@/lib/workspace-sdk-types';
import type { ReactNode } from 'react';

class ToolViewBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const PAGE_REF_RE = /\[p\.(\d+)\]/g;

function safeStr(v: unknown): string {
  if (typeof v === 'string') {
    return v;
  }
  if (v === null || v === undefined) {
    return '';
  }
  return String(v);
}

function renderReasoning(text: string, onPageClick?: (page: number) => void): ReactNode {
  const safe = safeStr(text);
  if (!onPageClick) {
    return safe;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  PAGE_REF_RE.lastIndex = 0;
  while ((match = PAGE_REF_RE.exec(safe)) !== null) {
    if (match.index > lastIndex) {
      parts.push(safe.slice(lastIndex, match.index));
    }
    const pageNum = Number(match[1]);
    parts.push(
      <button
        key={`page-${match.index}`}
        type="button"
        className="mx-0.5 inline-flex items-center rounded-none bg-primary/10 px-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
        onClick={(e) => {
          e.stopPropagation();
          onPageClick(pageNum);
        }}
      >
        p.{pageNum}
      </button>,
    );
    lastIndex = PAGE_REF_RE.lastIndex;
  }

  if (parts.length === 0) {
    return safe;
  }

  if (lastIndex < safe.length) {
    parts.push(safe.slice(lastIndex));
  }
  return <>{parts}</>;
}

const STATUS_TEXT: Record<string, string> = {
  analyzing: 'status.actions.analyzing',
  block: 'status.actions.block',
  clarify: 'status.actions.clarify',
  clarify_response: 'status.actions.clarify_response',
  clarifyResponse: 'status.actions.clarify_response',
  compressing: 'status.actions.compressing',
  generate: 'status.actions.generate',
  generating: 'status.actions.generating',
  ls: 'status.actions.ls',
  read_file: 'status.actions.read_file',
  readFile: 'status.actions.read_file',
  retrieved: 'status.actions.retrieved',
  screenshot: 'status.actions.screenshot',
  search: 'status.actions.search',
  searching: 'status.actions.searching',
  sort: 'status.actions.retrieved',
  steer: 'status.actions.steer',
  tool_call: 'status.actions.tool_call',
  toolCall: 'status.actions.tool_call',
};

type ChatStepTimelineProps = {
  clarifyInputRequired?: boolean[];
  clarifyOptions?: string[];
  currentAction?: string;
  forceExpanded?: boolean;
  isOrchestrating?: boolean;
  isStreaming?: boolean;
  onClarifySend?: (content: string, meta?: ClarifySendMeta) => void;
  onPageClick?: (page: number) => void;
  reasoningQuestion?: string;
  steps: OrchestrationStep[];
  thinkingText?: string;
};

const HIDDEN_ACTIONS = new Set(['compressing']);

function normalizeAction(action: string): string {
  if (action === 'generate') {
    return 'generating';
  }
  if (action === 'search') {
    return 'searching';
  }
  if (action === 'sort') {
    return 'retrieved';
  }
  if (action === 'read') {
    return 'readFile';
  }
  return action;
}

function formatStepMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const start = Date.now();
    const interval = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [active]);
  return seconds;
}

function ElapsedBadge({ seconds }: { seconds: number }) {
  if (seconds <= 0) {
    return null;
  }
  return (
    <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground/70">{seconds}s</span>
  );
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function Chip({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'accent' | 'danger' | 'default' | 'success';
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-none border px-1.5 py-px text-[10px] font-medium leading-4',
        tone === 'default' && 'border-border/60 bg-background/70 text-muted-foreground',
        tone === 'accent' && 'border-primary/20 bg-primary/5 text-primary/90',
        tone === 'success' && 'border-primary/20 bg-primary/5 text-primary/90',
        tone === 'danger' && 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-300',
      )}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-medium text-muted-foreground/60">{children}</p>;
}

function RetryTraceView({
  params,
  result,
  toolName,
  t,
}: {
  params?: Record<string, unknown>;
  result: Record<string, unknown>;
  toolName?: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const status = safeStr(result.status);
  const failed = status === 'failed' || status === 'error';
  const retryAvailable = result.retryAvailable === true;
  const resultChunks = (result['chunks'] ?? {}) as {
    missing?: string[];
    selected?: string[];
    requested?: string[];
  };
  const paramChunks = (params?.['chunks'] ?? {}) as {
    requested?: string[];
  };
  const missingIds = resultChunks.missing ?? [];
  const selectedIds = resultChunks.selected ?? [];
  const requestedIds = [...(resultChunks.requested ?? []), ...(paramChunks.requested ?? [])];
  const isPlanner = toolName === 'orchestrate';
  const ids = missingIds.length ? missingIds : selectedIds.length ? selectedIds : requestedIds;
  const tone = missingIds.length ? 'danger' : selectedIds.length ? 'success' : 'default';
  const idsLabel = missingIds.length
    ? t('status.retry_trace.missing_ids')
    : selectedIds.length
      ? t('status.retry_trace.selected_ids')
      : t('status.retry_trace.requested_ids');

  return (
    <div className="space-y-1.5 text-[11px] leading-relaxed">
      <div className="flex flex-wrap items-center gap-1.5">
        {failed ? (
          <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
        ) : (
          <Check className="h-3 w-3 shrink-0 text-primary" />
        )}
        <span className="font-medium text-foreground/90">
          {isPlanner
            ? t('status.retry_trace.planner_title')
            : failed
              ? t('status.retry_trace.selection_failed')
              : t('status.retry_trace.selection_accepted')}
        </span>
        {retryAvailable ? (
          <Chip>
            <RefreshCw className="h-2.5 w-2.5" />
            {t('status.retry_trace.retrying')}
          </Chip>
        ) : failed ? (
          <Chip>{t('status.retry_trace.fallback')}</Chip>
        ) : null}
      </div>

      {typeof result.message === 'string' && result.message.trim().length > 0 ? (
        <p className="text-muted-foreground">{result.message}</p>
      ) : null}

      {ids.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-muted-foreground/60">{idsLabel}</span>
          {ids.map((id) => (
            <Chip key={id} tone={tone}>
              <span className="font-mono">#{id}</span>
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ThinkingBursts({
  text,
  isStreaming,
  continuesAfter,
}: {
  text: string;
  isStreaming: boolean;
  continuesAfter: boolean;
}) {
  const bursts = useMemo(
    () =>
      text
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0),
    [text],
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const BrainIcon = STAGE_ICON.reasoning;

  useEffect(() => {
    if (!isStreaming) {
      return;
    }
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [text, isStreaming]);

  if (!bursts.length) {
    return null;
  }

  return (
    <>
      {bursts.map((burst, i) => {
        const isLast = i === bursts.length - 1;
        const isForming = isLast && isStreaming;
        return (
          <div key={i} className="relative">
            {(!isLast || continuesAfter) && (
              <span className="absolute bottom-0 left-[13px] top-5 w-px bg-border/50" aria-hidden />
            )}
            <div className="flex items-start gap-2.5 px-2 py-1">
              <span
                className={cn(
                  'relative z-10 mt-[3px] shrink-0 bg-muted/20 text-primary/50',
                  isForming && 'animate-pulse text-primary',
                )}
              >
                <BrainIcon className="h-3 w-3" />
              </span>
              <div
                ref={isForming ? viewportRef : undefined}
                className={cn(
                  'min-w-0 flex-1 text-[11px] leading-relaxed text-muted-foreground',
                  isForming && 'max-h-32 overflow-y-auto',
                )}
              >
                <Markdown
                  content={burst}
                  className="[&_p]:my-1 [&_p]:text-[11px] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

const MIN_MEASURABLE_THINK_MS = 50;

export function ThoughtToggle({ done, text }: { done: boolean; text?: string }) {
  const { t } = useTranslation('chat');
  const [expanded, setExpanded] = useState(!done);
  const startRef = useRef<null | number>(null);
  const thinkEndRef = useRef<null | number>(null);
  const [elapsedMs, setElapsedMs] = useState<null | number>(null);
  const wasDone = useRef(false);
  const elapsedSeconds = useElapsedSeconds(!done);

  if (startRef.current === null && text) {
    startRef.current = performance.now();
  }

  useEffect(() => {
    if (text) {
      thinkEndRef.current = performance.now();
    }
  }, [text]);

  useEffect(() => {
    if (done && !wasDone.current) {
      wasDone.current = true;
      const end = thinkEndRef.current ?? performance.now();
      const elapsed = startRef.current === null ? 0 : end - startRef.current;
      if (elapsed >= MIN_MEASURABLE_THINK_MS) {
        setElapsedMs(elapsed);
      }
      setExpanded(false);
    }
  }, [done]);

  if (!text?.trim()) {
    return null;
  }

  const label = done
    ? elapsedMs !== null
      ? t('status.summary.done', { duration: formatStepMs(elapsedMs) })
      : t('status.thought')
    : t('status.thinking');

  return (
    <div className="animate-stream-in">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {done ? (
          <Lightbulb className="h-3 w-3 shrink-0" />
        ) : (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
        )}
        <span>{label}</span>
        {!done && <ElapsedBadge seconds={elapsedSeconds} />}
        <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="border-l-2 border-primary/50 bg-primary/5 py-1.5 pl-2.5 pr-2">
          <Markdown
            className="text-xs leading-relaxed text-muted-foreground [&_p]:my-0.5"
            content={text}
          />
        </div>
      )}
    </div>
  );
}

function mergeStepData(
  previous: OrchestrationStep,
  incoming: OrchestrationStep,
): OrchestrationStep {
  return {
    ...previous,
    ...incoming,
    action: previous.action,
    chunks: incoming.chunks ?? incoming.results ?? previous.chunks ?? previous.results,
    candidates: incoming.candidates ?? previous.candidates,
    entities:
      incoming.entities && incoming.entities.length > 0 ? incoming.entities : previous.entities,
    queries: incoming.queries && incoming.queries.length > 0 ? incoming.queries : previous.queries,
    reasoning: incoming.reasoning ?? previous.reasoning,
    thinking:
      previous.thinking && incoming.thinking
        ? `${previous.thinking}${incoming.thinking}`
        : (incoming.thinking ?? previous.thinking),
    toolResponse: incoming.toolResponse ?? previous.toolResponse,
  };
}

function shouldHideStep(step: OrchestrationStep): boolean {
  if (HIDDEN_ACTIONS.has(step.action)) {
    return true;
  }

  if (step.action === 'analyzing') {
    return !(
      step.reasoning ||
      step.thinking ||
      (step.queries?.length ?? 0) > 0 ||
      (step.entities?.length ?? 0) > 0 ||
      (step.chunks ?? 0) > 0 ||
      step.toolResponse
    );
  }

  return false;
}

function collapseSearchPairs(steps: OrchestrationStep[]): OrchestrationStep[] {
  const result: OrchestrationStep[] = [];

  for (const step of steps) {
    const previous = result[result.length - 1];
    const isQuery = previous?.action === 'searching' || previous?.action === 'search';

    if (step.action === 'retrieved' && previous && isQuery) {
      result[result.length - 1] = {
        ...previous,
        chunks: step.chunks ?? previous.chunks,
        duration:
          typeof previous.startedAt === 'number' &&
          typeof step.startedAt === 'number' &&
          typeof step.duration === 'number'
            ? step.startedAt + step.duration - previous.startedAt
            : (step.duration ?? previous.duration),
        results: step.results ?? previous.results,
        toolResponse: step.toolResponse ?? previous.toolResponse,
      };
      continue;
    }

    result.push(step);
  }

  return result;
}

function mergeSteps(steps: OrchestrationStep[]): OrchestrationStep[] {
  const result: OrchestrationStep[] = [];

  for (const step of steps) {
    if (step.action === 'tool_call') {
      if (step.function?.name) {
        const normalizedToolName = normalizeAction(step.function?.name);

        if (normalizedToolName === 'searching') {
          result.push({
            ...step,
            action: 'retrieved',
            toolResponse: step.toolResponse,
          });
          continue;
        }

        let idx = result.length - 1;
        while (idx >= 0 && normalizeAction(result[idx].action) !== normalizedToolName) {
          idx--;
        }

        if (idx >= 0) {
          result[idx] = {
            ...result[idx],
            function: step.function ?? result[idx].function,
            toolResponse: step.toolResponse,
          };
        }
      }
      continue;
    }

    const normalizedStep = {
      ...step,
      action: normalizeAction(step.action),
    };

    const last = result[result.length - 1];

    if (last && normalizeAction(last.action) === normalizedStep.action && !last.toolResponse) {
      result[result.length - 1] = mergeStepData(last, normalizedStep);
      continue;
    }

    result.push(normalizedStep);
  }

  return result;
}

function totalDuration(steps: OrchestrationStep[]): number {
  let total = 0;
  let byEnd = 0;
  for (const step of steps) {
    const duration = typeof step.duration === 'number' ? step.duration : 0;
    total += duration > 0 ? duration : 0;
    if (typeof step.startedAt === 'number') {
      byEnd = Math.max(byEnd, step.startedAt + duration);
    }
  }
  return byEnd || total;
}

export const ChatStepTimeline = React.memo(function ChatStepTimeline({
  clarifyInputRequired,
  clarifyOptions,
  currentAction,
  forceExpanded = false,
  isOrchestrating = false,
  isStreaming = false,
  onClarifySend,
  onPageClick,
  reasoningQuestion,
  steps,
  thinkingText,
}: ChatStepTimelineProps) {
  const { t } = useTranslation('chat');
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const mergedSteps = useMemo(() => collapseSearchPairs(mergeSteps(steps)), [steps]);
  const visibleSteps = useMemo(() => mergedSteps.filter((s) => !shouldHideStep(s)), [mergedSteps]);
  const hasSteps = visibleSteps.length > 0;
  const hasThinking = Boolean(thinkingText?.trim());
  const hasContent = hasSteps || hasThinking;
  const isOpen = hasContent && (forceExpanded || Boolean(expanded));
  const duration = useMemo(() => totalDuration(visibleSteps), [visibleSteps]);
  const activeStep = visibleSteps[visibleSteps.length - 1];
  const liveLabel =
    activeStep?.reasoning ||
    reasoningQuestion ||
    t(STATUS_TEXT[activeStep?.action ?? currentAction ?? ''] ?? 'status.thinking');
  const summaryLabel =
    (hasSteps ? t('status.summary.steps', { count: visibleSteps.length }) : '') +
    (duration > 0 ? ` · ${t('status.summary.done', { duration: formatStepMs(duration) })}` : '');
  const headerLabel = isOrchestrating ? liveLabel : summaryLabel;
  const elapsedSeconds = useElapsedSeconds(isOrchestrating);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="animate-stream-in">
      <button
        type="button"
        onClick={() => setExpanded(!isOpen)}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {isOrchestrating ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
        ) : (
          <Sparkles className="h-3 w-3 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate">{headerLabel}</span>
        {isOrchestrating && <ElapsedBadge seconds={elapsedSeconds} />}

        {hasSteps && !isOpen && !isOrchestrating && (
          <span className="hidden items-center gap-1 sm:flex" aria-hidden>
            {visibleSteps.slice(0, 10).map((step, i) => {
              const Icon = actionIcons[step.action] || Sparkles;
              return (
                <span key={i} className="text-primary/50">
                  <Icon className="h-3 w-3" />
                </span>
              );
            })}
          </span>
        )}

        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform group-hover:text-foreground',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (hasSteps || hasThinking) && (
        <div className="border-l-2 border-border/60 bg-muted/20 py-1.5 pl-2.5 pr-2">
          {hasThinking && (
            <ThinkingBursts
              text={thinkingText!}
              isStreaming={isStreaming}
              continuesAfter={hasSteps}
            />
          )}
          {visibleSteps.map((step, i) => {
            const Icon = actionIcons[step.action] || Sparkles;
            const isLast = i === visibleSteps.length - 1;
            const isRunning = isLast && isStreaming;
            const stepKey = `${i}:${step.action}:${step.function?.name ?? ''}`;
            const response = step.toolResponse as Record<string, unknown> | null | undefined;
            const resultStatus =
              (response?.result as Record<string, unknown> | undefined)?.status ?? response?.status;
            const isFailed =
              !isRunning &&
              (resultStatus === 'empty' || resultStatus === 'failed' || resultStatus === 'error');
            const isSearchResponseStep =
              (normalizeAction(step.function?.name ?? '') === 'searching' &&
                step.action === 'retrieved') ||
              ((step.action === 'searching' || step.action === 'search') &&
                step.toolResponse !== null &&
                step.toolResponse !== undefined);
            const isRetrievedResponseStep =
              step.action === 'retrieved' &&
              step.toolResponse !== null &&
              step.toolResponse !== undefined;
            const rawToolResponse = recordValue(step.toolResponse);
            const retryTraceResult = recordValue(rawToolResponse?.result) ?? rawToolResponse;
            const hasRetryTraceView = Boolean(
              retryTraceResult &&
              (step.function?.name === 'generate' || step.function?.name === 'orchestrate') &&
              typeof retryTraceResult.status === 'string',
            );
            const hasToolView =
              step.toolResponse !== null &&
              step.toolResponse !== undefined &&
              (hasRetryTraceView ||
                ['ls', 'read_file', 'readFile', 'screenshot'].includes(step.action) ||
                isRetrievedResponseStep ||
                isSearchResponseStep);
            const chunkCount = step.chunks ?? step.results ?? 0;
            const hasMeta =
              (step.queries?.length ?? 0) > 0 || (step.entities?.length ?? 0) > 0 || chunkCount > 0;
            const hasDetails = Boolean(hasMeta || hasToolView || safeStr(step.thinking).trim());
            const rowOpen = hasDetails && (openSteps[stepKey] ?? false);
            const title = t(STATUS_TEXT[step.action ?? ''] ?? 'status.thinking');
            const subtitle = step.reasoning
              ? renderReasoning(safeStr(step.reasoning), onPageClick)
              : null;

            return (
              <Collapsible
                key={stepKey}
                open={rowOpen}
                onOpenChange={(open) => setOpenSteps((prev) => ({ ...prev, [stepKey]: open }))}
              >
                <div className="relative">
                  {!isLast && (
                    <span
                      className="absolute bottom-0 left-[13px] top-5 w-px bg-border/50"
                      aria-hidden
                    />
                  )}

                  <CollapsibleTrigger asChild disabled={!hasDetails}>
                    <button
                      type="button"
                      className={cn(
                        'group/row flex w-full items-start gap-2.5 px-2 py-1 text-left',
                        hasDetails
                          ? 'cursor-pointer transition-colors hover:bg-muted/60'
                          : 'cursor-default',
                      )}
                    >
                      <span
                        className={cn(
                          'relative z-10 mt-[3px] shrink-0 bg-muted/20',
                          isFailed ? 'text-destructive' : 'text-primary/70',
                          isRunning && 'animate-pulse text-primary',
                        )}
                      >
                        {isFailed ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'truncate text-xs',
                              isRunning ? 'font-medium text-foreground' : 'text-foreground/80',
                            )}
                          >
                            {title}
                          </span>
                          {chunkCount > 0 && (
                            <span className="shrink-0 font-mono text-[10px] tabular-nums text-primary/70">
                              {chunkCount}
                            </span>
                          )}
                          {step.function?.name && (
                            <span className="hidden truncate font-mono text-[10px] text-muted-foreground/40 sm:inline">
                              {step.function.name}
                            </span>
                          )}
                          <span className="ml-auto flex shrink-0 items-center gap-1.5">
                            {!isRunning &&
                              typeof step.duration === 'number' &&
                              step.duration > 0 && (
                                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/40">
                                  {formatStepMs(step.duration)}
                                </span>
                              )}
                            <span
                              className={cn(
                                'text-muted-foreground/30 transition-colors group-hover/row:text-foreground',
                                !hasDetails && 'invisible',
                              )}
                            >
                              {rowOpen ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </span>
                          </span>
                        </span>
                        {subtitle && (
                          <span
                            className={cn(
                              'mt-0.5 block text-[11px] leading-relaxed text-muted-foreground',
                              !rowOpen && 'line-clamp-1',
                            )}
                          >
                            {subtitle}
                          </span>
                        )}
                      </span>
                    </button>
                  </CollapsibleTrigger>

                  {hasDetails && (
                    <CollapsibleContent>
                      <div className="mb-1 ml-2 mr-2 mt-0.5 space-y-1.5 border-l border-border/40 pl-2.5">
                        {safeStr(step.thinking).trim() && (
                          <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                            {safeStr(step.thinking)}
                          </p>
                        )}

                        {step.queries && step.queries.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <SectionLabel>{t('status.retrieval_queries')}</SectionLabel>
                            {step.queries.map((q, qi) => (
                              <Chip key={`q-${qi}`}>{safeStr(q)}</Chip>
                            ))}
                          </div>
                        )}

                        {step.entities && step.entities.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <SectionLabel>{t('status.entities')}</SectionLabel>
                            {step.entities.map((e, ei) => (
                              <Chip key={`e-${ei}`} tone="accent">
                                {safeStr(e)}
                              </Chip>
                            ))}
                          </div>
                        )}

                        {step.toolResponse !== null &&
                          step.toolResponse !== undefined &&
                          !isRetrievedResponseStep &&
                          !isSearchResponseStep && (
                            <ToolViewBoundary>
                              {hasRetryTraceView && retryTraceResult ? (
                                <RetryTraceView
                                  params={
                                    step.function?.arguments
                                      ? (() => {
                                          try {
                                            return JSON.parse(step.function.arguments) as Record<
                                              string,
                                              unknown
                                            >;
                                          } catch {
                                            return undefined;
                                          }
                                        })()
                                      : undefined
                                  }
                                  result={retryTraceResult}
                                  toolName={step.function?.name}
                                  t={t}
                                />
                              ) : step.action === 'ls' ? (
                                <LsTreeView response={parseToolResponse(step.toolResponse)} />
                              ) : step.action === 'read_file' || step.action === 'readFile' ? (
                                <ReadFileLink response={parseToolResponse(step.toolResponse)} />
                              ) : step.action === 'screenshot' ? (
                                <ScreenshotLinksView
                                  response={parseToolResponse(step.toolResponse)}
                                />
                              ) : null}
                            </ToolViewBoundary>
                          )}

                        {(isRetrievedResponseStep || isSearchResponseStep) && (
                          <ToolViewBoundary>
                            <SearchResultsView
                              response={parseToolResponse(step.toolResponse)}
                              embedded
                            />
                          </ToolViewBoundary>
                        )}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}

      {!!clarifyOptions?.length && onClarifySend && (
        <div className="border-t border-border/50 px-3 py-2">
          <ChatClarifyOptions
            inTimeline
            options={clarifyOptions}
            inputRequired={clarifyInputRequired}
            onSend={onClarifySend}
          />
        </div>
      )}
    </div>
  );
});
