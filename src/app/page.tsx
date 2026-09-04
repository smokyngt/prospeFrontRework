"use client";

import { useEffect } from "react";

import LandingPage from "@/features/landing/components/landing-page";
import i18n from "@/lib/i18n";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const navigatorLang = (navigator.language || "").toLowerCase();
    const lang = navigatorLang.startsWith("fr") ? "fr" : "en";

    i18n.changeLanguage(lang).catch(() => undefined);
  }, []);

  return <LandingPage />;
}
