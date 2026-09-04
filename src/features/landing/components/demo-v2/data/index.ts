import finance from './demo-content.json';
import healthcareScenario from './healthcare.json';
import legalScenario from './legal.json';

export type DemoSector = 'finance' | 'healthcare' | 'legal';

export type DemoData = typeof finance;

/**
 * Les jeux `legal.json` et `healthcare.json` ne portent que le scénario
 * (document, citations, étapes, textes). Tout le décor — stores, dossiers,
 * cadence d'orchestration, streaming, visite guidée et libellés `ui` — est
 * commun et repris du jeu finance.
 */
function withSharedChrome(scenario: unknown): DemoData {
  const sector = scenario as DemoData;

  return {
    ...finance,
    ...sector,
    content: {
      fr: { ...finance.content.fr, ...sector.content.fr },
      en: { ...finance.content.en, ...sector.content.en },
    },
  } as unknown as DemoData;
}

const datasets: Record<DemoSector, DemoData> = {
  finance,
  healthcare: withSharedChrome(healthcareScenario),
  legal: withSharedChrome(legalScenario),
};

export const DEMO_SECTORS = Object.keys(datasets) as DemoSector[];

export function demoDataFor(sector: DemoSector = 'finance'): DemoData {
  return datasets[sector] ?? datasets.finance;
}

/**
 * Union des documents de tous les secteurs : les `fileId` sont uniques, ce qui
 * permet de résoudre un fichier sans connaître le secteur (cache d'aperçus).
 */
export const allDemoFiles = DEMO_SECTORS.flatMap((sector) => datasets[sector].files);
