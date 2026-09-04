import { create } from 'zustand';

import { pdfViewer } from '@/config/constants';
export type PdfTab = {
  id: string;
  fileId: string;
  fileName: string;
  pageNumber: number;
  totalPages: number;
  zoom: number;
  rotation: number;
  highlightBboxes: BboxHighlight[];
  scrollPosition: number;
};
export type BboxHighlight = {
  id: string;
  bboxes: number[][];
  pageNumber: number;
  type: 'citation' | 'entity' | 'hallucination' | 'search';
  color?: string;
  label?: string;
  chunkId?: string;
  text?: string;
};
type PdfState = {
  isOpen: boolean;
  tabs: PdfTab[];
  activeTabId: string | null;
  focusedHighlightId: string | null;
  focusedHighlightTick: number;
  getActiveTab: () => PdfTab | null;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openTab: (params: OpenTabParams) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setPage: (tabId: string, pageNumber: number) => void;
  setZoom: (tabId: string, zoom: number) => void;
  zoomIn: (tabId: string) => void;
  zoomOut: (tabId: string) => void;
  setRotation: (tabId: string, rotation: number) => void;
  rotateClockwise: (tabId: string) => void;
  setTotalPages: (tabId: string, totalPages: number) => void;
  setScrollPosition: (tabId: string, position: number) => void;
  addHighlight: (tabId: string, highlight: BboxHighlight) => void;
  removeHighlight: (tabId: string, highlightId: string) => void;
  clearHighlights: (tabId: string) => void;
  setHighlights: (tabId: string, highlights: BboxHighlight[]) => void;
  setFocusedHighlight: (highlightId: string | null) => void;
  openAtCitation: (
    params: CitationParams,
    allCitations?: CitationParams[],
    focusedIndex?: number,
  ) => void;
};
type OpenTabParams = {
  fileId: string;
  fileName: string;
  pageNumber?: number;
  totalPages?: number;
  highlightBboxes?: BboxHighlight[];
  forceNewTab?: boolean;
};
type CitationParams = {
  fileId: string;
  fileName: string;
  pageNumber: number;
  bboxes?: number[][];
  chunkId?: string;
  kind?: 'citation' | 'hallucination';
  label?: string;
  text?: string;
  forceNewTab?: boolean;
};
let tabIdCounter = 0;
const createTab = (params: {
  fileId: string;
  fileName: string;
  pageNumber?: number;
  totalPages?: number;
  highlightBboxes?: BboxHighlight[];
}): PdfTab => ({
  id: `pdf-tab-${++tabIdCounter}`,
  fileId: params.fileId,
  fileName: params.fileName,
  pageNumber: params.pageNumber ?? 1,
  totalPages: params.totalPages ?? 1,
  zoom: pdfViewer.defaultZoom,
  rotation: 0,
  highlightBboxes: params.highlightBboxes ?? [],
  scrollPosition: 0,
});
export const usePdfStore = create<PdfState>((set, get) => {
  const tabUpdate = (tabId: string, updates: Partial<PdfTab>) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
    }));
  };
  const tabGet = (tabId: string) => get().tabs.find((t) => t.id === tabId);

  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  const scrollDebouncedUpdate = (tabId: string, scrollPosition: number) => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
      tabUpdate(tabId, { scrollPosition });
      scrollTimer = null;
    }, 150);
  };

  return {
    isOpen: false,
    tabs: [],
    activeTabId: null,
    focusedHighlightId: null,
    focusedHighlightTick: 0,
    getActiveTab: () => {
      const { tabs, activeTabId } = get();
      return tabs.find((t) => t.id === activeTabId) ?? null;
    },
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
    toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
    openTab: ({
      fileId,
      fileName,
      pageNumber = 1,
      totalPages = 1,
      highlightBboxes = [],
      forceNewTab = false,
    }) => {
      const { tabs } = get();
      const existing = tabs.find((t) => t.fileId === fileId);
      if (existing && !forceNewTab) {
        tabUpdate(existing.id, { pageNumber, highlightBboxes });
        set({ activeTabId: existing.id, isOpen: true });
        return existing.id;
      }
      const newTab = createTab({
        fileId,
        fileName,
        pageNumber,
        totalPages,
        highlightBboxes,
      });
      set((s) => ({
        tabs: [...s.tabs, newTab],
        activeTabId: newTab.id,
        isOpen: true,
      }));
      return newTab.id;
    },
    closeTab: (tabId) => {
      set((state) => {
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        let newActiveId = state.activeTabId;
        if (state.activeTabId === tabId) {
          const idx = state.tabs.findIndex((t) => t.id === tabId);
          newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null;
        }
        return {
          tabs: newTabs,
          activeTabId: newActiveId,
          isOpen: newTabs.length > 0 ? state.isOpen : false,
        };
      });
    },
    setActiveTab: (tabId) => set({ activeTabId: tabId }),
    closeAllTabs: () => set({ tabs: [], activeTabId: null, isOpen: false }),
    setPage: (tabId, pageNumber) => tabUpdate(tabId, { pageNumber }),
    setZoom: (tabId, zoom) => {
      const clamped = Math.max(pdfViewer.minZoom, Math.min(pdfViewer.maxZoom, zoom));
      tabUpdate(tabId, { zoom: clamped });
    },
    zoomIn: (tabId) => {
      const tab = tabGet(tabId);
      if (tab) {
        get().setZoom(tabId, tab.zoom + pdfViewer.zoomStep);
      }
    },
    zoomOut: (tabId) => {
      const tab = tabGet(tabId);
      if (tab) {
        get().setZoom(tabId, tab.zoom - pdfViewer.zoomStep);
      }
    },
    setRotation: (tabId, rotation) => {
      tabUpdate(tabId, { rotation: rotation % 360 });
    },
    rotateClockwise: (tabId) => {
      const tab = tabGet(tabId);
      if (tab) {
        get().setRotation(tabId, (tab.rotation + 90) % 360);
      }
    },
    setTotalPages: (tabId, totalPages) => tabUpdate(tabId, { totalPages }),
    setScrollPosition: (tabId, scrollPosition) => scrollDebouncedUpdate(tabId, scrollPosition),
    addHighlight: (tabId, highlight) => {
      const tab = tabGet(tabId);
      if (tab) {
        tabUpdate(tabId, {
          highlightBboxes: [...tab.highlightBboxes, highlight],
        });
      }
    },
    removeHighlight: (tabId, highlightId) => {
      const tab = tabGet(tabId);
      if (tab) {
        tabUpdate(tabId, {
          highlightBboxes: tab.highlightBboxes.filter((h) => h.id !== highlightId),
        });
      }
    },
    clearHighlights: (tabId) => tabUpdate(tabId, { highlightBboxes: [] }),
    setHighlights: (tabId, highlightBboxes) => tabUpdate(tabId, { highlightBboxes }),
    setFocusedHighlight: (focusedHighlightId) =>
      set((state) => ({
        focusedHighlightId,
        focusedHighlightTick: state.focusedHighlightTick + 1,
      })),
    openAtCitation: (
      {
        fileId,
        fileName,
        pageNumber,
        bboxes,
        chunkId,
        kind = 'citation',
        label,
        text,
        forceNewTab = false,
      },
      allCitations,
      focusedIndex,
    ) => {
      const toHighlight = (p: CitationParams, idx?: number): BboxHighlight => {
        const kind = p.kind ?? 'citation';
        const base = p.chunkId ?? `${p.fileId}-${p.pageNumber}`;
        const id = idx !== undefined ? `${kind}-${base}-${idx}` : `${kind}-${base}`;
        return {
          id,
          bboxes: Array.isArray(p.bboxes)
            ? p.bboxes.filter((item): item is number[] => Array.isArray(item) && item.length === 4)
            : [],
          pageNumber: p.pageNumber,
          type: kind,
          chunkId: p.chunkId,
          ...(p.label ? { label: p.label } : {}),
          ...(p.text ? { text: p.text } : {}),
        };
      };

      const clickedBase = chunkId ?? `${fileId}-${pageNumber}`;
      const fileCitations = allCitations
        ? allCitations.filter((c) => c.fileId === fileId)
        : undefined;

      const sameBboxes = (a?: number[][], b?: number[][]) => {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
          return false;
        }
        return a.every(
          (box, i) =>
            Array.isArray(box) &&
            Array.isArray(b[i]) &&
            box.length === 4 &&
            b[i].length === 4 &&
            box.every((v, j) => v === b[i][j]),
        );
      };

      const clickedIdx =
        typeof focusedIndex === 'number'
          ? focusedIndex
          : fileCitations
            ? fileCitations.findIndex((c) => {
                if (c.pageNumber !== pageNumber) {
                  return false;
                }
                if (chunkId && c.chunkId && c.chunkId === chunkId) {
                  return true;
                }
                if (text && c.text && c.text === text) {
                  return true;
                }
                return sameBboxes(c.bboxes, bboxes);
              })
            : -1;
      const focusedHighlightId =
        clickedIdx >= 0 ? `${kind}-${clickedBase}-${clickedIdx}` : `${kind}-${clickedBase}`;
      const newHighlight = toHighlight(
        { fileId, fileName, pageNumber, bboxes, chunkId, kind, label, text },
        clickedIdx >= 0 ? clickedIdx : undefined,
      );

      const siblingHighlights = fileCitations
        ? fileCitations.map((c, i) => toHighlight(c, i))
        : [newHighlight];

      const { tabs } = get();
      const existing = !forceNewTab ? tabs.find((t) => t.fileId === fileId) : undefined;

      if (existing) {
        const kept = existing.highlightBboxes.filter(
          (h) => h.type !== 'citation' && h.type !== 'hallucination',
        );
        const merged = [...kept, ...siblingHighlights];
        tabUpdate(existing.id, { pageNumber, highlightBboxes: merged });
        set({ activeTabId: existing.id, isOpen: true });
      } else {
        get().openTab({
          fileId,
          fileName,
          pageNumber,
          highlightBboxes: siblingHighlights,
          forceNewTab,
        });
      }

      set((state) => ({
        focusedHighlightId,
        focusedHighlightTick: state.focusedHighlightTick + 1,
      }));
    },
  };
});
