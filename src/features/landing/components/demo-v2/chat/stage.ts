import { Brain, Search, Sparkles, Wrench } from 'lucide-react';

import type { ComponentType } from 'react';

export type StageKey = 'reasoning' | 'retrieval' | 'tools' | 'generation';

export const STAGE_ICON: Record<StageKey, ComponentType<{ className?: string }>> = {
  generation: Sparkles,
  reasoning: Brain,
  retrieval: Search,
  tools: Wrench,
};

export const STAGE_BAR_CLASS: Record<StageKey, string> = {
  generation: 'bg-primary',
  reasoning: 'bg-primary/40',
  retrieval: 'bg-primary/70',
  tools: 'bg-primary/55',
};

export function stageFor(action: string): StageKey {
  switch (action) {
    case 'analyzing':
    case 'clarify':
    case 'clarifyResponse':
    case 'clarify_response':
      return 'reasoning';
    case 'search':
    case 'searching':
    case 'retrieved':
    case 'sort':
      return 'retrieval';
    case 'generate':
    case 'generating':
      return 'generation';
    default:
      return 'tools';
  }
}
