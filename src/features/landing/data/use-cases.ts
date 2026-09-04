import { Calculator, Scale, Stethoscope } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export const USE_CASE_IDS = ['legal', 'accounting', 'medical'] as const;
export type UseCaseId = (typeof USE_CASE_IDS)[number];

export const USE_CASE_ICONS: Record<UseCaseId, LucideIcon> = {
  legal: Scale,
  accounting: Calculator,
  medical: Stethoscope,
};
