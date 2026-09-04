'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  applyLandingTheme,
  getCurrentLandingTheme,
  LANDING_THEME_CHANGE_EVENT,
  readStoredLandingTheme,
} from '@/features/landing/lib/theme';
import { useLandingLanguage } from '@/hooks/use-landing-language';

export function LegalControls() {
  const { currentLang, switchLang } = useLandingLanguage();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(applyLandingTheme(readStoredLandingTheme()));
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setDark(getCurrentLandingTheme() === 'dark');
    window.addEventListener(LANDING_THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(LANDING_THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = getCurrentLandingTheme() === 'dark' ? 'light' : 'dark';
    setDark(applyLandingTheme(nextTheme));
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 border border-neutral-200 bg-white p-0.5 text-xs dark:border-neutral-800 dark:bg-neutral-950">
        <button
          type="button"
          onClick={() => switchLang('fr')}
          className={`flex items-center gap-1 px-2 py-1 font-medium transition-colors ${
            currentLang === 'fr'
              ? 'bg-orange-500 text-white'
              : 'text-neutral-500 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400'
          }`}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => switchLang('en')}
          className={`flex items-center gap-1 px-2 py-1 font-medium transition-colors ${
            currentLang === 'en'
              ? 'bg-orange-500 text-white'
              : 'text-neutral-500 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400'
          }`}
        >
          EN
        </button>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-7 w-7 items-center justify-center border border-neutral-200 bg-white/85 text-neutral-500 shadow-sm backdrop-blur transition-colors hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-400"
        aria-label={dark ? 'Use light mode' : 'Use dark mode'}
      >
        {mounted && dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
