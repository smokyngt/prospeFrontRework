import finance from './demo-content.json';
import healthcare from './healthcare.json';
import legal from './legal.json';

export type DemoSector = 'finance' | 'healthcare' | 'legal';

export type DemoData = typeof finance;

/**
 * Chaque secteur porte son propre corpus réel (fichiers, scénarios) : plus de
 * décor emprunté à `finance`, les trois jeux sont autonomes.
 */
const datasets: Record<DemoSector, DemoData> = {
  finance,
  healthcare: healthcare as DemoData,
  legal: legal as DemoData,
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
