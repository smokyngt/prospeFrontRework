import { pdfjs } from 'react-pdf';

import { demoFileById } from '../../demo-config';
import { fuzzyMatch } from '../../pdf-highlight';

export type PreviewBox = { height: number; left: number; top: number; width: number };

export type PreviewPage = {
  boxes: PreviewBox[];
  dataUrl: string;
  height: number;
  width: number;
};

export type PrerenderRequest = {
  fileId?: string;
  highlightText?: string;
  pageNumber?: number;
};

const RENDER_WIDTH = 320;

const cache = new Map<string, PreviewPage>();
const inflight = new Map<string, Promise<null | PreviewPage>>();
const documents = new Map<string, Promise<pdfjs.PDFDocumentProxy>>();

function keyOf(fileId: string, pageNumber: number, highlightText?: string): string {
  return `${fileId}:${pageNumber}:${highlightText ?? ''}`;
}

function loadDocument(url: string): Promise<pdfjs.PDFDocumentProxy> {
  const existing = documents.get(url);
  if (existing) {
    return existing;
  }
  const task = pdfjs.getDocument(url).promise;
  documents.set(url, task);
  return task;
}

async function collectBoxes(
  page: pdfjs.PDFPageProxy,
  viewport: { scale: number; transform: number[] },
  highlightText: string,
): Promise<PreviewBox[]> {
  const content = await page.getTextContent();
  const items = content.items.filter(
    (item): item is Extract<(typeof content.items)[number], { str: string }> => 'str' in item,
  );

  let raw = '';
  const spans: { from: number; index: number; to: number }[] = [];

  items.forEach((item, index) => {
    const text = item.str;
    if (raw.length > 0 && text.length > 0 && !/\s$/.test(raw) && !/^\s/.test(text)) {
      raw += ' ';
    }
    spans.push({ from: raw.length, index, to: raw.length + text.length });
    raw += text;
  });

  const hit = fuzzyMatch(raw.toLowerCase(), highlightText.toLowerCase());
  if (!hit) {
    return [];
  }

  const boxes: PreviewBox[] = [];

  for (const span of spans) {
    if (span.from >= hit.end || span.to <= hit.start) {
      continue;
    }
    const item = items[span.index];
    const transform = pdfjs.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.hypot(transform[2], transform[3]);
    const width = item.width * viewport.scale;

    if (width <= 0 || fontHeight <= 0) {
      continue;
    }

    boxes.push({
      height: fontHeight,
      left: transform[4],
      top: transform[5] - fontHeight,
      width,
    });
  }

  return boxes;
}

async function render(request: PrerenderRequest): Promise<null | PreviewPage> {
  const file = demoFileById(request.fileId);
  const pageNumber = Math.min(Math.max(request.pageNumber ?? 1, 1), file.totalPages);

  const document = await loadDocument(file.url);
  const page = await document.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = RENDER_WIDTH / base.width;
  const viewport = page.getViewport({ scale });

  const canvas = window.document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  await page.render({ canvasContext: context, viewport }).promise;

  const boxes = request.highlightText
    ? (await collectBoxes(page, viewport, request.highlightText)).map((box) => ({
        height: (box.height / viewport.height) * 100,
        left: (box.left / viewport.width) * 100,
        top: (box.top / viewport.height) * 100,
        width: (box.width / viewport.width) * 100,
      }))
    : [];

  return {
    boxes,
    dataUrl: canvas.toDataURL('image/png'),
    height: canvas.height,
    width: canvas.width,
  };
}

export const pagePreviewCache = {
  get(request: PrerenderRequest): null | PreviewPage {
    const file = demoFileById(request.fileId);
    return cache.get(keyOf(file.fileId, request.pageNumber ?? 1, request.highlightText)) ?? null;
  },

  async prerender(requests: PrerenderRequest[]): Promise<void> {
    await Promise.all(
      requests.map(async (request) => {
        const file = demoFileById(request.fileId);
        const key = keyOf(file.fileId, request.pageNumber ?? 1, request.highlightText);

        if (cache.has(key)) {
          return;
        }

        let task = inflight.get(key);
        if (!task) {
          task = render(request).catch(() => null);
          inflight.set(key, task);
        }

        const result = await task;
        inflight.delete(key);

        if (result) {
          cache.set(key, result);
        }
      }),
    );
  },
};
