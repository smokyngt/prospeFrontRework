export type MarkerKind = 'citation' | 'hallucination';

export type Marker = { index: number; kind: MarkerKind };

const SCHEMES: Record<string, MarkerKind> = {
  'cite:': 'citation',
  'halluc:': 'hallucination',
};

export function readMarkerHref(href: unknown): Marker | null {
  if (typeof href !== 'string') {
    return null;
  }
  for (const [scheme, kind] of Object.entries(SCHEMES)) {
    if (href.startsWith(scheme)) {
      const index = Number(href.slice(scheme.length));
      return Number.isFinite(index) ? { index, kind } : null;
    }
  }
  return null;
}
