import { demoDataFor } from './data';

import type { DemoSector } from './data';

export const demoUi = {
  get(language?: string, sector?: DemoSector) {
    const demoData = demoDataFor(sector);
    const isFrench = language?.startsWith('fr');

    return isFrench ? demoData.content.fr.ui : demoData.content.en.ui;
  },
};
