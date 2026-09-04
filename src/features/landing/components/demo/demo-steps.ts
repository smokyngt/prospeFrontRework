import demoData from './data/demo-content.json';

import type { demoContent } from './demo-config';
import type { DemoStep } from './demo-types';

type Copy = ReturnType<typeof demoContent.get>;

function resolveToken(token: string, copy: Copy): unknown {
  if (token === '@queries') {
    return copy.retrievalQueries;
  }
  if (token.startsWith('@text.')) {
    const key = token.slice('@text.'.length);
    const table = demoData.content[copy.language].stepText as Record<string, string>;
    return table[key] ?? token;
  }
  if (token.startsWith('@doc.')) {
    const key = token.slice('@doc.'.length) as keyof Copy['document'];
    return copy.document[key] ?? token;
  }
  return token;
}

function resolve(value: unknown, copy: Copy): unknown {
  if (typeof value === 'string') {
    return value.startsWith('@') ? resolveToken(value, copy) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolve(item, copy));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolve(item, copy)]),
    );
  }
  return value;
}

export const steps = {
  build(copy: Copy): DemoStep[] {
    return resolve(demoData.steps, copy) as DemoStep[];
  },
};
