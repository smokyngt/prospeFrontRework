import { demoContent } from './demo-config';

import type { DemoSector } from './data';

export function getDemoCopy(language?: string, sector?: DemoSector) {
  return demoContent.get(language, sector);
}
