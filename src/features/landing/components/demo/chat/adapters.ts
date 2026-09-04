import { orchestrationDelays } from '../demo-config';

import type { DemoStoreOption } from '../demo-config';
import type { DemoCitation, DemoMessage, DemoStep } from '../demo-types';
import type { Citation, Hallucination, OrchestrationStep, Store } from '@prosperify/sdk';

function toCitation(demo: DemoCitation, start: number, end: number): Citation {
  const confidence = Number.parseInt(demo.confidence, 10) / 100;
  return {
    answer: demo.quote,
    chunkId: `citation-${demo.id}`,
    confidence: Number.isFinite(confidence) ? confidence : 0,
    end,
    evidence: demo.highlightText ?? demo.quote,
    fileId: demo.fileId ?? `demo-file-${demo.id}`,
    fileName: demo.fileName,
    pageNumber: demo.page,
    start,
  };
}

export function adaptDemoMessageForRealUi(message: DemoMessage): {
  text: string;
  citations: Citation[];
  citationsByRef: Map<number, Citation>;
  hallucinations: Hallucination[];
} {
  const rawText = message.text;
  const demoCitations = message.citations ?? [];
  const demoHallucinations = message.hallucinations ?? [];

  const citationsByRef = new Map<number, Citation>();
  for (const match of rawText.matchAll(/\[([^\]]*)\]\(cite:(\d+)\)/g)) {
    const ref = Number(match[2]);
    const demoCitation = demoCitations[ref - 1];
    if (!demoCitation || citationsByRef.has(ref)) {
      continue;
    }
    const start = match.index ?? 0;
    citationsByRef.set(ref, toCitation(demoCitation, start, start + match[1].length));
  }

  for (const hallucination of demoHallucinations) {
    const ref = hallucination.counterCitationId;

    if (!ref || citationsByRef.has(ref)) {
      continue;
    }

    const demoCitation = demoCitations[ref - 1];

    if (demoCitation) {
      citationsByRef.set(ref, toCitation(demoCitation, 0, 0));
    }
  }

  const citations = [...citationsByRef.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, citation]) => citation);

  const hallucinations: Hallucination[] = demoHallucinations.map((h) => ({
    ...(h.counterCitationId ? { chunkId: `citation-${h.counterCitationId}` } : {}),
    end: h.end,
    ...(h.evidence ? { evidence: h.evidence } : {}),
    reason: h.reason,
    score: h.score,
    start: h.start,
  }));

  return { text: rawText, citations, citationsByRef, hallucinations };
}

export function resolveDemoCitation(
  citation: Citation,
  demoCitations: DemoCitation[],
): DemoCitation | undefined {
  const match = /^citation-(.+)$/.exec(citation.chunkId);
  if (!match) {
    return undefined;
  }
  return demoCitations.find((c) => String(c.id) === match[1]);
}

export function toOrchestrationStep(step: DemoStep, index: number): OrchestrationStep {
  const startedAt = orchestrationDelays.slice(0, index).reduce((sum, delay) => sum + delay, 0);
  return {
    action: step.action,
    chunks: step.chunks,
    duration: orchestrationDelays[index],
    entities: step.entities,
    function: step.toolName
      ? {
          name: step.toolName,
          arguments: JSON.stringify(step.toolParams ?? {}),
        }
      : undefined,
    id: step.id,
    queries: step.queries,
    reasoning: step.reasoning,
    startedAt,
    thinking: step.thinking,
    toolResponse: step.toolResponse,
  };
}

export function toStore(option: DemoStoreOption, storeLabels: Record<string, string>): Store {
  return {
    actor: 'demo',
    createdAt: 0,
    id: option.id,
    name: (option.nameKey ? storeLabels[option.nameKey] : undefined) ?? option.short,
    object: 'store',
    organization: 'demo',
  };
}

export function toStores(options: DemoStoreOption[], storeLabels: Record<string, string>): Store[] {
  return options.map((option) => toStore(option, storeLabels));
}

export function selectedStoreIds(options: DemoStoreOption[]): string[] {
  return options.filter((option) => option.selected).map((option) => option.id);
}
