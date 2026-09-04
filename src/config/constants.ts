export const SITE_URL = 'https://prosperify.app';

export const SCHEMA_ORG = 'https://schema.org';

export function canonicalUrl(path = '/'): string {
  if (path === '/' || path === '') {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const pdfViewer = {
  defaultZoom: 1,
  minZoom: 0.25,
  maxZoom: 4,
  zoomStep: 0.25,
} as const;
