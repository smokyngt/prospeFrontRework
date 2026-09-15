import {
  Archive,
  ChevronDown,
  ChevronRight,
  Copy as CopyIcon,
  Database,
  PanelLeftClose,
  Pencil,
  Plus,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Markdown, content as markdownContent } from '@/components/workspace-ui/shared/markdown';
import { Button } from '@/components/workspace-ui/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/workspace-ui/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/workspace-ui/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/workspace-ui/ui/tooltip';
import { cn } from '@/lib/utils';

import type { DemoChatConfig } from '../demo-config';
import { demoUi } from '../demo-ui';

import { adaptDemoMessageForRealUi, resolveDemoCitation, toOrchestrationStep } from './adapters';
import { ChatCitationList } from './citation/list';
import { CitationSegment, SegmentsRoot } from './citation/segment';
import { ChatInput } from './input';
import { HallucinationSummary } from './message/hallucination-summary';
import { usePortalContainer } from './portal-context';
import { ChatStepTimeline, ThoughtToggle } from './step-timeline';
import { useStreamingStore } from './streaming-store';
import { ChatWaterfall } from './waterfall';

import type { DemoCitation, DemoHallucination, DemoMessage, DemoStep } from '../demo-types';
import type { CitationWithPdfHints } from './citation/utils';
import type { MarkerKind } from '@/components/workspace-ui/shared/markdown-markers';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-3 w-3 animate-spin rounded-full border border-[#F47331]/30 border-t-[#F47331]',
        className,
      )}
    />
  );
}

export function ThreadSidebar({
  active,
  archivedCount,
  storeName,
  isStreaming,
  onClose,
  onRunDemo,
  threads,
}: {
  active: string;
  archivedCount: number;
  storeName: string;
  isStreaming: boolean;
  onClose?: () => void;
  onRunDemo: () => void;
  threads: string[];
}) {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { i18n, t } = useTranslation('chat');
  const ui = useMemo(() => demoUi.get(i18n.language), [i18n.language]);
  const portalContainer = usePortalContainer();

  const handleToggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  return (
    <div
      data-demo-tour="threads"
      className="flex h-full w-full min-w-0 flex-col overflow-hidden border-r border-border/40 bg-background"
    >
      <div className="p-2.5">
        <div className="mb-2 flex items-center justify-end">
          {onClose ? (
            <Button
              data-demo-tour="thread-close"
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              title={ui.closeSidebar}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <Button
          onClick={onRunDemo}
          className="h-9 w-full min-w-0 justify-start gap-2 px-3 shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="truncate">{ui.newChat}</span>
        </Button>
      </div>

      <div className="px-2.5 pb-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'archived')}>
          <TabsList className="h-9 w-full min-w-0 border-0 bg-muted/50">
            <TabsTrigger value="active" className="min-w-0 flex-1 text-xs font-medium px-2">
              {ui.active}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              disabled
              className="min-w-0 flex-1 text-xs font-medium px-2"
            >
              <Archive className="mr-1 h-3 w-3 shrink-0" />
              <span className="truncate">{ui.archived}</span>
              <span className="ml-1 shrink-0 text-[10px] opacity-60">{archivedCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="min-w-0 space-y-2 p-2 pt-1">
          <Collapsible
            open={!collapsedGroups.has('today')}
            onOpenChange={() => handleToggleGroup('today')}
            className="space-y-1 min-w-0"
          >
            <CollapsibleTrigger asChild>
              <button className="flex w-full min-w-0 items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground/72 transition-colors hover:text-foreground">
                {collapsedGroups.has('today') ? (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">{ui.today}</span>
                <span className="ml-auto shrink-0 text-[10px] text-foreground/60">
                  {threads.length}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {threads.map((thread) => (
                <div
                  key={thread}
                  className={cn(
                    'group flex min-w-0 items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-muted/80',
                    active === thread && 'bg-muted',
                  )}
                  onClick={onRunDemo}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center border border-border/40 bg-muted/30 text-muted-foreground">
                          <Database className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent container={portalContainer} side="right">
                      {storeName}
                    </TooltipContent>
                  </Tooltip>
                  <div className="min-w-0 w-0 flex-1 overflow-hidden">
                    <p
                      title={thread}
                      className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-foreground"
                    >
                      {thread}
                    </p>
                    <p className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-foreground/68">
                      {storeName} - {ui.justNow}
                    </p>
                    {isStreaming && active === thread ? (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                        <Spinner className="h-3 w-3" />
                        <span className="truncate">{ui.storeStreaming}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title={t('thread.archive.action')}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title={t('thread.delete.action')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

export function ChatHeader() {
  return (
    <header className="h-12 border-b border-border/40 bg-background/90 px-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center">
        <span className="sr-only">Chat</span>
      </div>
    </header>
  );
}

function MessageActions({ ui }: { ui: ReturnType<typeof demoUi.get> }) {
  return (
    <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <CopyIcon className="h-3.5 w-3.5" />
        {ui.copy}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {ui.regenerate}
      </Button>
      <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

const NEEDS_MARKDOWN = /\]\((?:cite|halluc):|[*_`#>[]/m;
const BLOCK_BREAK = new RegExp(String.fromCharCode(10) + '{2,}');

const STREAM_MARKER = (
  kind: MarkerKind,
  ref: number,
  children: React.ReactNode,
): React.ReactNode => (
  <span
    className={
      kind === 'hallucination'
        ? 'underline decoration-warning decoration-wavy underline-offset-4'
        : 'underline decoration-primary/40 underline-offset-4'
    }
  >
    {children}
    {kind === 'citation' ? (
      <sup className="ml-0.5 rounded-sm bg-primary/10 px-1 font-mono text-[11px] font-semibold text-primary">
        {ref}
      </sup>
    ) : null}
  </span>
);

function tailNeedsMarkdown(tail: string): boolean {
  if (/^\s*\|/m.test(tail)) {
    return markdownContent.hasTable(tail);
  }
  return NEEDS_MARKDOWN.test(tail);
}

const StreamedBlock = memo(function StreamedBlock({ text }: { text: string }) {
  return <Markdown content={text} renderMarker={STREAM_MARKER} />;
});

function StreamedAnswer({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const partial = text.replace(/\[([^\]]*)\]\([^)]*$/, '$1').replace(/\[([^\]]*)$/, '$1');
    const parts = partial.split(BLOCK_BREAK);
    return { done: parts.slice(0, -1), tail: parts[parts.length - 1] ?? '' };
  }, [text]);

  return (
    <>
      {blocks.done.map((block, index) => (
        <StreamedBlock key={index} text={block} />
      ))}
      {tailNeedsMarkdown(blocks.tail) ? <StreamedBlock text={blocks.tail} /> : blocks.tail}
    </>
  );
}

function LiveStreamedAnswer({ isStreaming }: { isStreaming: boolean }) {
  const text = useStreamingStore((s) => s.text);
  const deferredText = useDeferredValue(text);
  const thinking = useStreamingStore((s) => s.thinking);
  return (
    <div className="animate-stream-in max-w-[85%] whitespace-pre-wrap px-3 text-sm leading-6">
      <ThoughtToggle done={!isStreaming} text={thinking} />
      <StreamedAnswer text={deferredText} />
      <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-primary align-middle" />
    </div>
  );
}

function AssistantAnswer({
  message,
  onCitationSelect,
  onHallucinationSelect,
}: {
  message: DemoMessage;
  onCitationSelect: (citation: DemoCitation) => void;
  onHallucinationSelect: (hallucination: DemoHallucination) => void;
}) {
  const adapted = useMemo(() => adaptDemoMessageForRealUi(message), [message]);
  type AdaptedCitation = (typeof adapted.citations)[number];

  const openCitation = useCallback(
    (citation: AdaptedCitation) => {
      const demoCitation = resolveDemoCitation(citation, message.citations ?? []);
      if (demoCitation) {
        onCitationSelect(demoCitation);
      }
    },
    [message.citations, onCitationSelect],
  );

  return (
    <SegmentsRoot>
      <Markdown
        content={message.text}
        renderMarker={(kind, ref, children) => {
          if (kind === 'hallucination') {
            const hallucination = adapted.hallucinations[ref - 1];
            const source = message.hallucinations?.[ref - 1];
            if (!hallucination) {
              return <>{children}</>;
            }
            const counterCitation = source?.counterCitationId
              ? adapted.citationsByRef.get(source.counterCitationId)
              : undefined;
            return (
              <CitationSegment
                citation={counterCitation}
                hallucination={hallucination}
                {...(source?.counterCitationId
                  ? { onOpen: () => onHallucinationSelect(source) }
                  : {})}
              >
                {children}
              </CitationSegment>
            );
          }
          const citation = adapted.citationsByRef.get(ref);
          if (!citation) {
            return <>{children}</>;
          }
          return (
            <CitationSegment
              citation={citation}
              onOpen={() => openCitation(citation)}
              refNumber={ref}
            >
              {children}
            </CitationSegment>
          );
        }}
      />
    </SegmentsRoot>
  );
}

export function ChatMessages({
  activeCitation,
  chatConfig,
  delays,
  storeLabels,
  currentStepIndex,
  forceExpandOrchestration,
  hasRun,
  isRunning,
  messages,
  mobileNavInset,
  onCitationSelect,
  onHallucinationSelect,
  onRunDemo,
  onStopDemo,
  question,
  steps,
}: {
  activeCitation: DemoCitation;
  chatConfig: DemoChatConfig;
  delays: number[];
  storeLabels: Record<string, string>;
  currentStepIndex: number;
  forceExpandOrchestration?: boolean;
  hasRun: boolean;
  isRunning: boolean;
  messages: DemoMessage[];
  mobileNavInset?: boolean;
  onCitationSelect: (citation: DemoCitation) => void;
  onHallucinationSelect: (hallucination: DemoHallucination) => void;
  onRunDemo: () => void;
  onStopDemo: () => void;
  question: string;
  steps: DemoStep[];
}) {
  const isAnswering = useStreamingStore((s) => s.text.length > 0);
  const thinking = useStreamingStore((s) => s.thinking);
  const { i18n, t } = useTranslation('chat');
  const ui = useMemo(() => demoUi.get(i18n.language), [i18n.language]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const orchestrationSteps = useMemo(
    () => steps.map((step, index) => toOrchestrationStep(step, index, delays)),
    [delays, steps],
  );

  const liveSteps = useMemo(
    () => orchestrationSteps.slice(0, Math.max(0, currentStepIndex + 1)),
    [orchestrationSteps, currentStepIndex],
  );

  const isOrchestrating = isRunning && currentStepIndex < steps.length - 1;

  const lastUserMessageIndex = useMemo(
    () => messages.map((message) => message.role).lastIndexOf('user'),
    [messages],
  );

  const openCitationFor = useCallback(
    (message: DemoMessage) => (citation: Parameters<typeof resolveDemoCitation>[0]) => {
      const demoCitation = resolveDemoCitation(citation, message.citations ?? []);
      if (demoCitation) {
        onCitationSelect(demoCitation);
      }
    },
    [onCitationSelect],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full w-full overflow-y-auto scrollbar-thin">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 pb-12 sm:px-6">
            {messages.length === 0 ? <div className="h-24" /> : null}

            {messages.map((message, index) =>
              message.role === 'user' ? (
                <article key={`${message.role}-${index}`} className="flex gap-3 justify-end">
                  <div className="flex max-w-[85%] flex-col items-end">
                    <div className="w-full whitespace-pre-wrap rounded-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                      {message.text}
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <CopyIcon className="h-3.5 w-3.5" />
                        {ui.copy}
                      </Button>
                      {index === lastUserMessageIndex && !isRunning ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {ui.regenerate}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {ui.edit}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                    {chatConfig.userInitials}
                  </span>
                </article>
              ) : (
                <article key={`${message.role}-${index}`} className="flex gap-3 justify-start">
                  <div className="flex max-w-[85%] flex-col items-start">
                    <div className="mb-2 w-full space-y-1.5" data-demo-tour="orchestration">
                      <ChatStepTimeline
                        steps={liveSteps}
                        forceExpanded={forceExpandOrchestration}
                      />
                      {liveSteps.length ? <ChatWaterfall steps={liveSteps} /> : null}
                    </div>
                    <div className="w-full whitespace-pre-wrap px-3 text-sm leading-6 text-foreground">
                      <ThoughtToggle done text={steps[steps.length - 1]?.thinking} />
                      <div data-demo-tour="citations" className="mt-2">
                        <AssistantAnswer
                          message={message}
                          onCitationSelect={onCitationSelect}
                          onHallucinationSelect={onHallucinationSelect}
                        />
                      </div>
                      {!message.citations ? (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-primary/60" />
                          {t('status.verifying_sources')}
                        </div>
                      ) : null}
                      {message.citations ? (
                        <ChatCitationList
                          citations={adaptDemoMessageForRealUi(message).citations}
                          onOpen={(citation: CitationWithPdfHints) =>
                            openCitationFor(message)(citation)
                          }
                        />
                      ) : null}
                      {message.hallucinations && message.hallucinations.length > 0 ? (
                        <div className="mt-2">
                          <HallucinationSummary
                            citations={adaptDemoMessageForRealUi(message).citations}
                            hallucinations={message.hallucinations}
                            onOpen={() => {
                              const first = message.citations?.[0];
                              if (first) {
                                onCitationSelect(first);
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      <MessageActions ui={ui} />
                    </div>
                  </div>
                </article>
              ),
            )}
            {isRunning ? (
              <article className="flex gap-3 justify-start" key="streaming">
                <div className="flex max-w-[85%] flex-col items-start">
                  <div className="mb-2 w-full space-y-1.5" data-demo-tour="orchestration">
                    <ChatStepTimeline
                      forceExpanded={forceExpandOrchestration}
                      isOrchestrating={isOrchestrating}
                      isStreaming={isRunning}
                      currentAction={
                        isAnswering
                          ? undefined
                          : orchestrationSteps[Math.max(0, currentStepIndex)]?.action
                      }
                      steps={liveSteps}
                    />
                    {liveSteps.length ? (
                      <ChatWaterfall isStreaming={isRunning} steps={liveSteps} />
                    ) : null}
                  </div>
                  {isAnswering || thinking ? <LiveStreamedAnswer isStreaming={isRunning} /> : null}
                </div>
              </article>
            ) : null}
            <div ref={scrollAnchorRef} className="h-px" />
          </div>
        </div>
      </div>

      <footer
        className={cn(
          'shrink-0 border-t border-border/40 bg-background px-4 pt-4',
          mobileNavInset ? 'pb-16' : 'pb-4',
        )}
      >
        <div className="mx-auto w-full max-w-5xl">
          <ChatInput
            autoFocus={false}
            readOnly
            value={hasRun ? '' : question}
            disabled={hasRun || isRunning}
            onSend={onRunDemo}
            onStop={onStopDemo}
            streaming={isRunning}
            storeLabels={storeLabels}
            stores={chatConfig.stores}
          />
        </div>
      </footer>

      <span className="sr-only">Active citation {activeCitation.id}</span>
    </div>
  );
}

type ChatPanelProps = {
  activeCitation: DemoCitation;
  chatConfig: DemoChatConfig;
  delays: number[];
  storeLabels: Record<string, string>;
  currentStepIndex: number;
  forceExpandOrchestration?: boolean;
  hasRun: boolean;
  isRunning: boolean;
  messages: DemoMessage[];
  mobileNavInset?: boolean;
  onCitationSelect: (citation: DemoCitation) => void;
  onHallucinationSelect: (hallucination: DemoHallucination) => void;
  onRunDemo: () => void;
  onStopDemo: () => void;
  question: string;
  steps: DemoStep[];
};

export function ChatPanel({
  activeCitation,
  chatConfig,
  delays,
  storeLabels,
  currentStepIndex,
  forceExpandOrchestration,
  hasRun,
  isRunning,
  messages,
  mobileNavInset,
  onCitationSelect,
  onHallucinationSelect,
  onRunDemo,
  onStopDemo,
  question,
  steps,
}: ChatPanelProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative flex h-full min-w-0 flex-col">
        <ChatHeader />
        <ChatMessages
          activeCitation={activeCitation}
          chatConfig={chatConfig}
          delays={delays}
          onHallucinationSelect={onHallucinationSelect}
          storeLabels={storeLabels}
          currentStepIndex={currentStepIndex}
          forceExpandOrchestration={forceExpandOrchestration}
          hasRun={hasRun}
          isRunning={isRunning}
          messages={messages}
          mobileNavInset={mobileNavInset}
          onCitationSelect={onCitationSelect}
          onRunDemo={onRunDemo}
          onStopDemo={onStopDemo}
          question={question}
          steps={steps}
        />
      </div>
    </TooltipProvider>
  );
}
