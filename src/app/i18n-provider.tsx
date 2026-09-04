'use client';

import { I18nextProvider } from 'react-i18next';

import { useLandingLanguageSync } from '@/hooks/use-landing-language';
import i18n from '@/lib/i18n';

import type { ReactNode } from 'react';

export function I18nProvider({ children }: { children: ReactNode }) {
  useLandingLanguageSync();

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
