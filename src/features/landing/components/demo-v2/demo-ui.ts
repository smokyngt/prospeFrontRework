import { demoDataFor } from './data';

import type { DemoSector } from './data';

export const demoUi = {
  get(language?: string, sector?: DemoSector) {
    const demoData = demoDataFor(sector);
    const isFrench = language?.startsWith('fr');
    const scenario = demoData.scenarios[0];

    return isFrench ? scenario.content.fr.stepText : scenario.content.en.stepText;
  },
};
