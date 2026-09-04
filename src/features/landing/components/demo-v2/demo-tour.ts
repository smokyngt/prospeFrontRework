import { demoDataFor } from './data';

// La visite guidée est commune à tous les secteurs.
const demoData = demoDataFor();

import type { demoUi } from './demo-ui';
import type { Step } from 'react-joyride';

type Ui = ReturnType<typeof demoUi.get>;

export type TourEffect =
  'awaitAnswer' | 'closeThreads' | 'expandReasoning' | 'openCitation' | 'runDemo';

export type TourStepMeta = {
  onEnter?: TourEffect;
  onLeave?: TourEffect;
  target: string;
  uiKey: string;
};

function readEffect(value: unknown): TourEffect | undefined {
  return typeof value === 'string' ? (value as TourEffect) : undefined;
}

function readNumber(value: unknown, { key }: { key: string }): Record<string, number> {
  return typeof value === 'number' ? { [key]: value } : {};
}

export const tourMeta: TourStepMeta[] = demoData.tour.map((step) => ({
  onEnter: readEffect('onEnter' in step ? step.onEnter : undefined),
  onLeave: readEffect('onLeave' in step ? step.onLeave : undefined),
  target: step.target,
  uiKey: step.uiKey,
}));

export const guidedTourSteps = {
  get(ui: Ui, isMobile = false): Step[] {
    const labels = new Map<string, string>(Object.entries(ui));
    return demoData.tour.map((step) => ({
      content: labels.get(`${step.uiKey}Content`),
      placement: (isMobile ? step.placement.mobile : step.placement.desktop) as Step['placement'],
      skipBeacon: true,
      skipScroll: true,
      target: `[data-demo-tour='${step.target}']`,
      title: labels.get(`${step.uiKey}Title`),
      ...readNumber('spotlightPadding' in step ? step.spotlightPadding : undefined, {
        key: 'spotlightPadding',
      }),
      ...readNumber('targetWaitTimeout' in step ? step.targetWaitTimeout : undefined, {
        key: 'targetWaitTimeout',
      }),
    }));
  },
};
