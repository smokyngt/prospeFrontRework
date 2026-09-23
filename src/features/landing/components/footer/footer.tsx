"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { CloudShader } from "@/components/ui/cloud-shader";
import {
  getCurrentLandingTheme,
  LANDING_THEME_CHANGE_EVENT,
} from "@/features/landing/lib/theme";

type FooterGroup = {
  links: { href: string; labelKey: string }[];
  titleKey: string;
};

const footerGroups: FooterGroup[] = [
  {
    titleKey: "footer.product",
    links: [
      { labelKey: "footer.links.workflow", href: "#workflow" },
      { labelKey: "footer.links.features", href: "#features" },
      { labelKey: "footer.links.deployment", href: "#products" },
      { labelKey: "footer.links.sovereignty", href: "#sovereignty" },
      { labelKey: "footer.links.security", href: "#security" },
    ],
  },
  {
    titleKey: "footer.resources",
    links: [
      { labelKey: "footer.links.blog", href: "/blog" },
      { labelKey: "footer.links.faq", href: "#faq" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { labelKey: "footer.links.team", href: "/team" },
      { labelKey: "footer.links.contact", href: "#contact" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { labelKey: "footer.links.privacy", href: "/privacy" },
      { labelKey: "footer.links.terms", href: "/terms" },
      { labelKey: "footer.links.rgpd", href: "/gdpr" },
    ],
  },
];

const MAPPING_AURA_URL =
  "https://francedigitale.org/publications/mapping-startups-aura-2026";

const FOOTER_SKY = {
  dark: { background: "#080808", cloud: "#3a2313" },
  light: { background: "#FFFFFF", cloud: "#ffdcc2" },
};

function subscribeToTheme(onChange: () => void) {
  window.addEventListener(LANDING_THEME_CHANGE_EVENT, onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
  return () => {
    window.removeEventListener(LANDING_THEME_CHANGE_EVENT, onChange);
    observer.disconnect();
  };
}

const getServerTheme = () => "light" as const;

export function LandingFooter() {
  const { t } = useTranslation();
  const theme = useSyncExternalStore(subscribeToTheme, getCurrentLandingTheme, getServerTheme);
  const sky = FOOTER_SKY[theme];

  return (
    <footer
      className="relative z-10 overflow-hidden border-t border-[var(--pf-border)]"
      style={{ background: "var(--pf-bg)" }}
    >
      <div className="relative z-10 mx-auto max-w-[1360px] border-x border-[var(--pf-border)] px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-[1.1fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Prosperify home"
            >
              <Image
                src="/assets/brand/logo-full.png"
                alt="Prosperify"
                width={148}
                height={80}
                className="h-[24px] w-auto object-contain"
              />
            </Link>
            <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-[var(--pf-fg-muted)]">
              {t("footer.tagline")}
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.titleKey}>
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--pf-fg-dim)]">
                {t(group.titleKey)}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13px] text-[var(--pf-fg-muted)] transition-colors hover:text-[#FF6A13]"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--pf-border)] pt-6 sm:flex-row">
          <p className="text-center text-xs text-[var(--pf-fg-dim)] sm:text-left">
            {t("footer.copyright")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              className="max-w-[560px] text-[14px] leading-snug text-[var(--pf-fg-dim)] transition-colors hover:text-[var(--pf-fg-muted)]"
              href={MAPPING_AURA_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("footer.mappingText")} ↗
            </a>
            <Image
              src="/assets/partners/french-tech-saint-etienne-lyon.png"
              alt="La French Tech Saint-Étienne Lyon"
              width={965}
              height={1206}
              className="h-[48px] w-auto object-contain"
            />
            <a
              href="https://www.linkedin.com/company/prosperify-ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-[var(--pf-fg-muted)] transition-colors hover:text-[#FF6A13]"
              aria-label="Prosperify LinkedIn"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Mot-symbole dans son dégradé d'origine, avec le point orange. */}
        <div
          aria-hidden="true"
          className="relative isolate mt-[clamp(32px,5vh,56px)] overflow-hidden rounded-[clamp(24px,4vw,48px)] bg-[var(--pf-bg)] px-4 pt-[clamp(32px,5vw,72px)] pb-[clamp(20px,3vw,40px)] sm:px-8"
        >
          <CloudShader
            className="absolute inset-0 h-full min-h-0"
            cloudColor={sky.cloud}
            count={4}
            skyBottomColor={sky.background}
            skyTopColor={sky.background}
            speed={0.6}
          />
          <div
            className="relative z-10 bg-[linear-gradient(180deg,#e4e4e4_0%,#f9d5c0_100%)] bg-clip-text text-center font-extrabold leading-[0.82] tracking-[-0.04em] whitespace-nowrap text-transparent select-none dark:bg-[linear-gradient(180deg,#282828_0%,#45210c_100%)]"
            style={{
              fontSize: "clamp(2rem, 13vw, 12rem)",
              paddingBottom: "0.2em",
            }}
          >
            Prosperify<span className="text-[#FF6A13]">.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
