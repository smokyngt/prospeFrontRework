"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ContactForm } from "@/features/contact/components";
import { HeroDemoPicker } from "@/features/landing/components/demo/hero-demo-picker";
import { RevealSection } from "@/features/landing/components/reveal";
import { FAQSection } from "@/features/landing/components/faq";
import { ProsperifyFeatures } from "@/features/landing/components/features";
import { LandingFooter } from "@/features/landing/components/footer";
import { IntegrationSection } from "@/features/landing/components/integration";
import { LandingNavbar } from "@/features/landing/components/navigation";
import { ProductSection } from "@/features/landing/components/products";
import { SecuritySection } from "@/features/landing/components/security";
import { WorkflowSection } from "@/features/landing/components/workflow";
import i18n from "@/lib/i18n";

type LandingPageProps = {
  lang?: string;
};

const SECTION_IDS = [
  "hero",
  "workflow",
  "features",
  "products",
  "sovereignty",
  "security",
  "faq",
  "contact",
];

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Bandeau discret au-dessus d'un titre de section — le nom de la section, sans numéro. */
function SectionBanner({ label }: { label: string }) {
  return (
    <div
      className="mx-auto mb-6 flex w-fit items-center border px-3.5 py-1.5"
      style={{ borderColor: "var(--pf-accent-dim-border)", background: "var(--pf-accent-bg)" }}
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF6A13]">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px" style={{ background: "var(--pf-border)" }} />;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSectionWrapper() {
  const { t } = useTranslation();
  return (
    <section
      id="hero"
      className="px-5 sm:px-8 lg:px-12"
      style={{
        paddingTop: "clamp(116px, 15vh, 160px)",
        paddingBottom: "clamp(56px, 7vh, 88px)",
      }}
    >
      <div className="flex flex-wrap items-center gap-10 lg:gap-12">
        {/* Left: copy */}
        <div className="min-w-0 max-w-[560px] flex-1 basis-80">
          <h1
            className="m-0 font-extrabold leading-[1.02] tracking-[-0.03em] text-[var(--pf-fg)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
          >
            {t("hero.titleLine1")}{" "}
            <span className="text-[#FF6A13]">{t("hero.titleHighlight")}</span>
            <br />
            {t("hero.titleLine2")}
          </h1>
          <p
            className="mt-6 max-w-[620px] leading-[1.65] text-[var(--pf-fg-muted)]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
          >
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#FF6A13] px-6 py-3.5 text-sm font-semibold text-[var(--pf-on-accent)] transition-colors hover:bg-[#ff8232]"
            >
              {t("hero.primaryCta")} →
            </a>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 border px-6 py-3.5 text-sm font-semibold text-[var(--pf-fg)] transition-colors hover:border-[#FF6A13]"
              style={{
                borderColor: "var(--pf-border-2)",
                background: "transparent",
              }}
            >
              {t("hero.secondaryCta")}
            </a>
          </div>
        </div>

        {/* Right: démo interactive — INCHANGÉE */}
        <div
          className="min-w-0 flex-1 basis-96 border border-[var(--pf-border)] overflow-hidden"
          style={{
            animation: "pf-fadeUp 0.6s ease",
            boxShadow: "var(--pf-demo-shadow)",
          }}
        >
          <HeroDemoPicker />
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSectionWrapper() {
  const { t } = useTranslation();
  const checks = t("contact.checks", { returnObjects: true }) as string[];

  return (
    <RevealSection
      id="contact"
      className="px-5 sm:px-8 lg:px-12"
      style={{
        paddingTop: "clamp(72px, 10vh, 112px)",
        paddingBottom: "clamp(72px, 10vh, 112px)",
      }}
    >
      <div
        className="grid grid-cols-1 gap-px border border-[var(--pf-border)] lg:grid-cols-2"
        style={{ background: "var(--pf-border)" }}
      >
        <div
          className="text-center"
          style={{
            padding: "clamp(28px,3vw,44px)",
            background: "var(--pf-bg-card)",
          }}
        >
          <SectionBanner label={t("sectionLabels.contact")} />
          <h2
            className="font-bold leading-[1.08] tracking-[-0.02em] text-[var(--pf-fg)]"
            style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)" }}
          >
            {t("contact.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-[440px] text-base leading-[1.65] text-[var(--pf-fg-muted)]">
            {t("contact.lead")}
          </p>
          <div className="mx-auto mt-7 flex w-fit flex-col gap-2">
            {checks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border px-3.5 py-3 text-sm font-medium text-[var(--pf-fg)]"
                style={{
                  borderColor: "var(--pf-border)",
                  background: "var(--pf-bg-card-2)",
                }}
              >
                <span className="h-2 w-2 bg-[#FF6A13]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            padding: "clamp(28px,3vw,44px)",
            background: "var(--pf-bg-card-3)",
          }}
        >
          <ContactForm />
        </div>
      </div>
    </RevealSection>
  );
}

// ─── Section navigator ────────────────────────────────────────────────────────

function SectionNavigator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionIds = useMemo(() => SECTION_IDS, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        if (visible.target.id) {
          const nextIndex = sectionIds.indexOf(visible.target.id);
          if (nextIndex >= 0) {
            setActiveIndex(nextIndex);
          }
        }
      },
      { rootMargin: "-34% 0px -48% 0px", threshold: [0.08, 0.18, 0.32] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToIndex = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), sectionIds.length - 1);
    document
      .getElementById(sectionIds[nextIndex])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed bottom-6 right-5 z-40 hidden flex-col border border-[var(--pf-border)] p-1 backdrop-blur-md sm:flex"
      style={{ background: "var(--pf-widget-bg)" }}
    >
      <button
        type="button"
        aria-label="Previous section"
        className="flex h-10 w-10 items-center justify-center text-[var(--pf-fg-dim)] transition-colors hover:bg-[#FF6A13]/10 hover:text-[#FF6A13] disabled:pointer-events-none disabled:opacity-30"
        disabled={activeIndex === 0}
        onClick={() => scrollToIndex(activeIndex - 1)}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <div
        className="mx-auto my-1 h-px w-6"
        style={{ background: "var(--pf-border)" }}
      />
      <button
        type="button"
        aria-label="Next section"
        className="flex h-10 w-10 items-center justify-center text-[var(--pf-fg-dim)] transition-colors hover:bg-[#FF6A13]/10 hover:text-[#FF6A13] disabled:pointer-events-none disabled:opacity-30"
        disabled={activeIndex === sectionIds.length - 1}
        onClick={() => scrollToIndex(activeIndex + 1)}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function LandingPage({ lang }: LandingPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(() => undefined);
    }
  }, [lang]);

  return (
    <div
      className="relative min-h-screen [overflow-anchor:none]"
      style={{ background: "var(--pf-bg)" }}
    >
      {/* Grille de fond statique */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--pf-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--pf-grid-line) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Halo orange */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 44% at 50% -6%, rgba(255,106,19,0.07), transparent 62%)",
        }}
      />

      <LandingNavbar />
      <SectionNavigator />

      <main className="relative z-10 [overflow-anchor:none]">
        {/* Colonne bordée — toutes les sections */}
        <div
          className="mx-auto max-w-[1360px] border-x border-[var(--pf-border)] [overflow-anchor:none]"
          style={{ background: "var(--pf-column-bg)" }}
        >
          <HeroSectionWrapper />

          <Divider />

          <RevealSection
            id="workflow"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.workflow")} />
            <WorkflowSection />
          </RevealSection>

          <Divider />

          <RevealSection
            id="features"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.features")} />
            <ProsperifyFeatures />
          </RevealSection>

          <Divider />

          <RevealSection
            id="products"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.products")} />
            <ProductSection />
          </RevealSection>

          <Divider />

          <RevealSection
            id="sovereignty"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.integration")} />
            <IntegrationSection />
          </RevealSection>

          <Divider />

          <RevealSection
            id="security"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.security")} />
            <SecuritySection />
          </RevealSection>

          <Divider />

          <RevealSection
            id="faq"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "clamp(72px, 10vh, 112px)",
              paddingBottom: "clamp(72px, 10vh, 112px)",
            }}
          >
            <SectionBanner label={t("sectionLabels.faq")} />
            <FAQSection />
          </RevealSection>

          <Divider />

          <ContactSectionWrapper />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
