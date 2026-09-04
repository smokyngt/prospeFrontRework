'use client';

import {
  FileText,
  Maximize2,
  PanelLeft,
  PanelRightClose,
  PanelRightOpen,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ACTIONS, type EventData, EVENTS, Joyride, STATUS } from 'react-joyride';

import { Safari } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  applyLandingTheme,
  getCurrentLandingTheme,
  LANDING_THEME_CHANGE_EVENT,
  readStoredLandingTheme,
} from '@/features/landing/lib/theme';
import { usePdfPanelWidth } from '@/hooks/use-pdf-panel-width';
import { cn } from '@/lib/utils';
import { usePdfStore } from '@/stores/pdf';

import { ChatPanel, ThreadSidebar } from './chat';
import { pagePreviewCache } from './chat/citation/page-cache';
import { ChatPdfViewer } from './chat/pdf-viewer';
import { PdfTabStrip } from './chat/pdf/tab-strip';
import { PortalContainerContext } from './chat/portal-context';
import { useStreamingStore } from './chat/streaming-store';
import {
  demoChatConfig,
  demoContent,
  demoFileById,
  demoFiles,
  demoPrimaryFile,
  orchestrationDelays,
  streamingConfig,
} from './demo-config';
import { steps as stepsConfig } from './demo-steps';
import { guidedTourSteps, tourMeta } from './demo-tour';
import { demoUi } from './demo-ui';

import type { PrerenderRequest } from './chat/citation/page-cache';
import type { TourEffect } from './demo-tour';
import type { DemoCitation, DemoHallucination, DemoMessage } from './demo-types';

const PAINT_INTERVAL_MS = 55;

const DEMO_FILE_ID = demoPrimaryFile.fileId;

function EmptyDocumentPanel({ onClose }: { onClose: () => void }) {
  const { i18n } = useTranslation();
  const ui = useMemo(() => demoUi.get(i18n.language), [i18n.language]);

  return (
    <div
      data-demo-tour="pdf"
      className="flex h-full w-full flex-col border-l border-border/40 bg-background"
    >
      <div className="flex shrink-0 items-center justify-end border-b border-border/40 bg-muted/20 px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onClose}
          title={ui.closeDocument}
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 items-center bg-muted/20">
        <Empty
          icon={<FileText className="h-5 w-5" />}
          title={ui.emptyTitle}
          description={ui.emptySubtitle}
          className="w-full"
        />
      </div>
    </div>
  );
}

function DocumentPanel({ onClose }: { onClose: () => void }) {
  const { i18n } = useTranslation();
  const ui = useMemo(() => demoUi.get(i18n.language), [i18n.language]);
  const tabs = usePdfStore((s) => s.tabs);
  const activeTabId = usePdfStore((s) => s.activeTabId);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const file = demoFileById(activeTab?.fileId ?? DEMO_FILE_ID);

  return (
    <div
      data-demo-tour="pdf"
      className="flex h-full w-full flex-col border-l border-border/40 bg-background"
    >
      <div className="flex shrink-0 items-center border-b border-border/40 bg-muted/20">
        {tabs.length > 0 ? (
          <div className="min-w-0 flex-1">
            <PdfTabStrip />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-1 border-l border-border/40 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClose}
            title={ui.closeDocument}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ChatPdfViewer
        key={file.fileId}
        fileUrl={file.url}
        fileName={file.fileName}
        fileId={file.fileId}
        file={{ pages: file.totalPages }}
        initialPage={activeTab?.pageNumber ?? 1}
        onDownload={() => window.open(file.url, '_blank')}
        className="min-h-0 flex-1 w-full rounded-none border-0"
      />
    </div>
  );
}

export function IntelligenceDemo() {
  const { i18n } = useTranslation();
  const ui = useMemo(() => demoUi.get(i18n.language), [i18n.language]);
  const copy = useMemo(() => demoContent.get(i18n.language), [i18n.language]);
  const steps = useMemo(() => stepsConfig.build(copy), [copy]);

  const [activeMarker, setActiveMarker] = useState<{
    citation: DemoCitation;
    evidence?: string;
    kind: 'citation' | 'hallucination';
  }>({ citation: copy.citations[0], kind: 'citation' });
  const activeCitation = activeMarker.citation;
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [threadOpen, setThreadOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const documentPanel = usePdfPanelWidth(workspaceRef);
  const [hasRun, setHasRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [demoDark, setDemoDark] = useState(false);
  const [citationFocusTick, setCitationFocusTick] = useState(0);
  const [documentEmpty, setDocumentEmpty] = useState(false);
  const [tourRun, setTourRun] = useState(false);
  const [tourPending, setTourPending] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourAdvancePending, setTourAdvancePending] = useState<number | null>(null);
  const [forceExpandOrchestration, setForceExpandOrchestration] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const tourSteps = useMemo(() => guidedTourSteps.get(ui, isMobile), [isMobile, ui]);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const timeoutsRef = useRef<number[]>([]);
  const rafRef = useRef<null | number>(null);

  const clearScheduled = useCallback(() => {
    for (const id of timeoutsRef.current) {
      window.clearTimeout(id);
    }
    timeoutsRef.current = [];
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, delay));
  }, []);

  const resetDemo = useCallback(
    (options?: { keepFullscreen?: boolean }) => {
      clearScheduled();
      setActiveMarker({ citation: copy.citations[0], kind: 'citation' });
      setCurrentStepIndex(-1);
      setDocumentOpen(false);
      setDocumentEmpty(false);
      setHasRun(false);
      setIsRunning(false);
      setMessages([]);
      useStreamingStore.getState().setText('');
      useStreamingStore.getState().setThinking('');
      setThreadOpen(true);
      setTourRun(false);
      setTourStep(0);
      setForceExpandOrchestration(false);
      usePdfStore.getState().closeAllTabs();
      if (!options?.keepFullscreen) {
        setFullscreen(false);
      }
    },
    [clearScheduled, copy],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const requests: PrerenderRequest[] = copy.citations.map((citation) => ({
      fileId: demoFileById(citation.fileId).fileId,
      highlightText: citation.highlightText ?? citation.quote,
      pageNumber: citation.page,
    }));

    for (const step of steps) {
      if (step.action !== 'screenshot') {
        continue;
      }
      const chunks = (step.toolResponse as { chunks?: { fileId?: string; pageNumber?: number }[] })
        ?.chunks;
      for (const chunk of chunks ?? []) {
        if (chunk.pageNumber !== undefined) {
          requests.push({
            fileId: demoFileById(chunk.fileId).fileId,
            pageNumber: chunk.pageNumber,
          });
        }
      }
    }

    void pagePreviewCache.prerender(requests);
  }, [copy.citations, mounted, steps]);

  useEffect(() => {
    const syncDemoTheme = () => {
      const nextDark = getCurrentLandingTheme() === 'dark';
      setDemoDark((current) => (current === nextDark ? current : nextDark));
    };

    const initialDark = applyLandingTheme(readStoredLandingTheme());
    setDemoDark(initialDark);

    const observer = new MutationObserver(syncDemoTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributes: true,
    });

    window.addEventListener(LANDING_THEME_CHANGE_EVENT, syncDemoTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener(LANDING_THEME_CHANGE_EVENT, syncDemoTheme);
    };
  }, []);

  useEffect(() => {
    resetDemo({ keepFullscreen: true });
    setCitationFocusTick(0);
  }, [i18n.language, resetDemo]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetDemo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen, resetDemo]);

  useEffect(() => {
    if (citationFocusTick === 0) {
      return;
    }
    const citationText = (c: DemoCitation) => c.highlightText ?? c.quote.replace('...', '').trim();
    const citationFile = (c: DemoCitation) => demoFileById(c.fileId);
    const allCitations = copy.citations.map((c) => ({
      fileId: citationFile(c).fileId,
      fileName: citationFile(c).fileName,
      pageNumber: c.page,
      text: citationText(c),
    }));
    const activeFile = citationFile(activeCitation);
    const focusedIndex = copy.citations
      .filter((c) => citationFile(c).fileId === activeFile.fileId)
      .findIndex((c) => c.id === activeCitation.id);
    usePdfStore.getState().openAtCitation(
      {
        fileId: activeFile.fileId,
        fileName: activeFile.fileName,
        kind: activeMarker.kind,
        pageNumber: activeCitation.page,
        text: activeMarker.evidence ?? citationText(activeCitation),
      },
      activeMarker.kind === 'citation' ? allCitations : undefined,
      activeMarker.kind === 'citation' && focusedIndex >= 0 ? focusedIndex : undefined,
    );
  }, [activeCitation, activeMarker, citationFocusTick, copy.citations]);

  const runDemo = useCallback(() => {
    if (isRunning || hasRun) {
      return;
    }

    setHasRun(true);
    setIsRunning(true);
    setMessages([{ role: 'user', text: copy.question }]);
    useStreamingStore.getState().setText('');
    useStreamingStore.getState().setThinking('');
    setCurrentStepIndex(-1);

    const plainAnswer = copy.finalAnswer.replace(/\[([^\]]*)\]\((?:cite|halluc):\d+\)/g, '$1');

    let elapsed = 0;
    steps.forEach((_, index) => {
      elapsed += orchestrationDelays[index] ?? 720;
      schedule(() => {
        setCurrentStepIndex(index);
      }, elapsed);
    });

    const words = plainAnswer.split(' ');
    const totalStepTime = elapsed;
    const lastStepDwell = orchestrationDelays[steps.length - 1] ?? 720;

    const thinkingText = steps[steps.length - 1]?.thinking ?? '';
    const thinkingDuration = 700;

    if (thinkingText) {
      schedule(() => {
        const startTime = performance.now();
        const stepThinking = (now: number) => {
          const progress = Math.min(1, (now - startTime) / thinkingDuration);
          const revealed = Math.floor(thinkingText.length * progress);
          useStreamingStore.getState().setThinking(thinkingText.slice(0, revealed));
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(stepThinking);
          }
        };
        rafRef.current = requestAnimationFrame(stepThinking);
      }, totalStepTime);
    }

    schedule(() => {
      const streamDuration = Math.max(
        streamingConfig.minDurationMs,
        totalStepTime * streamingConfig.durationRatio,
      );
      const basePause = Math.max(
        streamingConfig.minWordPauseMs,
        Math.floor(streamDuration / words.length),
      );
      const fullText = words.join(' ');
      const charsPerMs = fullText.length / streamDuration;
      let elapsed = 0;
      let lastNow: null | number = null;
      let holdUntil = 0;
      let revealed = 0;
      let lastPaint = 0;

      const finish = () => {
        setIsRunning(false);
        setCurrentStepIndex(steps.length - 1);
        setMessages([
          { role: 'user', text: copy.question },
          { role: 'assistant', text: copy.finalAnswer },
        ]);
        useStreamingStore.getState().setText('');
        useStreamingStore.getState().setThinking('');
        const pdf = usePdfStore.getState();
        pdf.closeAllTabs();
        const firstTabId = pdf.openTab({
          fileId: demoFiles[0].fileId,
          fileName: demoFiles[0].fileName,
          totalPages: demoFiles[0].totalPages,
        });
        for (const file of demoFiles.slice(1)) {
          usePdfStore.getState().openTab({
            fileId: file.fileId,
            fileName: file.fileName,
            totalPages: file.totalPages,
          });
        }
        usePdfStore.getState().setActiveTab(firstTabId);

        schedule(() => {
          setMessages((prev) =>
            prev.map((message, index) =>
              index === prev.length - 1
                ? { ...message, citations: copy.citations, hallucinations: copy.hallucinations }
                : message,
            ),
          );
        }, 400);
      };

      const tick = (now: number) => {
        if (lastNow === null) {
          lastNow = now;
        }

        const delta = now - lastNow;

        lastNow = now;

        if (now >= holdUntil) {
          elapsed += delta;
        }

        const target = Math.min(fullText.length, Math.floor(elapsed * charsPerMs));

        if (target > revealed) {
          const justRevealed = fullText.slice(revealed, target);

          revealed = target;

          if (now - lastPaint >= PAINT_INTERVAL_MS || revealed >= fullText.length) {
            lastPaint = now;
            useStreamingStore.getState().setText(fullText.slice(0, revealed));
          }

          if (/[.:;]\s*$/.test(justRevealed)) {
            holdUntil = now + basePause;
          }
        }

        if (revealed >= fullText.length) {
          finish();
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }, totalStepTime + lastStepDwell);
  }, [
    copy.citations,
    copy.finalAnswer,
    copy.hallucinations,
    copy.question,
    hasRun,
    isRunning,
    schedule,
    steps,
  ]);

  const stopDemo = useCallback(() => {
    clearScheduled();
    setIsRunning(false);
    const partialText = useStreamingStore.getState().text;
    if (partialText) {
      setMessages((prev) => [
        ...prev,
        { citations: [], hallucinations: [], role: 'assistant', text: partialText },
      ]);
    }
    useStreamingStore.getState().setText('');
    useStreamingStore.getState().setThinking('');
  }, [clearScheduled]);

  const hasAssistantAnswer = messages.some((message) => message.role === 'assistant');

  const pdfTabCount = usePdfStore((state) => state.tabs.length);
  const lastPdfTabCount = useRef(pdfTabCount);

  const closeDocumentWorkspace = useCallback(() => {
    setDocumentOpen(false);
    setDocumentEmpty(false);
  }, []);

  useEffect(() => {
    const had = lastPdfTabCount.current;
    lastPdfTabCount.current = pdfTabCount;
    if (had > 0 && pdfTabCount === 0) {
      closeDocumentWorkspace();
    }
  }, [closeDocumentWorkspace, pdfTabCount]);

  const openDocumentWorkspace = useCallback(() => {
    setDocumentOpen(true);
    setDocumentEmpty(!hasAssistantAnswer);
  }, [hasAssistantAnswer]);

  const handleRunDemo = useCallback(() => {
    setThreadOpen(false);
    closeDocumentWorkspace();
    runDemo();
  }, [closeDocumentWorkspace, runDemo]);

  const handleRunDemoRef = useRef(handleRunDemo);
  handleRunDemoRef.current = handleRunDemo;

  const handleCitationSelect = useCallback((citation: DemoCitation) => {
    setActiveMarker({ citation, kind: 'citation' });
    setDocumentOpen(true);
    setDocumentEmpty(false);
    setCitationFocusTick((tick) => tick + 1);
  }, []);

  const handleHallucinationSelect = useCallback(
    (hallucination: DemoHallucination) => {
      const counterCitation = copy.citations.find(
        (citation) => citation.id === hallucination.counterCitationId,
      );

      if (!counterCitation) {
        return;
      }
      setActiveMarker({
        citation: counterCitation,
        ...(hallucination.evidence ? { evidence: hallucination.evidence } : {}),
        kind: 'hallucination',
      });
      setDocumentOpen(true);
      setDocumentEmpty(false);
      setCitationFocusTick((tick) => tick + 1);
    },
    [copy.citations],
  );

  const closeThreadSidebar = useCallback(() => {
    setThreadOpen(false);
    closeDocumentWorkspace();
  }, [closeDocumentWorkspace]);

  const selectMobilePanel = useCallback(
    (panel: 'threads' | 'chat' | 'document') => {
      if (panel === 'threads') {
        setThreadOpen(true);
        setDocumentOpen(false);
        return;
      }

      setThreadOpen(false);

      if (panel === 'document') {
        openDocumentWorkspace();
        return;
      }

      setDocumentOpen(false);
    },
    [openDocumentWorkspace],
  );

  const runEnterEffect = useCallback(
    (effect: TourEffect | undefined, index: number) => {
      if (!effect) {
        setTourStep(index);
        return false;
      }
      if (effect === 'openCitation') {
        setDocumentOpen(true);
        setDocumentEmpty(false);
        setActiveMarker({ citation: copy.citations[1] ?? copy.citations[0], kind: 'citation' });
        setCitationFocusTick((tick) => tick + 1);
        window.setTimeout(() => setTourStep(index), 160);
        return true;
      }
      if (effect === 'expandReasoning') {
        setForceExpandOrchestration(true);
        setTourStep(index);
        return false;
      }
      setTourStep(index);
      return false;
    },
    [copy.citations],
  );

  useEffect(() => {
    if (!tourPending || !isRunning) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setTourPending(false);
      runEnterEffect(tourMeta[0]?.onEnter, 0);
      setTourRun(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [isRunning, runEnterEffect, tourPending]);

  const handleTour = useCallback(
    (data: EventData) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setTourRun(false);
        return;
      }

      if (type !== EVENTS.STEP_AFTER && type !== EVENTS.TARGET_NOT_FOUND) {
        return;
      }

      const goingBack = action === ACTIONS.PREV;
      const next = goingBack ? Math.max(0, index - 1) : index + 1;

      if (!goingBack && tourMeta[index]?.onLeave === 'awaitAnswer' && isRunning) {
        setTourAdvancePending(next);
        return;
      }

      runEnterEffect(tourMeta[next]?.onEnter, next);
    },
    [isRunning, runEnterEffect],
  );

  useEffect(() => {
    if (tourAdvancePending === null || isRunning) {
      return;
    }
    const next = tourAdvancePending;
    setTourAdvancePending(null);
    runEnterEffect(tourMeta[next]?.onEnter, next);
  }, [isRunning, runEnterEffect, tourAdvancePending]);

  const openInteractiveDemo = () => {
    resetDemo({ keepFullscreen: true });
    setFullscreen(true);
    setThreadOpen(false);
    setTourPending(true);
    window.setTimeout(() => handleRunDemoRef.current(), 260);
  };

  const closeInteractiveDemo = () => {
    resetDemo();
    setTourRun(false);
    setFullscreen(false);
  };

  const showThreadPanel = fullscreen && threadOpen && (!isMobile || !hasRun);
  const showDocumentPanel = fullscreen && documentOpen;
  const showChatPanel = !fullscreen || !isMobile || (!showThreadPanel && !showDocumentPanel);

  const fullscreenControls = fullscreen ? (
    <div
      className={cn('client-ui relative z-[10001] flex items-center gap-1.5', demoDark && 'dark')}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-full bg-background/95 shadow-sm backdrop-blur"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          closeInteractiveDemo();
        }}
        aria-label={ui.closeReview}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  ) : null;

  const portalAnchor = (
    <div
      ref={setPortalContainer}
      className={cn('client-ui pointer-events-none fixed inset-0 z-[10050]', demoDark && 'dark')}
    />
  );

  const demoShell = (
    <div
      className={cn(
        'client-ui relative overflow-hidden border border-border/60 bg-background transition-all duration-500 ease-out',
        fullscreen
          ? 'h-full w-full rounded-none'
          : 'mx-auto w-full max-w-7xl rounded-[8px] shadow-2xl',
        demoDark && 'dark',
      )}
    >
      <PortalContainerContext.Provider value={portalContainer}>
        <Safari
          url="prosperify.ai/chat"
          headerActions={fullscreenControls}
          onClose={closeInteractiveDemo}
          showUrl={!fullscreen}
          className={cn(
            'w-full',
            fullscreen
              ? 'h-full rounded-none border-0'
              : 'max-sm:h-[520px] h-[min(620px,calc(100dvh-13rem))]',
          )}
        >
          <TooltipProvider delayDuration={0}>
            <div className="relative flex h-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
              {fullscreen && isMobile ? (
                <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-50 rounded-full border border-border/60 bg-background/95 p-1 shadow-xl backdrop-blur">
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      {
                        active: showThreadPanel,
                        icon: PanelLeft,
                        label: ui.mobileThreads,
                        panel: 'threads' as const,
                      },
                      {
                        active: showChatPanel,
                        icon: Search,
                        label: ui.mobileChat,
                        panel: 'chat' as const,
                      },
                      {
                        active: showDocumentPanel,
                        icon: FileText,
                        label: ui.mobileDocument,
                        panel: 'document' as const,
                      },
                    ].map(({ active, icon: Icon, label, panel }) => (
                      <button
                        key={panel}
                        type="button"
                        className={cn(
                          'flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        onClick={() => selectMobilePanel(panel)}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isMobile ? (
                <div
                  data-demo-tour="chat-ui"
                  className="h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden"
                >
                  {showThreadPanel ? (
                    <ThreadSidebar
                      active={copy.threads[0]}
                      archivedCount={demoChatConfig.archivedThreadCount}
                      storeName={copy.storeName}
                      isStreaming={isRunning}
                      onClose={closeThreadSidebar}
                      onRunDemo={handleRunDemo}
                      threads={copy.threads}
                    />
                  ) : showDocumentPanel ? (
                    documentEmpty ? (
                      <EmptyDocumentPanel onClose={closeDocumentWorkspace} />
                    ) : (
                      <DocumentPanel onClose={closeDocumentWorkspace} />
                    )
                  ) : (
                    <div className="flex h-full min-h-0 flex-col">
                      <header className="flex shrink-0 items-center gap-2 border-b border-border/50 bg-muted/20 px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setThreadOpen(true)}
                          title={ui.openSidebar}
                        >
                          <PanelLeft className="h-4 w-4" />
                        </Button>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {copy.threads[0]}
                        </p>
                      </header>
                      <div className="min-h-0 flex-1">
                        <ChatPanel
                          activeCitation={activeCitation}
                          storeLabels={copy.storeLabels}
                          currentStepIndex={currentStepIndex}
                          forceExpandOrchestration={forceExpandOrchestration}
                          hasRun={hasRun}
                          isRunning={isRunning}
                          messages={messages}
                          mobileNavInset={fullscreen}
                          onCitationSelect={handleCitationSelect}
                          onHallucinationSelect={handleHallucinationSelect}
                          onRunDemo={handleRunDemo}
                          onStopDemo={stopDemo}
                          question={copy.question}
                          steps={steps}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  ref={workspaceRef}
                  data-demo-tour="chat-ui"
                  className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden"
                >
                  {showThreadPanel ? (
                    <div className="h-full w-72 shrink-0 overflow-hidden border-r border-border/50">
                      <ThreadSidebar
                        active={copy.threads[0]}
                        archivedCount={demoChatConfig.archivedThreadCount}
                        storeName={copy.storeName}
                        isStreaming={isRunning}
                        onClose={closeThreadSidebar}
                        onRunDemo={handleRunDemo}
                        threads={copy.threads}
                      />
                    </div>
                  ) : null}

                  <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
                      <header className="flex shrink-0 items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-2">
                        {!showThreadPanel ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => setThreadOpen(true)}
                            title={ui.openSidebar}
                          >
                            <PanelLeft className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {copy.threads[0]}
                        </p>
                        {!showDocumentPanel ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={openDocumentWorkspace}
                            title={ui.openDocument}
                          >
                            <PanelRightOpen className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </header>
                      <div className="min-h-0 flex-1">
                        <ChatPanel
                          activeCitation={activeCitation}
                          storeLabels={copy.storeLabels}
                          currentStepIndex={currentStepIndex}
                          forceExpandOrchestration={forceExpandOrchestration}
                          hasRun={hasRun}
                          isRunning={isRunning}
                          messages={messages}
                          onCitationSelect={handleCitationSelect}
                          onHallucinationSelect={handleHallucinationSelect}
                          onRunDemo={handleRunDemo}
                          onStopDemo={stopDemo}
                          question={copy.question}
                          steps={steps}
                        />
                      </div>
                    </div>
                  </div>

                  {showDocumentPanel ? (
                    <div
                      className="relative flex h-full min-h-0 shrink-0"
                      style={{ width: documentPanel.width }}
                    >
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        onMouseDown={documentPanel.startDrag}
                        className="group -ml-1.5 flex w-3 shrink-0 cursor-col-resize items-center justify-center"
                      >
                        <div className="h-10 w-1 rounded-full bg-border/60 transition-colors group-hover:bg-primary/50" />
                      </div>
                      <div className="min-h-0 min-w-0 flex-1">
                        {documentEmpty ? (
                          <EmptyDocumentPanel onClose={closeDocumentWorkspace} />
                        ) : (
                          <DocumentPanel onClose={closeDocumentWorkspace} />
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </TooltipProvider>
        </Safari>
        {!fullscreen ? (
          <button
            type="button"
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/45 opacity-100 backdrop-blur-[1px] transition-all duration-300 focus-visible:outline-none sm:bg-background/5 sm:opacity-0 sm:hover:bg-background/45 sm:hover:opacity-100 sm:focus-visible:bg-background/45 sm:focus-visible:opacity-100"
            onClick={openInteractiveDemo}
            aria-label={ui.openReview}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-xl">
              <Maximize2 className="h-4 w-4 text-primary" />
              {ui.openReview}
            </span>
          </button>
        ) : null}
      </PortalContainerContext.Provider>
    </div>
  );

  return (
    <>
      {fullscreen ? (
        <Joyride
          continuous
          locale={{
            back: ui.tourBack,
            close: ui.closeReview,
            last: ui.tourDone,
            next: ui.tourNext,
            skip: ui.tourSkip,
          }}
          onEvent={handleTour}
          options={{
            arrowColor: demoDark ? 'hsl(240 10% 3.9%)' : '#fff',
            backgroundColor: demoDark ? 'hsl(240 10% 3.9%)' : '#fff',
            blockTargetInteraction: false,
            buttons: ['back', 'skip', 'primary'],
            closeButtonAction: 'skip',
            disableFocusTrap: true,
            hideOverlay: true,
            overlayClickAction: false,
            overlayColor: 'rgba(0, 0, 0, 0)',
            primaryColor: '#f97316',
            scrollDuration: 0,
            scrollOffset: 20,
            showProgress: true,
            skipScroll: true,
            spotlightPadding: 6,
            textColor: demoDark ? 'hsl(0 0% 98%)' : 'hsl(240 10% 3.9%)',
            zIndex: 20000,
          }}
          run={tourRun}
          stepIndex={tourStep}
          steps={tourSteps}
          styles={{
            floater: {
              filter: 'drop-shadow(0 18px 40px rgba(15, 23, 42, 0.18))',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0)',
            },
            spotlight: {
              fill: 'rgba(0, 0, 0, 0)',
              stroke: 'rgba(249, 115, 22, 0.45)',
              strokeWidth: 2,
            },
            tooltip: {
              borderRadius: 0,
              maxWidth: isMobile ? 'calc(100vw - 32px)' : 360,
              width: isMobile ? 'calc(100vw - 32px)' : undefined,
            },
            buttonPrimary: { borderRadius: 0 },
            buttonBack: { borderRadius: 0 },
            buttonSkip: { borderRadius: 0 },
            buttonClose: { borderRadius: 0 },
          }}
        />
      ) : null}
      {fullscreen && mounted ? (
        createPortal(
          <div className="fixed inset-0 z-[100] flex h-full w-full overflow-hidden bg-background">
            {demoShell}
            {portalAnchor}
          </div>,
          document.body,
        )
      ) : (
        <>
          {demoShell}
          {portalAnchor}
        </>
      )}
    </>
  );
}
