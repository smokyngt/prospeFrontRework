import demoData from './data/demo-content.json';

import type { DemoCitation, DemoHallucination } from './demo-types';

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

export const demoChatConfig = {
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

export const orchestrationDelays = demoData.orchestrationDelays;
export const streamingConfig = demoData.streaming;

export type DemoFile = {
  fileId: string;
  fileName: string;
  metadata: Record<string, string>;
  totalPages: number;
  url: string;
};

export const demoFiles: DemoFile[] = demoData.files;
export const demoPrimaryFile = demoFiles[0];

export function demoFileById(fileId?: null | string): DemoFile {
  return demoFiles.find((file) => file.fileId === fileId) ?? demoPrimaryFile;
}

const sharedCitations: DemoCitation[] = demoData.citations.map((c) => ({
  confidence: c.confidence,
  fileId: c.fileId,
  fileName: c.fileName,
  highlightText: c.highlightText,
  id: c.id,
  page: c.page,
  quote: c.quote,
}));

const baseDocument = demoData.document;

function getContent(langKey: 'fr' | 'en') {
  const langData = demoData.content[langKey];
  return {
    storeName: langData.storeName,
    storeLabels: { storeName: langData.storeName, ...langData.storeLabels },
    citations: sharedCitations,
    document: baseDocument,
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
  get(language?: string): DemoContent {
    const isFrench = language?.startsWith('fr');
    return isFrench ? getContent('fr') : getContent('en');
  },
};
