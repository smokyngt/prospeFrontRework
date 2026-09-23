"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ContactForm } from "@/features/contact/components";
import { HeroDemoPicker } from "@/features/landing/components/demo/hero-demo-picker";
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSectionWrapper() {
  const { t } = useTranslation();
  return (
    <section
      id="hero"
      className="px-5 sm:px-8 lg:px-12"
      style={{
        paddingTop: "clamp(116px, 15vh, 160px)",
        paddingBottom: "var(--pf-section-space)",
        background: "var(--pf-column-bg)",
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
          <p className="mt-5 max-w-[620px] leading-[1.65] text-[var(--pf-fg-muted)]" style={{ fontSize: "clamp(1rem, 1.35vw, 1.12rem)" }}>
            {t("hero.subtitle")}
          </p>
          <div className="mt-[var(--pf-cta-gap)] flex flex-wrap gap-3">
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

  return (
    <section
      id="contact"
      className="px-5 sm:px-8 lg:px-12"
      style={{
        paddingTop: "var(--pf-section-space)",
        paddingBottom: "var(--pf-section-space)",
        background: "var(--pf-column-bg)",
      }}
    >
      <div
        className="grid grid-cols-1 gap-px border border-[var(--pf-border)] lg:grid-cols-2"
        style={{ background: "var(--pf-border)" }}
      >
        <div
          className="text-center"
          style={{
            padding: "clamp(20px,2.4vw,32px)",
            background: "var(--pf-bg-card)",
          }}
        >
          <SectionBanner label={t("sectionLabels.contact")} />
          <h2
            className="font-bold leading-[1.08] tracking-[-0.02em] text-[var(--pf-fg)]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
          >
            {t("contact.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-[0.95rem] leading-[1.6] text-[var(--pf-fg-muted)]">
            {t("contact.lead")}
          </p>
        </div>
        <div
          style={{
            padding: "clamp(20px,2.4vw,32px)",
            background: "var(--pf-bg-card-3)",
          }}
        >
          <ContactForm />
        </div>
      </div>
    </section>
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
      <LandingNavbar />

      <main className="relative z-10 [overflow-anchor:none]">
        {/* Colonne bordée — toutes les sections */}
        <div className="mx-auto max-w-[1360px] border-x border-[var(--pf-border)] [overflow-anchor:none]">
          <HeroSectionWrapper />

          <section
            id="workflow"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.workflow")} />
            <WorkflowSection />
          </section>

          <section
            id="features"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.features")} />
            <ProsperifyFeatures />
          </section>

          <section
            id="products"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.products")} />
            <ProductSection />
          </section>

          <section
            id="sovereignty"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.integration")} />
            <IntegrationSection />
          </section>

          <section
            id="security"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.security")} />
            <SecuritySection />
          </section>

          <section
            id="faq"
            className="px-5 sm:px-8 lg:px-12"
            style={{
              paddingTop: "var(--pf-section-space)",
              paddingBottom: "var(--pf-section-space)",
              background: "var(--pf-column-bg)",
            }}
          >
            <SectionBanner label={t("sectionLabels.faq")} />
            <FAQSection />
          </section>

          <ContactSectionWrapper />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
