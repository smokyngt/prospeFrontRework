'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  applyLandingLanguage,
  getCurrentLandingLanguage,
  LANDING_LANGUAGE_CHANGE_EVENT,
  normalizeLandingLanguage,
  readStoredLandingLanguage,
} from '@/features/landing/lib/theme';
import i18n from '@/lib/i18n';

import type { LandingLanguage } from '@/features/landing/lib/theme';

export function useLandingLanguageSync(lang?: string): void {
  useEffect(() => {
    const resolved = normalizeLandingLanguage(lang ?? readStoredLandingLanguage());
    applyLandingLanguage(resolved);
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved).catch(() => undefined);
    }
  }, [lang]);
}

export function useLandingLanguage(): {
  currentLang: LandingLanguage;
  switchLang: (lang: LandingLanguage) => void;
} {
  const [currentLang, setCurrentLang] = useState<LandingLanguage>(() =>
    normalizeLandingLanguage(i18n.language),
  );

  useEffect(() => {
    const lang = readStoredLandingLanguage();
    applyLandingLanguage(lang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(() => undefined);
    }
    setCurrentLang(lang);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => setCurrentLang(getCurrentLandingLanguage());
    window.addEventListener(LANDING_LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(LANDING_LANGUAGE_CHANGE_EVENT, handleLanguageChange);
  }, []);

  const switchLang = useCallback((target: LandingLanguage) => {
    if (target === getCurrentLandingLanguage()) {
      return;
    }
    applyLandingLanguage(target);
    if (i18n.language !== target) {
      i18n.changeLanguage(target).catch(() => undefined);
    }
    setCurrentLang(target);
  }, []);

  return { currentLang, switchLang };
}
