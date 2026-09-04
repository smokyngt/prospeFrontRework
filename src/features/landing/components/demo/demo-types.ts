type DemoAction =
  | 'analyzing'
  | 'generating'
  | 'ls'
  | 'readFile'
  | 'retrieved'
  | 'screenshot'
  | 'searching'
  | 'toolCall';

export type DemoStep = {
  action: DemoAction;
  chunks?: number;
  entities?: string[];
  id: string;
  queries?: string[];
  reasoning?: string;
  thinking?: string;
  toolName?: string;
  toolParams?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  topScore?: number;
};

export type DemoCitation = {
  confidence: string;
  fileId?: string;
  fileName: string;
  highlightText?: string;
  id: number;
  page: number;
  quote: string;
};

export type DemoHallucination = {
  end: number;
  evidence?: string;
  reason: string;
  score: number;
  start: number;
  counterCitationId?: number;
};

export type DemoMessage = {
  citations?: DemoCitation[];
  hallucinations?: DemoHallucination[];
  role: 'assistant' | 'user';
  text: string;
};
