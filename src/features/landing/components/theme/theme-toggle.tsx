'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  applyLandingTheme,
  getCurrentLandingTheme,
  initializeLandingTheme,
  LANDING_THEME_CHANGE_EVENT,
} from '@/features/landing/lib/theme';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(initializeLandingTheme());
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setDark(getCurrentLandingTheme() === 'dark');
    };

    window.addEventListener(LANDING_THEME_CHANGE_EVENT, handleThemeChange);
    return () =>
      window.removeEventListener(LANDING_THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = getCurrentLandingTheme() === 'dark' ? 'light' : 'dark';
    setDark(applyLandingTheme(nextTheme));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center border border-neutral-200 bg-white/85 text-neutral-700 shadow-sm backdrop-blur transition-colors hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-200"
      aria-label={dark ? 'Use light mode' : 'Use dark mode'}
    >
      {mounted && dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
