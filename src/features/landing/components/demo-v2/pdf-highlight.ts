type TextLayerSpan = { el: HTMLElement; from: number; to: number };
type TextLayer = { low: string; raw: string; spans: TextLayerSpan[] };
export type TextHit = {
  from: number;
  page: number;
  spans: HTMLElement[];
  to: number;
};

const normCharRe = /[\u2010-\u2015\u2212\u2018-\u201B\u201C-\u201F]/g;
const normCharMap: Record<string, string> = {
  '\u2010': '-',
  '\u2011': '-',
  '\u2012': '-',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201a': "'",
  '\u201b': "'",
  '\u201c': '"',
  '\u201d': '"',
  '\u201e': '"',
  '\u201f': '"',
  '\u2212': '-',
};

function normChars(value: string) {
  return value.replace(normCharRe, (char) => normCharMap[char] ?? char);
}

export function fuzzyMatch(hay: string, needle: string): null | { end: number; start: number } {
  const THRESHOLD = needle.length > 80 ? 0.72 : 0.62;

  const hayC = normChars(hay);
  const needleC = normChars(needle);

  const mapped: number[] = [];
  let norm = '';
  let wasSpace = true;
  for (let i = 0; i < hayC.length; i += 1) {
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

  const exactIndex = norm.indexOf(nNeedle);
  if (exactIndex !== -1) {
    const last = Math.min(exactIndex + nNeedle.length - 1, mapped.length - 1);
    return { end: mapped[last] + 1, start: mapped[exactIndex] };
  }

  if (nNeedle.length < 4) {
    return null;
  }

  const nTris = new Set<string>();
  for (let i = 0; i <= nNeedle.length - 3; i += 1) {
    nTris.add(nNeedle.substring(i, i + 3));
  }
  if (!nTris.size) {
    return null;
  }

  let best = 0;
  let bestI = -1;
  let bestW = 0;
  const sizes = new Set([
    Math.floor(nNeedle.length * 0.75),
    nNeedle.length,
    Math.ceil(nNeedle.length * 1.25),
  ]);

  for (const rawW of sizes) {
    const windowSize = Math.min(rawW, norm.length);
    if (windowSize < 4) {
      continue;
    }

    const freq = new Map<string, number>();
    for (let j = 0; j <= windowSize - 3; j += 1) {
      const trigram = norm.substring(j, j + 3);
      freq.set(trigram, (freq.get(trigram) ?? 0) + 1);
    }
    let hits = 0;
    for (const trigram of nTris) {
      if (freq.has(trigram)) {
        hits += 1;
      }
    }

    let score = hits / nTris.size;
    if (score > best) {
      best = score;
      bestI = 0;
      bestW = windowSize;
    }

    for (let i = 1; i <= norm.length - windowSize; i += 1) {
      const out = norm.substring(i - 1, i + 2);
      const outCount = freq.get(out);
      if (outCount === 1) {
        freq.delete(out);
        if (nTris.has(out)) {
          hits -= 1;
        }
      } else if (outCount) {
        freq.set(out, outCount - 1);
      }

      const incoming = norm.substring(i + windowSize - 3, i + windowSize);
      const incomingCount = freq.get(incoming) ?? 0;
      if (incomingCount === 0 && nTris.has(incoming)) {
        hits += 1;
      }
      freq.set(incoming, incomingCount + 1);

      score = hits / nTris.size;
      if (score > best) {
        best = score;
        bestI = i;
        bestW = windowSize;
      }
    }
  }

  if (best < THRESHOLD || bestI === -1) {
    return null;
  }

  const last = Math.min(bestI + bestW - 1, mapped.length - 1);
  return { end: mapped[last] + 1, start: mapped[bestI] };
}

export function readTextLayer(root: HTMLElement): null | TextLayer {
  const container = root.querySelector('.react-pdf__Page__textContent');
  if (!container) {
    return null;
  }

  const elements = Array.from(
    container.querySelectorAll('span:not(.marked_content)'),
  ) as HTMLElement[];
  if (elements.length === 0) {
    return null;
  }

  let raw = '';
  const spans: TextLayerSpan[] = [];

  for (const element of elements) {
    const text = element.textContent ?? '';
    if (raw.length > 0 && text.length > 0 && !/\s$/.test(raw) && !/^\s/.test(text)) {
      raw += ' ';
    }
    spans.push({ el: element, from: raw.length, to: raw.length + text.length });
    raw += text;
  }

  return raw.trim() ? { low: raw.toLowerCase(), raw, spans } : null;
}

export const TextLayer = {
  spans: {
    style(
      spans: TextLayerSpan[],
      from: number,
      to: number,
      out: HTMLElement[],
    ): HTMLElement | null {
      let first: HTMLElement | null = null;

      for (const { el, from: spanFrom, to: spanTo } of spans) {
        if (spanFrom >= to || spanTo <= from) {
          continue;
        }

        const text = el.textContent ?? '';
        const localStart = Math.max(from, spanFrom) - spanFrom;
        const localEnd = Math.min(to, spanTo) - spanFrom;

        if (localStart < 0 || localEnd > text.length || localStart >= localEnd) {
          continue;
        }

        const page = el.closest<HTMLElement>('[data-page]');
        if (!page || text.length === 0) {
          continue;
        }

        const spanRect = el.getBoundingClientRect();
        const pageRect = page.getBoundingClientRect();
        const startRatio = localStart / text.length;
        const endRatio = localEnd / text.length;
        const overlay = document.createElement('span');
        overlay.dataset.demoPdfHighlight = 'true';
        overlay.style.position = 'absolute';
        overlay.style.left = `${spanRect.left - pageRect.left + spanRect.width * startRatio}px`;
        overlay.style.top = `${spanRect.top - pageRect.top + spanRect.height * 0.34}px`;
        overlay.style.width = `${Math.max(2, spanRect.width * (endRatio - startRatio))}px`;
        overlay.style.height = `${Math.max(2, spanRect.height * 0.52)}px`;
        overlay.style.borderRadius = '2px';
        overlay.style.backgroundColor = 'rgba(34, 197, 94, 0.34)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '3';
        page.appendChild(overlay);

        out.push(overlay);
        if (!first) {
          first = overlay;
        }
      }

      return first;
    },
  },
};
