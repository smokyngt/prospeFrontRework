import { demoDataFor } from './data';

import type { DemoSector } from './data';
import type { demoContent } from './demo-config';
import type { DemoStep } from './demo-types';

type Copy = ReturnType<typeof demoContent.get>;

function resolveToken(
  token: string,
  copy: Copy,
  sector: DemoSector | undefined,
  scenarioIndex: number,
): unknown {
  if (token === '@queries') {
    return copy.retrievalQueries;
  }
  if (token.startsWith('@text.')) {
    const key = token.slice('@text.'.length);
    const scenario = demoDataFor(sector).scenarios[scenarioIndex];
    const table = scenario?.content[copy.language].stepText as Record<string, string>;
    return table?.[key] ?? token;
  }
  if (token.startsWith('@doc.')) {
    const key = token.slice('@doc.'.length) as keyof Copy['document'];
    return copy.document[key] ?? token;
  }
  return token;
}

function resolve(
  value: unknown,
  copy: Copy,
  sector: DemoSector | undefined,
  scenarioIndex: number,
): unknown {
  if (typeof value === 'string') {
    return value.startsWith('@') ? resolveToken(value, copy, sector, scenarioIndex) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolve(item, copy, sector, scenarioIndex));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolve(item, copy, sector, scenarioIndex)]),
    );
  }
  return value;
}

export const steps = {
  build(copy: Copy, sector?: DemoSector, scenarioIndex = 0): DemoStep[] {
    const scenario = demoDataFor(sector).scenarios[scenarioIndex];
    return resolve(scenario?.steps ?? [], copy, sector, scenarioIndex) as DemoStep[];
  },
};
