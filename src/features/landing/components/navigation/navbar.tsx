"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  ChevronDown,
  HeartPulse,
  Landmark,
  type LucideIcon,
  Scale,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  applyLandingTheme,
  getCurrentLandingTheme,
} from "@/features/landing/lib/theme";
import i18n from "@/lib/i18n";

import { Collapse } from "@/features/landing/components/collapse/collapse";
import { cn } from "@/lib/utils";

import { LanguageSwitch } from "./language-switch";

export type NavbarMenuItem = {
  descriptionKey: string;
  href: string;
  icon: LucideIcon;
  labelKey: string;
};

export type NavbarLink = {
  href: string;
  /** Présent = l'entrée ouvre un menu déroulant au lieu de naviguer seule. */
  items?: NavbarMenuItem[];
  labelKey: string;
};

const useCasesMenuItems: NavbarMenuItem[] = [
  {
    labelKey: "nav.featuresMenu.legal.label",
    descriptionKey: "nav.featuresMenu.legal.description",
    href: "/sectors/legal",
    icon: Scale,
  },
  {
    labelKey: "nav.featuresMenu.healthcare.label",
    descriptionKey: "nav.featuresMenu.healthcare.description",
    href: "/sectors/healthcare",
    icon: HeartPulse,
  },
  {
    labelKey: "nav.featuresMenu.finance.label",
    descriptionKey: "nav.featuresMenu.finance.description",
    href: "/sectors/finance",
    icon: Landmark,
  },
];

/**
 * Entrée « Cas d'usage » : le menu deroulant liste les pages secteur.
 * Son `href` pointe sur le premier secteur — il sert de repli au clic mobile
 * et a l'etat actif. Surtout, il ne doit pas doublonner avec l'ancre de
 * l'entree « Fonctionnalites » : la navbar s'en sert comme cle React.
 *
 * Simple constructeur de donnees (pas un hook) : le prefixe `use` viendrait
 * du sens anglais de « use cases », pas de la convention React — renomme
 * pour ne pas se faire flager par `react-hooks/rules-of-hooks`.
 */
export function casesMenuLink(): NavbarLink {
  return {
    labelKey: "nav.useCases",
    href: useCasesMenuItems[0].href,
    items: useCasesMenuItems,
  };
}

const defaultNavLinks: NavbarLink[] = [
  { labelKey: "nav.features", href: "#features" },
  casesMenuLink(),
  { labelKey: "nav.products", href: "#products" },
  { labelKey: "nav.sovereignty", href: "#sovereignty" },
  { labelKey: "nav.security", href: "#security" },
  { labelKey: "nav.blog", href: "/blog" },
  { labelKey: "nav.team", href: "/team" },
  { labelKey: "nav.jobs", href: "/jobs" },
];

function ProsperifyLogo() {
  return (
    <Image
      src="/assets/brand/logo-full.png"
      alt=""
      width={148}
      height={80}
      className="h-[42px] w-auto object-contain"
      priority
    />
  );
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** Entrée de nav qui ouvre un panneau : survol au pointeur, clic/clavier sinon. */
function NavDropdown({
  active,
  link,
}: {
  active: boolean;
  link: NavbarLink;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const items = link.items ?? [];

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors",
          active || open
            ? "text-[var(--pf-fg)]"
            : "text-[var(--pf-fg-muted)] hover:text-[var(--pf-fg)]",
        )}
      >
        {t(link.labelKey)}
        <ChevronDown
          size={13}
          className={cn("transition-transform", open && "rotate-180")}
        />
        {active && (
          <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-[#FF6A13]" />
        )}
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          "absolute left-0 top-full w-[340px] border border-[var(--pf-border)] shadow-xl transition-[opacity,transform,visibility] duration-200 ease-out",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1.5 opacity-0",
        )}
        style={{ background: "var(--pf-bg-card)" }}
      >
          {items.map((item) => {
            const Icon = item.icon;
            const current = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 border-b border-[var(--pf-border)] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--pf-bg-hover)]",
                  current && "bg-[var(--pf-bg-hover)]",
                )}
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{
                    background: "var(--pf-accent-bg)",
                    border: "1px solid var(--pf-accent-dim-border)",
                    color: "#FF6A13",
                  }}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[13.5px] font-semibold",
                      current ? "text-[#FF6A13]" : "text-[var(--pf-fg)]",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-[var(--pf-fg-muted)]">
                    {t(item.descriptionKey)}
                  </span>
                </span>
              </a>
            );
          })}
      </div>
    </div>
  );
}

type LandingNavbarProps = {
  /** Pastille affichée à côté du logo (ex. nom du secteur). */
  badge?: string;
  /** Liens de navigation ; les ancres restent locales à la page courante. */
  links?: NavbarLink[];
};

export function LandingNavbar({ badge, links }: LandingNavbarProps = {}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = links ?? defaultNavLinks;
  /** Ancres locales : page d'accueil, ou page fournissant ses propres liens. */
  const localAnchors = Boolean(links) || pathname === "/";
  const [activeHash, setActiveHash] = useState(
    navLinks[0]?.href ?? "#features",
  );
  const [isDark, setIsDark] = useState(false);

  const initialLang = i18n.language === "en" ? "en" : "fr";
  const [currentLang, setCurrentLang] = useState<"fr" | "en">(initialLang);

  const switchLang = (target: "fr" | "en") => {
    if (target === currentLang) return;
    i18n.changeLanguage(target).catch(() => undefined);
    setCurrentLang(target);
  };

  const contactHref = localAnchors ? "#contact" : "/#contact";

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = getCurrentLandingTheme() === "dark" ? "light" : "dark";
    setIsDark(applyLandingTheme(next));
  };

  useEffect(() => {
    if (!localAnchors) return undefined;

    const sectionIds = navLinks
      .map((link) => (link.href.startsWith("#") ? link.href.slice(1) : null))
      .filter((id): id is string => Boolean(id));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveHash(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-32% 0px -52% 0px", threshold: [0.08, 0.18, 0.32] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [localAnchors, navLinks]);

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) return href;
    return localAnchors ? href : `/${href}`;
  };

  /**
   * Le navigateur saute directement vers un `#hash`, sans animation (ignore
   * `scroll-behavior: smooth`). On intercepte pour ancrer soi-même la
   * section, en douceur.
   */
  const handleAnchorClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!localAnchors || !href.startsWith("#")) {
      return;
    }
    const target = document.querySelector(href);
    if (!target) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", href);
  };

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--pf-border)] backdrop-blur-xl"
      style={{ background: "var(--pf-nav-bg)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between border-x border-[var(--pf-border)] px-5 sm:px-8 lg:px-12">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- <a> volontaire pour les changements de page (cf. demande explicite) */}
        <a
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="Prosperify"
        >
          <ProsperifyLogo />
          {badge && (
            <span className="hidden items-center gap-[7px] border-l border-[var(--pf-border)] pl-3 sm:flex">
              <span className="h-1.5 w-1.5 bg-[#FF6A13]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--pf-fg-muted)]">
                {badge}
              </span>
            </span>
          )}
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = localAnchors && link.href === activeHash;

            if (link.items) {
              return (
                <NavDropdown key={link.labelKey} active={active} link={link} />
              );
            }

            return (
              <a
                key={link.labelKey}
                href={resolveHref(link.href)}
                className={cn(
                  "relative px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "text-[var(--pf-fg)]"
                    : "text-[var(--pf-fg-muted)] hover:text-[var(--pf-fg)]",
                )}
                onClick={handleAnchorClick(link.href)}
              >
                {t(link.labelKey)}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-[#FF6A13]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Lang switcher */}
          <LanguageSwitch onChange={switchLang} value={currentLang} />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-8 w-8 items-center justify-center border border-[var(--pf-border)] text-[var(--pf-fg-muted)] transition-colors hover:border-[#FF6A13] hover:text-[#FF6A13] sm:flex"
            style={{ background: "var(--pf-bg-card)" }}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            href={contactHref}
            className="hidden items-center gap-2 bg-[#FF6A13] px-[18px] py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-[#ff8232] sm:inline-flex"
          >
            {t("footer.links.contact")} →
          </a>

          <button
            type="button"
            className="text-[var(--pf-fg-muted)] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <IconX className="h-6 w-6" />
            ) : (
              <IconMenu2 className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <Collapse className="lg:hidden" open={mobileOpen}>
        <div
          className="border-t border-[var(--pf-border)] px-5 py-6"
          style={{ background: "var(--pf-bg)" }}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Fragment key={link.labelKey}>
                <a
                  href={resolveHref(link.href)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium transition-colors hover:text-[#FF6A13]",
                    localAnchors && link.href === activeHash
                      ? "border-l-2 border-[#FF6A13] bg-[#FF6A13]/5 text-[var(--pf-fg)]"
                      : "text-[var(--pf-fg-muted)]",
                  )}
                  onClick={(event) => {
                    handleAnchorClick(link.href)(event);
                    setMobileOpen(false);
                  }}
                >
                  {t(link.labelKey)}
                </a>

                {/* Sur mobile le menu reste déplié : pas de survol pour l'ouvrir */}
                {link.items?.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "ml-3 flex items-center gap-2.5 border-l border-[var(--pf-border)] py-2 pl-4 text-[13px] transition-colors hover:text-[#FF6A13]",
                        pathname === item.href
                          ? "text-[#FF6A13]"
                          : "text-[var(--pf-fg-muted)]",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={14} />
                      {t(item.labelKey)}
                    </a>
                  );
                })}
              </Fragment>
            ))}

            {/* Mobile lang + theme */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center border border-[var(--pf-border)] text-[var(--pf-fg-muted)] sm:hidden"
                style={{ background: "var(--pf-bg-card)" }}
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <a
              href={contactHref}
              className="mt-2 inline-flex items-center justify-center bg-[#FF6A13] px-5 py-2.5 text-sm font-semibold text-[var(--pf-on-accent)] transition-colors hover:bg-[#ff8232] sm:hidden"
              onClick={() => setMobileOpen(false)}
            >
              {t("footer.links.contact")} →
            </a>
          </div>
        </div>
      </Collapse>
    </nav>
  );
}
