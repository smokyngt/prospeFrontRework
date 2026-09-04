'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CONSENT_KEY = 'prosperify-consent';
const CONSENT_MAX_AGE_MS = 13 * 30 * 24 * 60 * 60 * 1000;

type Consent = {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

function getStoredConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Consent;

    if (Date.now() - new Date(parsed.timestamp).getTime() > CONSENT_MAX_AGE_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function applyConsent(consent: Consent): void {
  window.__consent = consent;

  const granted = consent.analytics ? 'granted' : 'denied';
  const marketing = consent.marketing ? 'granted' : 'denied';

  window.gtag?.('consent', 'update', {
    ad_personalization: marketing,
    ad_storage: marketing,
    ad_user_data: marketing,
    analytics_storage: granted,
  });
}

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();

    if (existing) {
      applyConsent(existing);
      return;
    }

    setVisible(true);
  }, []);

  const setConsentCookie = useCallback((value: string) => {
    document.cookie = `cookie_consent=${value}; max-age=${13 * 30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
  }, []);

  const persist = useCallback(
    (choice: { analytics: boolean; marketing: boolean }) => {
      const consent: Consent = {
        analytics: choice.analytics,
        marketing: choice.marketing,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      setConsentCookie(choice.analytics ? 'accepted' : 'rejected');
      applyConsent(consent);
      setVisible(false);
    },
    [setConsentCookie],
  );

  const handleAcceptAll = useCallback(() => {
    persist({ analytics: true, marketing: true });
  }, [persist]);

  const handleRejectAll = useCallback(() => {
    persist({ analytics: false, marketing: false });
  }, [persist]);

  const handleSaveChoices = useCallback(() => {
    persist({ analytics, marketing: false });
  }, [analytics, persist]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-lg sm:border">
      <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {t('cookie.message')}{' '}
        <a
          className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
          href="/gdpr"
        >
          {t('cookie.learn')}
        </a>
      </p>
      {customizing && (
        <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <input
              aria-describedby="consent-necessary-hint"
              checked
              className="mt-0.5 h-4 w-4 accent-orange-500"
              disabled
              id="consent-necessary"
              type="checkbox"
            />
            <label className="flex-1" htmlFor="consent-necessary">
              <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {t('cookie.necessary')}
              </span>
              <span
                className="block text-xs text-neutral-500 dark:text-neutral-400"
                id="consent-necessary-hint"
              >
                {t('cookie.necessary_hint')}
              </span>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              aria-describedby="consent-analytics-hint"
              checked={analytics}
              className="mt-0.5 h-4 w-4 accent-orange-500"
              id="consent-analytics"
              onChange={(event) => setAnalytics(event.target.checked)}
              type="checkbox"
            />
            <label className="flex-1 cursor-pointer" htmlFor="consent-analytics">
              <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {t('cookie.analytics')}
              </span>
              <span
                className="block text-xs text-neutral-500 dark:text-neutral-400"
                id="consent-analytics-hint"
              >
                {t('cookie.analytics_hint')}
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {customizing ? (
          <>
            <button
              className="flex-1 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              onClick={() => setCustomizing(false)}
              type="button"
            >
              {t('cookie.back')}
            </button>
            <button
              className="flex-1 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              onClick={handleSaveChoices}
              type="button"
            >
              {t('cookie.save')}
            </button>
          </>
        ) : (
          <>
            <button
              className="flex-1 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              onClick={handleRejectAll}
              type="button"
            >
              {t('cookie.reject')}
            </button>
            <button
              className="flex-1 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              onClick={() => setCustomizing(true)}
              type="button"
            >
              {t('cookie.customize')}
            </button>
            <button
              className="flex-1 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              onClick={handleAcceptAll}
              type="button"
            >
              {t('cookie.accept')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
