export type LandingTheme = 'light' | 'dark';
export type LandingLanguage = 'fr' | 'en';

export const LANDING_THEME_STORAGE_KEY = 'prosperify-theme';
export const LANDING_LANGUAGE_STORAGE_KEY = 'prosperify-language';
export const LANDING_THEME_CHANGE_EVENT = 'prosperify-theme-change';
export const LANDING_LANGUAGE_CHANGE_EVENT = 'prosperify-language-change';

export function normalizeLandingTheme(theme: string | null): LandingTheme {
  return theme === 'dark' ? 'dark' : 'light';
}

export function normalizeLandingLanguage(
  language: string | null,
): LandingLanguage {
  return language === 'en' ? 'en' : 'fr';
}

export function readStoredLandingTheme(): LandingTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return normalizeLandingTheme(
    window.localStorage.getItem(LANDING_THEME_STORAGE_KEY),
  );
}

export function readStoredLandingLanguage(): LandingLanguage {
  if (typeof window === 'undefined') {
    return 'fr';
  }

  return normalizeLandingLanguage(
    window.localStorage.getItem(LANDING_LANGUAGE_STORAGE_KEY),
  );
}

export function getCurrentLandingTheme(): LandingTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function getCurrentLandingLanguage(): LandingLanguage {
  if (typeof document === 'undefined') {
    return 'fr';
  }

  return normalizeLandingLanguage(
    document.documentElement.dataset.lang ?? null,
  );
}

export function applyLandingTheme(theme: LandingTheme): boolean {
  const dark = theme === 'dark';

  document.documentElement.classList.toggle('dark', dark);
  window.localStorage.setItem(LANDING_THEME_STORAGE_KEY, theme);
  window.dispatchEvent(
    new CustomEvent(LANDING_THEME_CHANGE_EVENT, {
      detail: { dark, theme },
    }),
  );

  return dark;
}

export function applyLandingLanguage(
  language: LandingLanguage,
): LandingLanguage {
  document.documentElement.dataset.lang = language;
  document.documentElement.lang = language;
  window.localStorage.setItem(LANDING_LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent(LANDING_LANGUAGE_CHANGE_EVENT, {
      detail: { language },
    }),
  );

  return language;
}

export function initializeLandingTheme(): boolean {
  return applyLandingTheme(readStoredLandingTheme());
}

export function initializeLandingLanguage(): LandingLanguage {
  return applyLandingLanguage(readStoredLandingLanguage());
}
