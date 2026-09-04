import { allDemoFiles, demoDataFor } from './data';

import type { DemoSector } from './data';
import type { DemoCitation, DemoHallucination } from './demo-types';

export type { DemoSector } from './data';

type DemoContent = {
  storeName: string;
  storeLabels: Record<string, string>;
  citations: DemoCitation[];
  document: {
    articleOne: string;
    articleThree: string;
    title: string;
    verifiedClause: string;
  };
  finalAnswer: string;
  hallucinations?: DemoHallucination[];
  language: 'en' | 'fr';
  question: string;
  reasoning: string;
  retrievalQueries: string[];
  threads: string[];
};

export type DemoStoreOption = {
  disabled: boolean;
  id: string;
  nameKey?: string;
  selected: boolean;
  short: string;
};

export function demoChatConfigFor(sector?: DemoSector) {
  const demoData = demoDataFor(sector);

  return {
    stores: demoData.stores as DemoStoreOption[],
    filterFiles: demoData.filterFiles,
    filterFolders: demoData.filterFolders,
    filterMetadata: demoData.filterMetadata as Array<{
      key: string;
      value: string;
    }>,
    userInitials: demoData.userInitials,
    archivedThreadCount: demoData.archivedThreadCount,
  };
}

export type DemoChatConfig = ReturnType<typeof demoChatConfigFor>;

export function orchestrationDelaysFor(sector?: DemoSector): number[] {
  return demoDataFor(sector).orchestrationDelays;
}

export function streamingConfigFor(sector?: DemoSector) {
  return demoDataFor(sector).streaming;
}

export type DemoFile = {
  fileId: string;
  fileName: string;
  metadata: Record<string, string>;
  totalPages: number;
  url: string;
};

export function demoFilesFor(sector?: DemoSector): DemoFile[] {
  return demoDataFor(sector).files;
}

export function demoPrimaryFileFor(sector?: DemoSector): DemoFile {
  return demoFilesFor(sector)[0];
}

/** Résolution globale : les `fileId` sont uniques d'un secteur à l'autre. */
export function demoFileById(fileId?: null | string): DemoFile {
  return allDemoFiles.find((file) => file.fileId === fileId) ?? allDemoFiles[0];
}

function citationsFor(sector?: DemoSector): DemoCitation[] {
  return demoDataFor(sector).citations.map((c) => ({
    confidence: c.confidence,
    fileId: c.fileId,
    fileName: c.fileName,
    highlightText: c.highlightText,
    id: c.id,
    page: c.page,
    quote: c.quote,
  }));
}

function getContent(langKey: 'fr' | 'en', sector?: DemoSector) {
  const demoData = demoDataFor(sector);
  const langData = demoData.content[langKey];
  const sharedCitations = citationsFor(sector);

  return {
    storeName: langData.storeName,
    storeLabels: { storeName: langData.storeName, ...langData.storeLabels },
    citations: sharedCitations,
    document: demoData.document,
    finalAnswer: langData.finalAnswer,
    hallucinations: langData.hallucinations.map((h) => ({
      start: h.start,
      end: h.end,
      evidence: h.evidence,
      reason: h.reason,
      score: h.score,
      counterCitation: sharedCitations.find((c) => c.id === h.counterCitationId),
    })),
    language: langKey,
    question: langData.question,
    reasoning: langData.reasoning,
    retrievalQueries: langData.retrievalQueries,
    threads: langData.threads,
  };
}

export const demoContent = {
  get(language?: string, sector?: DemoSector): DemoContent {
    const isFrench = language?.startsWith('fr');
    return isFrench ? getContent('fr', sector) : getContent('en', sector);
  },
};
