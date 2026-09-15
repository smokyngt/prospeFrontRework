import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { CheckCircle2, ChevronDown, ChevronUp, FileText, MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { Button } from '@/components/workspace-ui/ui/button';
import { Input } from '@/components/workspace-ui/ui/input';
import { Spinner } from '@/components/workspace-ui/ui/spinner';
import { pdfViewer as pdfConfig } from '@/config/constants';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { usePdfControls } from '@/hooks/use-pdf-controls';
import { usePdfShortcuts } from '@/hooks/use-pdf-shortcuts';
import { cn } from '@/lib/utils';
import { type BboxHighlight, usePdfStore } from '@/stores/pdf';

import { PdfToolbar } from './pdf/toolbar';

import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * react-pdf appelle inconditionnellement `console.error` (via le paquet
 * `warning`) quand pdf.js annule un rendu de calque de texte en cours — ce
 * qui arrive normalement dès qu'on change de page/document avant la fin du
 * rendu (ex. clic rapide sur une autre citation). Ce n'est pas une erreur
 * applicative : on filtre uniquement ce message précis, sans toucher au
 * reste de la console.
 */
const CANCELLED_TEXT_LAYER_PATTERN = /AbortException.*TextLayer task cancelled/;

if (typeof window !== 'undefined') {
  const consoleErrorWithFilter = console.error as { __pfFiltersTextLayerAbort?: boolean };

  if (!consoleErrorWithFilter.__pfFiltersTextLayerAbort) {
    const originalConsoleError = console.error.bind(console);
    const patched = (...args: unknown[]) => {
      const [first] = args;
      if (typeof first === 'string' && CANCELLED_TEXT_LAYER_PATTERN.test(first)) {
        return;
      }
      originalConsoleError(...args);
    };
    patched.__pfFiltersTextLayerAbort = true;
    console.error = patched;
  }
}

const NO_HIGHLIGHTS: BboxHighlight[] = [];

type Span = { el: HTMLElement; from: number; to: number };
type Layer = { raw: string; low: string; spans: Span[] };
type Hit = { page: number; from: number; to: number; spans: HTMLElement[] };

export type ChatPdfViewerFile = {
  pages?: number | null;
  metadata?: Record<string, unknown>;
};

type ChatPdfViewerProps = {
  fileUrl: string;
  fileName: string;
  fileId: string;
  file?: ChatPdfViewerFile;
  initialPage?: number;
  highlights?: BboxHighlight[];
  onDownload?: () => void;
  className?: string;
};

type MatchStatus = 'text' | 'bbox' | 'page' | null;

function validBbox(bbox?: number[]): bbox is [number, number, number, number] {
  if (!Array.isArray(bbox) || bbox.length < 4) {
    return false;
  }
  const [x1, y1, x2, y2] = bbox;
  return [x1, y1, x2, y2].every(Number.isFinite) && x2 > x1 && y2 > y1;
}

function isPageSizedBbox(
  bbox: [number, number, number, number],
  refW: number,
  refH: number,
): boolean {
  const [x1, y1, x2, y2] = bbox;
  const boxArea = (x2 - x1) * (y2 - y1);
  const pageArea = refW * refH;
  return pageArea > 0 && boxArea / pageArea >= 0.9;
}

function validBboxes(bboxes?: number[][]): [number, number, number, number][] {
  if (!Array.isArray(bboxes)) {
    return [];
  }

  return bboxes.filter(validBbox);
}

function primaryBbox(highlight: BboxHighlight): null | [number, number, number, number] {
  const boxes = validBboxes(highlight.bboxes);

  if (boxes.length > 0) {
    return boxes[0];
  }
  return null;
}

const NORM_CHAR_RE = /[‐-―−‘-‛“-‟]/g;
const NORM_CHAR_MAP: Record<string, string> = {
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '–': '-',
  '—': '-',
  '―': '-',
  '−': '-',
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '‟': '"',
};
function normChars(s: string) {
  return s.replace(NORM_CHAR_RE, (c) => NORM_CHAR_MAP[c] ?? c);
}

function fuzzyMatch(hay: string, needle: string): { end: number; start: number } | null {
  const THRESHOLD = 0.55;

  const hayC = normChars(hay);
  const needleC = normChars(needle);

  const mapped: number[] = [];
  let norm = '';
  let wasSpace = true;
  for (let i = 0; i < hayC.length; i++) {
    if (/\s/.test(hayC[i])) {
      if (!wasSpace && norm.length) {
        norm += ' ';
        mapped.push(i);
      }
      wasSpace = true;
    } else {
      norm += hayC[i];
      mapped.push(i);
      wasSpace = false;
    }
  }
  if (norm.endsWith(' ')) {
    norm = norm.slice(0, -1);
    mapped.pop();
  }

  const nNeedle = needleC.replace(/\s+/g, ' ').trim();
  if (!nNeedle || !norm) {
    return null;
  }

  const ei = norm.indexOf(nNeedle);
  if (ei !== -1) {
    const last = Math.min(ei + nNeedle.length - 1, mapped.length - 1);
    return { end: mapped[last] + 1, start: mapped[ei] };
  }

  if (nNeedle.length < 4) {
    return null;
  }

  const nTris = new Set<string>();
  for (let i = 0; i <= nNeedle.length - 3; i++) {
    nTris.add(nNeedle.substring(i, i + 3));
  }
  if (!nTris.size) {
    return null;
  }

  const sizes = new Set([
    Math.floor(nNeedle.length * 0.75),
    nNeedle.length,
    Math.ceil(nNeedle.length * 1.25),
  ]);

  let best = 0;
  let bestI = -1;
  let bestW = 0;

  for (const rawW of sizes) {
    const w = Math.min(rawW, norm.length);
    if (w < 4) {
      continue;
    }

    const freq = new Map<string, number>();
    for (let j = 0; j <= w - 3; j++) {
      const t = norm.substring(j, j + 3);
      freq.set(t, (freq.get(t) || 0) + 1);
    }
    let hits = 0;
    for (const t of nTris) {
      if (freq.has(t)) {
        hits++;
      }
    }

    let score = hits / nTris.size;
    if (score > best) {
      best = score;
      bestI = 0;
      bestW = w;
    }

    for (let i = 1; i <= norm.length - w; i++) {
      const out = norm.substring(i - 1, i + 2);
      const oc = freq.get(out)!;
      if (oc === 1) {
        freq.delete(out);
        if (nTris.has(out)) {
          hits--;
        }
      } else {
        freq.set(out, oc - 1);
      }

      const inc = norm.substring(i + w - 3, i + w);
      const ic = freq.get(inc) || 0;
      if (ic === 0 && nTris.has(inc)) {
        hits++;
      }
      freq.set(inc, ic + 1);

      score = hits / nTris.size;
      if (score > best) {
        best = score;
        bestI = i;
        bestW = w;
      }
    }
  }

  if (best < THRESHOLD || bestI === -1) {
    return null;
  }

  const last = Math.min(bestI + bestW - 1, mapped.length - 1);
  return { end: mapped[last] + 1, start: mapped[bestI] };
}

function readLayer(root: HTMLElement): Layer | null {
  const container = root.querySelector('.react-pdf__Page__textContent');
  if (!container) {
    return null;
  }
  const els = Array.from(container.querySelectorAll('span:not(.marked_content)')) as HTMLElement[];
  if (!els.length) {
    return null;
  }
  let raw = '';
  const spans: Span[] = [];
  for (const el of els) {
    const t = el.textContent ?? '';
    if (raw.length > 0 && t.length > 0 && !/\s$/.test(raw) && !/^\s/.test(t)) {
      raw += ' ';
    }
    spans.push({ el, from: raw.length, to: raw.length + t.length });
    raw += t;
  }
  return raw.trim() ? { raw, low: raw.toLowerCase(), spans } : null;
}

const MARK_ATTR = 'data-pdf-mark';

function paint(el: HTMLElement, bg: string): void {
  el.style.backgroundColor = bg;
  el.style.borderRadius = '2px';
  el.style.mixBlendMode = 'multiply';
}

/**
 * Paints the matched character range only. Spans that overlap the range
 * partially are split so a half-matched word is not boxed whole.
 */
function styleSpans(
  spans: Span[],
  oFrom: number,
  oTo: number,
  bg: string,
  out: HTMLElement[],
): HTMLElement | null {
  let first: HTMLElement | null = null;

  for (const { el, from, to } of spans) {
    if (from >= oTo || to <= oFrom) {
      continue;
    }

    const node = el.firstChild;
    const localFrom = Math.max(0, oFrom - from);
    const localTo = Math.min(to - from, oTo - from);
    const covers = localFrom <= 0 && localTo >= to - from;

    if (covers || !node || node.nodeType !== Node.TEXT_NODE) {
      paint(el, bg);
      out.push(el);
      first = first ?? el;
      continue;
    }

    const range = document.createRange();
    range.setStart(node, localFrom);
    range.setEnd(node, Math.min(localTo, node.textContent?.length ?? localTo));

    const mark = document.createElement('span');
    mark.setAttribute(MARK_ATTR, '');
    range.surroundContents(mark);
    paint(mark, bg);
    out.push(mark);
    first = first ?? mark;
  }

  return first;
}

function clearSpans(marks: HTMLElement[]): void {
  for (const el of marks) {
    if (el.hasAttribute(MARK_ATTR)) {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
        parent.normalize();
      }
      continue;
    }
    el.style.removeProperty('background-color');
    el.style.removeProperty('border-radius');
    el.style.removeProperty('box-shadow');
    el.style.removeProperty('mix-blend-mode');
  }
}

const bbox = {
  isPageSized: isPageSizedBbox,
  primary: primaryBbox,
  valid: validBbox,
  validAll: validBboxes,
};

const textMatch = {
  clearSpans,
  fuzzy: fuzzyMatch,
  normalize: normChars,
  readLayer,
  styleSpans,
};

export function ChatPdfViewer({
  fileUrl,
  fileName,
  fileId,
  file,
  initialPage = 1,
  highlights = NO_HIGHLIGHTS,
  onDownload,
  className,
}: ChatPdfViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const retries = useRef<ReturnType<typeof setTimeout>[]>([]);
  const syncKey = useRef<string | null>(null);
  const locked = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const markedRef = useRef<HTMLElement[]>([]);
  const hlRef = useRef<HTMLElement[]>([]);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const autoFitZoomRef = useRef<Map<string, number>>(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pw, setPw] = useState(0);
  const [ph, setPh] = useState(0);
  const pwRef = useRef(pw);
  const phRef = useRef(ph);

  pwRef.current = pw;
  phRef.current = ph;
  const [vh, setVh] = useState(0);
  const [cw, setCw] = useState(0);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findHits, setFindHits] = useState<Hit[]>([]);
  const [findIdx, setFindIdx] = useState(0);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(null);

  const tabs = usePdfStore((s) => s.tabs);
  const activeTabId = usePdfStore((s) => s.activeTabId);
  const focusId = usePdfStore((s) => s.focusedHighlightId);
  const focusTick = usePdfStore((s) => s.focusedHighlightTick);
  const setFocusedHighlight = usePdfStore((s) => s.setFocusedHighlight);

  const tab = tabs.find((t) => t.id === activeTabId) ?? tabs.find((t) => t.fileId === fileId);

  const merged = useMemo(() => {
    const m = new Map<string, BboxHighlight>();
    for (const h of [...(tab?.highlightBboxes ?? []), ...highlights]) {
      m.set(h.id, h);
    }
    return [...m.values()];
  }, [tab?.highlightBboxes, highlights]);
  const markerEntries = useMemo(() => {
    const entries: {
      highlightId: string;
      pageNumber: number;
      bboxes: [number, number, number, number][];
    }[] = [];
    const sorted = merged
      .filter((h) => h.type === 'citation' || h.type === 'hallucination')
      .sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) {
          return a.pageNumber - b.pageNumber;
        }
        const ab = bbox.primary(a);
        const bb = bbox.primary(b);
        return (ab?.[1] ?? 0) - (bb?.[1] ?? 0);
      });
    for (const h of sorted) {
      entries.push({
        highlightId: h.id,
        pageNumber: h.pageNumber,
        bboxes: bbox.validAll(h.bboxes),
      });
    }
    return entries;
  }, [merged]);
  const hallucinationCount = useMemo(
    () => merged.filter((h) => h.type === 'hallucination').length,
    [merged],
  );

  const [focusedMarkerIdx, setFocusedMarkerIdx] = useState(0);

  const effectiveMarkerIdx = useMemo(() => {
    if (!markerEntries.length) {
      return 0;
    }
    if (markerEntries[focusedMarkerIdx]?.highlightId === focusId) {
      return focusedMarkerIdx;
    }
    const idx = markerEntries.findIndex((e) => e.highlightId === focusId);
    return idx >= 0 ? idx : 0;
  }, [markerEntries, focusId, focusedMarkerIdx]);

  const {
    pageNumber,
    numPages,
    zoom,
    rotation,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    onZoomIn,
    onZoomOut,
    onZoomChange,
    onRotate,
    canZoomIn,
    canZoomOut,
    onDocumentLoad,
  } = usePdfControls(fileId);

  const { active: fs, toggle: toggleFs } = useFullscreen(rootRef);

  usePdfShortcuts({
    onPreviousPage: goToPreviousPage,
    onNextPage: goToNextPage,
    onZoomIn,
    onZoomOut,
  });

  const clearRetries = useCallback(() => {
    for (const t of retries.current) {
      clearTimeout(t);
    }
    retries.current = [];
  }, []);

  const scrollPage = useCallback((pg: number, behavior: ScrollBehavior = 'smooth') => {
    const el = pageMap.current.get(pg);
    if (el) {
      el.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  const stableScroll = useCallback(
    (fn: (b: ScrollBehavior) => void) => {
      clearRetries();
      locked.current = true;
      fn('smooth');
      for (const ms of [120, 300]) {
        retries.current.push(setTimeout(() => fn('auto'), ms));
      }
      retries.current.push(
        setTimeout(() => {
          locked.current = false;
        }, 500),
      );
    },
    [clearRetries],
  );

  const scrollCenter = useCallback((el: HTMLElement, behavior: ScrollBehavior = 'smooth') => {
    const c = scrollRef.current;
    if (!c) {
      el.scrollIntoView({ behavior, block: 'center' });
      return;
    }
    const cr = c.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    c.scrollTo({
      top: Math.max(0, c.scrollTop + er.top - cr.top - c.clientHeight / 2 + er.height / 2),
      behavior,
    });
  }, []);

  const scrollBbox = useCallback(
    (pg: number, bbox: number[], behavior: ScrollBehavior = 'smooth') => {
      const c = scrollRef.current;
      const el = pageMap.current.get(pg);
      if (!c || !el || bbox.length < 2) {
        scrollPage(pg, behavior);
        return;
      }
      const pageW = pw || 1;
      const pageH = ph || 1;
      const RENDER_SCALE = 1.25;
      const IMG_MAX_W = 1600;
      const IMG_MAX_H = 2200;
      const estW = pageW * RENDER_SCALE;
      let estH = pageH * RENDER_SCALE;
      if (estW > IMG_MAX_W || estH > IMG_MAX_H) {
        const cap = Math.min(IMG_MAX_W / estW, IMG_MAX_H / estH);
        estH *= cap;
      }
      const fraction = bbox[1] / estH;
      const renderedY = fraction * pageH * zoom;
      c.scrollTo({
        top: Math.max(0, el.offsetTop + renderedY - 96),
        behavior,
      });
    },
    [scrollPage, zoom, pw, ph],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'f') {
        return;
      }
      e.preventDefault();
      setFindOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!numPages || initialPage < 1 || initialPage > numPages) {
      return;
    }
    const key = `${fileId}:${numPages}`;
    if (syncKey.current === key) {
      return;
    }
    syncKey.current = key;
    goToPage(initialPage);
    stableScroll((b) => scrollPage(initialPage, b));
  }, [fileId, goToPage, initialPage, numPages, stableScroll, scrollPage]);

  useEffect(() => {
    textMatch.clearSpans(hlRef.current);
    hlRef.current = [];
    if (!focusId) {
      return;
    }

    const target = merged.find((h) => h.id === focusId);
    if (!target) {
      return;
    }

    const bg =
      target.type === 'entity'
        ? 'rgba(147,197,253,0.45)'
        : target.type === 'hallucination'
          ? 'rgba(252,165,165,0.50)'
          : 'rgba(253,224,71,0.50)';

    const attempt = (): boolean | 'retry' => {
      const text = target.text?.trim() ?? '';
      const needle = text.toLowerCase().trim();

      if (needle) {
        const order = [target.pageNumber, target.pageNumber - 1, target.pageNumber + 1];
        for (let d = 2; d <= Math.max(5, numPages); d++) {
          order.push(target.pageNumber - d, target.pageNumber + d);
        }
        const candidates = order.filter((p, i, a) => p >= 1 && p <= numPages && a.indexOf(p) === i);

        for (const pg of candidates) {
          const pageEl = pageMap.current.get(pg);
          if (!pageEl) {
            continue;
          }
          const layer = textMatch.readLayer(pageEl);
          if (!layer) {
            continue;
          }
          const fm = textMatch.fuzzy(layer.low, needle);
          if (!fm) {
            continue;
          }

          const i = fm.start;
          const effectiveLen = Math.min(fm.end - fm.start, layer.low.length - i);
          const first = textMatch.styleSpans(layer.spans, i, i + effectiveLen, bg, hlRef.current);

          if (first) {
            stableScroll((b) => scrollCenter(first, b));
            setMatchStatus('text');
            return true;
          }
        }

        const ready = pageMap.current.get(target.pageNumber);
        if (!ready?.querySelector('.react-pdf__Page__textContent span')) {
          return 'retry';
        }
      }

      const RENDER_SCALE = 1.25;
      const IMG_MAX_W = 1600;
      const IMG_MAX_H = 2200;
      let estRefW = (pwRef.current || 612) * RENDER_SCALE;
      let estRefH = (phRef.current || 792) * RENDER_SCALE;
      if (estRefW > IMG_MAX_W || estRefH > IMG_MAX_H) {
        const cap = Math.min(IMG_MAX_W / estRefW, IMG_MAX_H / estRefH);
        estRefW *= cap;
        estRefH *= cap;
      }

      const boxes = bbox
        .validAll(target.bboxes)
        .filter((b) => !bbox.isPageSized(b, estRefW, estRefH));
      const box = boxes.length > 0 ? boxes[0] : null;
      if (box) {
        stableScroll((b) => scrollBbox(target.pageNumber, box, b));
        setMatchStatus('bbox');
        return true;
      }

      stableScroll((b) => scrollPage(target.pageNumber, b));
      setMatchStatus('page');
      return true;
    };

    setMatchStatus(null);
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = () => {
      n++;
      const result = attempt();
      if (result === true || n >= 15) {
        if (n >= 15 && result !== true) {
          const hasBbox = bbox
            .validAll(target.bboxes)
            .some(
              (b) =>
                !bbox.isPageSized(b, (pwRef.current || 612) * 1.25, (phRef.current || 792) * 1.25),
            );
          setMatchStatus(hasBbox ? 'bbox' : 'page');
        }
        return;
      }
      timer = setTimeout(poll, 150);
    };
    timer = setTimeout(poll, 60);
    return () => clearTimeout(timer);
  }, [focusId, focusTick, merged, numPages, stableScroll, scrollCenter, scrollBbox, scrollPage]);

  useEffect(() => {
    for (const el of markedRef.current) {
      el.style.removeProperty('background-color');
      el.style.removeProperty('border-radius');
      el.style.removeProperty('mix-blend-mode');
      el.style.removeProperty('outline');
    }
    markedRef.current = [];
    setFindHits([]);
    setFindIdx(0);

    if (!findOpen || !findQuery.trim() || !numPages) {
      return;
    }

    const needle = findQuery.trim().toLowerCase();
    const styled = new Set<HTMLElement>();

    const run = (): boolean => {
      const all: Hit[] = [];
      let ready = 0;

      for (let p = 1; p <= numPages; p++) {
        const el = pageMap.current.get(p);
        if (!el) {
          continue;
        }
        const layer = textMatch.readLayer(el);
        if (!layer) {
          continue;
        }
        ready++;
        const hay = layer.raw.toLowerCase();
        let cursor = 0;
        while (true) {
          const i = hay.indexOf(needle, cursor);
          if (i === -1) {
            break;
          }
          const end = i + needle.length;
          const matched: HTMLElement[] = [];
          for (const s of layer.spans) {
            if (s.from < end && s.to > i) {
              if (!styled.has(s.el)) {
                s.el.style.backgroundColor = 'rgba(134,239,172,0.35)';
                s.el.style.borderRadius = '1px';
                s.el.style.mixBlendMode = 'multiply';
                styled.add(s.el);
                markedRef.current.push(s.el);
              }
              matched.push(s.el);
            }
          }
          if (matched.length) {
            all.push({ page: p, from: i, to: end, spans: matched });
          }
          cursor = i + 1;
        }
      }

      setFindHits(all);
      if (all.length) {
        setFindIdx(0);
        for (const s of all[0].spans) {
          s.style.outline = '1px solid rgba(34,197,94,0.50)';
        }
        if (all[0].spans[0]) {
          stableScroll((b) => scrollCenter(all[0].spans[0], b));
        }
      }
      return all.length > 0 || ready >= numPages;
    };

    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = () => {
      n++;
      if (run() || n >= 8) {
        return;
      }
      timer = setTimeout(poll, 250);
    };
    timer = setTimeout(poll, 150);
    return () => clearTimeout(timer);
  }, [findOpen, findQuery, numPages, stableScroll, scrollCenter]);

  const handleJumpHit = useCallback(
    (dir: 1 | -1) => {
      if (!findHits.length) {
        return;
      }
      const prev = findHits[findIdx];
      if (prev) {
        for (const s of prev.spans) {
          s.style.removeProperty('outline');
        }
      }
      const next = (findIdx + dir + findHits.length) % findHits.length;
      setFindIdx(next);
      const hit = findHits[next];
      if (hit) {
        for (const s of hit.spans) {
          s.style.outline = '1px solid rgba(34,197,94,0.50)';
        }
        if (hit.spans[0]) {
          scrollCenter(hit.spans[0], 'smooth');
        }
      }
    },
    [findHits, findIdx, scrollCenter],
  );

  const handleJumpMarker = useCallback(
    (direction: 1 | -1) => {
      if (!markerEntries.length) {
        return;
      }
      const nextIdx =
        (effectiveMarkerIdx + direction + markerEntries.length) % markerEntries.length;
      const next = markerEntries[nextIdx];
      setFocusedMarkerIdx(nextIdx);
      setFocusedHighlight(next.highlightId);
      if (next.pageNumber !== pageNumber) {
        goToPage(next.pageNumber);
      }
    },
    [effectiveMarkerIdx, markerEntries, setFocusedHighlight, pageNumber, goToPage],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !numPages) {
      return;
    }
    let raf: number;
    const observer = new IntersectionObserver(
      (entries) => {
        if (locked.current) {
          return;
        }
        let best = pageNumber;
        let ratio = 0;
        for (const e of entries) {
          if (e.intersectionRatio > ratio) {
            ratio = e.intersectionRatio;
            const p = Number((e.target as HTMLElement).dataset.page);
            if (!Number.isNaN(p)) {
              best = p;
            }
          }
        }
        if (best !== pageNumber) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => goToPage(best));
        }
      },
      { root: el, threshold: [0, 0.25, 0.5, 0.75] },
    );
    for (const [, div] of pageMap.current) {
      observer.observe(div);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [numPages, pageNumber, goToPage]);

  const handleLoad = useCallback(
    (doc: PDFDocumentProxy) => {
      pdfDocRef.current = doc;
      setIsLoading(false);
      onDocumentLoad(doc.numPages);
    },
    [onDocumentLoad],
  );

  const handleError = useCallback((e: Error) => {
    setError(e.message);
    setIsLoading(false);
  }, []);

  const handlePageLoad = useCallback((p: { width: number; height: number }) => {
    setPw((v) => v || p.width);
    setPh((v) => v || p.height);
  }, []);

  useEffect(() => clearRetries, [clearRetries]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    let cwTimer: ReturnType<typeof setTimeout>;
    const update = () => {
      setVh(el.clientHeight);
      clearTimeout(cwTimer);
      cwTimer = setTimeout(() => setCw(el.clientWidth), 150);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => {
      clearTimeout(cwTimer);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pw || !cw) {
      return;
    }
    const lastAutoFit = autoFitZoomRef.current.get(fileId);
    const userChangedZoom = lastAutoFit !== undefined && Math.abs(zoom - lastAutoFit) > 0.01;
    if (userChangedZoom) {
      return;
    }
    const fitZoom = (cw / pw) * 0.96;
    const clamped = Math.min(pdfConfig.maxZoom, Math.max(pdfConfig.minZoom, fitZoom));
    if (Math.abs(clamped - zoom) < 0.01) {
      return;
    }
    autoFitZoomRef.current.set(fileId, clamped);
    onZoomChange(clamped);
  }, [cw, pw, fileId, zoom, onZoomChange]);

  const overlays = useCallback(
    (pg: number) => {
      const items = merged.filter((h) => h.pageNumber === pg);
      if (!items.length || !pw || !ph) {
        return null;
      }

      const focusedEntry = markerEntries[effectiveMarkerIdx];
      const visible = items.filter(
        (h) =>
          (h.type !== 'citation' && h.type !== 'hallucination') ||
          h.id === focusedEntry?.highlightId,
      );
      if (!visible.length) {
        return null;
      }

      const RENDER_SCALE = 1.25;
      const IMG_MAX_W = 1600;
      const IMG_MAX_H = 2200;
      let refW = pw * RENDER_SCALE;
      let refH = ph * RENDER_SCALE;
      if (refW > IMG_MAX_W || refH > IMG_MAX_H) {
        const cap = Math.min(IMG_MAX_W / refW, IMG_MAX_H / refH);
        refW *= cap;
        refH *= cap;
      }

      const renderBox = (
        key: string,
        bbox: [number, number, number, number],
        type: string,
        isFocused: boolean,
        label?: string,
        note?: string,
      ) => {
        const [x1, y1, x2, y2] = bbox;
        const left = (x1 / refW) * 100;
        const top = (y1 / refH) * 100;
        const width = ((x2 - x1) / refW) * 100;
        const height = ((y2 - y1) / refH) * 100;

        const palette =
          type === 'entity'
            ? { background: '96,165,250', border: '59,130,246' }
            : type === 'search'
              ? { background: '74,222,128', border: '34,197,94' }
              : type === 'hallucination'
                ? { background: '248,113,113', border: '239,68,68' }
                : { background: '250,204,21', border: '234,179,8' };
        const bgColor = `rgba(${palette.background},${isFocused ? 0.16 : 0.05})`;
        const borderColor = `rgba(${palette.border},${isFocused ? 0.45 : 0.12})`;

        return (
          <div
            key={key}
            className={cn(
              'group absolute transition-all',
              isFocused && 'pointer-events-auto shadow-[0_0_0_1px_rgba(249,115,22,0.08)]',
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '1px',
            }}
          >
            {label && isFocused && (
              <span className="absolute -top-5 left-0 text-[10px] bg-background/90 px-1 rounded-sm shadow-sm">
                {label}
              </span>
            )}
            {note && isFocused && (
              <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1 hidden w-64 max-w-[80vw] flex-col gap-1 border border-border/60 bg-popover p-2 text-left text-[11px] leading-snug text-popover-foreground shadow-md group-hover:flex">
                <span className="font-medium">
                  {type === 'hallucination' ? 'Contradicting excerpt' : 'Cited excerpt'}
                </span>
                <span className="line-clamp-4 text-muted-foreground">{note}</span>
              </span>
            )}
          </div>
        );
      };

      return (
        <div className="absolute inset-0 pointer-events-none">
          {visible.map((h) => {
            const boxes = bbox
              .validAll(h.bboxes)
              .filter((box) => !bbox.isPageSized(box, refW, refH));
            if (!boxes.length) {
              return null;
            }
            const isFocused = focusId === h.id;
            return boxes.map((box, i) =>
              renderBox(
                `${h.id}-${i}`,
                box,
                h.type,
                isFocused,
                i === 0 ? h.label : undefined,
                i === 0 ? h.text : undefined,
              ),
            );
          })}
        </div>
      );
    },
    [merged, pw, ph, focusId, markerEntries, effectiveMarkerIdx],
  );

  const pageList = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8', className)}>
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Failed to load document</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'flex flex-col bg-background border rounded-lg overflow-hidden',
        fs && 'fixed inset-0 z-50 rounded-none border-0',
        className,
      )}
    >
      <PdfToolbar
        fileName={fileName}
        pageCount={file?.pages ?? undefined}
        pageNumber={pageNumber}
        numPages={numPages}
        onPageChange={(p) => {
          goToPage(p);
          stableScroll((b) => scrollPage(p, b));
        }}
        onPreviousPage={() => {
          goToPreviousPage();
          stableScroll((b) => scrollPage(Math.max(1, pageNumber - 1), b));
        }}
        onNextPage={() => {
          goToNextPage();
          stableScroll((b) => scrollPage(Math.min(numPages, pageNumber + 1), b));
        }}
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomChange={onZoomChange}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onRotate={onRotate}
        isFullscreen={fs}
        onToggleFullscreen={toggleFs}
        onDownload={onDownload}
        onSearch={() => {
          setFindOpen((o) => !o);
          if (!findOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      />

      {findOpen && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b bg-muted/20">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search in document..."
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleJumpHit(e.shiftKey ? -1 : 1);
              } else if (e.key === 'Escape') {
                setFindOpen(false);
                setFindQuery('');
              }
            }}
            className="h-7 text-xs flex-1"
          />
          {findQuery.trim() && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {findHits.length ? `${findIdx + 1} of ${findHits.length}` : 'No results'}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={!findHits.length}
            onClick={() => handleJumpHit(-1)}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={!findHits.length}
            onClick={() => handleJumpHit(1)}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setFindOpen(false);
              setFindQuery('');
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-muted/20">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" variant="awaiting" />
              </div>
            )}
            <Document
              file={fileUrl}
              onLoadSuccess={handleLoad}
              onLoadError={handleError}
              loading={null}
            >
              {pageList.map((p) => (
                <div
                  key={p}
                  data-page={p}
                  ref={(el) => {
                    if (el) {
                      pageMap.current.set(p, el);
                    } else {
                      pageMap.current.delete(p);
                    }
                  }}
                  className="flex justify-center py-2"
                  style={
                    ph
                      ? {
                          minHeight: Math.max(ph * zoom + 16, Math.max(0, vh - 8)),
                        }
                      : vh
                        ? { minHeight: Math.max(0, vh - 8) }
                        : undefined
                  }
                >
                  <div className="relative">
                    <Page
                      pageNumber={p}
                      scale={zoom}
                      rotate={rotation}
                      onLoadSuccess={handlePageLoad}
                      renderTextLayer
                      renderAnnotationLayer
                    />
                    {overlays(p)}
                  </div>
                </div>
              ))}
            </Document>
          </div>
        </div>
      </div>

      {markerEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border-t bg-muted/30 text-xs min-h-[36px]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground">Highlights:</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-yellow-400/40 border border-yellow-500/60 rounded-[2px]" />
              <span>Citation</span>
            </div>
            {hallucinationCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-red-400/40 border border-red-500/60 rounded-[2px]" />
                <span>Unsupported</span>
              </div>
            )}
          </div>
          {markerEntries.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              {matchStatus && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                    matchStatus === 'text'
                      ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                      : matchStatus === 'bbox'
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                        : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
                  )}
                >
                  {matchStatus === 'text' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  {matchStatus === 'text'
                    ? 'Text verified'
                    : matchStatus === 'bbox'
                      ? 'Region only'
                      : 'Page only'}
                </span>
              )}
              <span className="text-muted-foreground">
                Highlight {effectiveMarkerIdx + 1} of {markerEntries.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={() => handleJumpMarker(-1)}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={() => handleJumpMarker(1)}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs shrink-0"
            onClick={() => activeTabId && usePdfStore.getState().clearHighlights(activeTabId)}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
