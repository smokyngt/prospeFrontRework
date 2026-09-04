"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CONSENT_KEY = "prosperify-consent";
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

    if (
      Date.now() - new Date(parsed.timestamp).getTime() >
      CONSENT_MAX_AGE_MS
    ) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function loadGtm(gtmId: string): void {
  if (document.querySelector(`script[data-gtm-id="${gtmId}"]`)) {
    return;
  }

  const script = document.createElement("script");

  script.setAttribute("data-gtm-id", gtmId);
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

function applyConsent(consent: Consent): void {
  window.__consent = consent;
  const gtmId = window.__gtmId;

  if (consent.analytics && gtmId) {
    loadGtm(gtmId);
  }
}

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();

    if (existing) {
      applyConsent(existing);
      return;
    }

    setVisible(true);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent: Consent = {
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const consent: Consent = {
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    setVisible(false);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-lg sm:border">
      <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {t("cookie.message")}{" "}
        <a
          className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
          href="/gdpr"
        >
          {t("cookie.learn")}
        </a>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="flex-1 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          onClick={handleRejectAll}
          type="button"
        >
          {t("cookie.reject")}
        </button>
        <button
          className="flex-1 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-[var(--pf-on-accent)] transition-colors hover:bg-orange-600"
          onClick={handleAcceptAll}
          type="button"
        >
          {t("cookie.accept")}
        </button>
      </div>
    </div>
  );
}
