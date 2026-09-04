'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { uiLanguage } from '@/features/landing/lib/theme';

import { LegalControls } from './legal-controls';

const content = {
  en: {
    back: 'Back to home',
    sections: [
      {
        title: 'Your Rights Under GDPR',
        body: 'The General Data Protection Regulation (GDPR) grants you the following rights:',
        items: [
          'Right to access - request a copy of your data',
          'Right to rectification - request correction of inaccurate data',
          'Right to erasure - request deletion of your data',
          'Right to restrict processing - limit how we use your data',
          'Right to data portability - receive your data in a machine-readable format',
          'Right to object - object to processing based on legitimate interest',
          'Right to withdraw consent - at any time, without affecting prior processing',
          'Right to lodge a complaint - with the CNIL or your local supervisory authority',
        ],
      },
      {
        title: 'Data Protection Officer',
        body: 'Contact our Data Protection Officer at dpo@prosperify.app. Requests are handled free of charge. We may ask for proof of identity before acting on a request. We respond within one month, extendable by two further months for complex requests, in which case we tell you why.',
      },
      {
        title: 'Cookie Policy',
        body: 'Two categories of cookies are used. Strictly necessary cookies, for session management and security, are always active and require no consent. Audience measurement cookies, set by Google Analytics and Google Tag Manager, are placed only after your explicit consent and never before it. You can change or withdraw your choice at any time via the cookie settings button, with no effect on cookies already placed before withdrawal.',
      },
      {
        title: 'Data Processing Agreement',
        body: 'Enterprise customers may request a DPA compliant with Article 28 GDPR at dpo@prosperify.app.',
      },
      {
        title: 'Sub-processors',
        body: 'Google LLC (cloud infrastructure, Calendar, Meet, and audience measurement via Google Analytics and Google Tag Manager) - United States, covered by Standard Contractual Clauses. evps.net (cloud infrastructure) - France. All are bound by contractual data protection obligations. We inform you of any change of sub-processor.',
      },
      {
        title: 'Security Measures',
        body: 'Encryption at rest (AES-256) and in transit (TLS 1.3), role-based access controls, audit logging, regular security assessments, incident response procedures.',
      },
      {
        title: 'International Transfers',
        body: "When data is transferred outside the EU (e.g., Google services), we rely on Standard Contractual Clauses (2021/914) and Google's DPA.",
      },
      {
        title: 'Complaint to CNIL',
        body: 'You may lodge a complaint with the CNIL: 3 Place de Fontenoy, 75007 Paris - cnil.fr - +33 1 53 73 22 22.',
      },
      {
        title: 'Personal Data Breach',
        body: 'If a breach is likely to result in a risk to your rights and freedoms, we notify the CNIL within 72 hours of becoming aware of it, and we inform affected individuals without undue delay where the risk is high (Articles 33 and 34 GDPR). Breaches are logged internally regardless of whether notification is required.',
      },
      {
        title: 'Scope of Processing',
        body: 'Our services are intended for professional use. We do not knowingly collect personal data relating to minors. We do not sell personal data, and we do not use it for advertising.',
      },
      {
        title: 'Data Retention Schedule',
        body: 'Contact form data: 36 months after last contact. Usage data: anonymized after 13 months. Contract data: contract duration + 5 years. Backups: 90 days maximum. Logs: 12 months.',
      },
    ],
    title: 'GDPR Compliance',
    updated: 'Last updated: August 2026',
  },
  fr: {
    back: "Retour à l'accueil",
    sections: [
      {
        title: 'Vos droits RGPD',
        body: 'Le Règlement Général sur la Protection des Données (RGPD) vous accorde les droits suivants :',
        items: [
          "Droit d'accès - obtenir une copie de vos données",
          'Droit de rectification - corriger des données inexactes',
          "Droit à l'effacement - demander la suppression de vos données",
          "Droit à la limitation - limiter l'utilisation de vos données",
          'Droit à la portabilité - recevoir vos données dans un format structuré',
          "Droit d'opposition - vous opposer au traitement basé sur l'intérêt légitime",
          'Droit de retirer votre consentement - à tout moment, sans remettre en cause les traitements déjà effectués',
          'Droit de réclamation - auprès de la CNIL ou de votre autorité de contrôle locale',
        ],
      },
      {
        title: 'Délégué à la protection des données',
        body: "Contactez notre délégué à la protection des données à dpo@prosperify.app. Les demandes sont traitées gratuitement. Une preuve d'identité peut vous être demandée avant traitement. Nous répondons sous un mois, prorogeable de deux mois pour les demandes complexes, auquel cas nous vous en informons.",
      },
      {
        title: 'Politique des cookies',
        body: "Deux catégories de cookies sont utilisées. Les cookies strictement nécessaires, pour la session et la sécurité, sont toujours actifs et ne requièrent pas de consentement. Les cookies de mesure d'audience, déposés par Google Analytics et Google Tag Manager, ne le sont qu'après votre consentement explicite et jamais avant. Vous pouvez modifier ou retirer votre choix à tout moment via le bouton de paramétrage des cookies, sans effet sur les cookies déjà déposés avant le retrait.",
      },
      {
        title: 'Accord de traitement des données',
        body: "Les clients entreprise peuvent demander un DPA conforme à l'article 28 RGPD à dpo@prosperify.app.",
      },
      {
        title: 'Sous-traitants',
        body: "Google LLC (infrastructure cloud, Calendar, Meet, et mesure d'audience via Google Analytics et Google Tag Manager) - États-Unis, couvert par les clauses contractuelles types. evps.net (infrastructure cloud) - France. Tous sont liés par des obligations contractuelles de protection des données. Nous vous informons de tout changement de sous-traitant.",
      },
      {
        title: 'Mesures de sécurité',
        body: "Chiffrement au repos (AES-256) et en transit (TLS 1.3), contrôles d'accès basés sur les rôles, journalisation d'audit, évaluations de sécurité régulières.",
      },
      {
        title: 'Transferts internationaux',
        body: 'Lorsque des données sont transférées hors UE, nous nous appuyons sur les clauses contractuelles types (2021/914) et le DPA de Google.',
      },
      {
        title: 'Réclamation auprès de la CNIL',
        body: 'Vous pouvez saisir la CNIL : 3 Place de Fontenoy, 75007 Paris - cnil.fr - +33 1 53 73 22 22.',
      },
      {
        title: 'Violation de données',
        body: "En cas de violation susceptible d'engendrer un risque pour vos droits et libertés, nous notifions la CNIL dans les 72 heures suivant sa constatation et informons les personnes concernées dans les meilleurs délais lorsque le risque est élevé (articles 33 et 34 RGPD). Toute violation est consignée en interne, qu'une notification soit requise ou non.",
      },
      {
        title: 'Portée du traitement',
        body: 'Nos services sont destinés à un usage professionnel. Nous ne collectons pas sciemment de données relatives à des mineurs. Nous ne vendons pas de données personnelles et ne les utilisons pas à des fins publicitaires.',
      },
      {
        title: 'Calendrier de conservation',
        body: "Données de contact : 36 mois. Données d'usage : anonymisées après 13 mois. Données contractuelles : durée du contrat + 5 ans. Sauvegardes : 90 jours max. Journaux : 12 mois.",
      },
    ],
    title: 'Conformité RGPD',
    updated: 'Dernière mise à jour : août 2026',
  },
};

export default function GdprContent() {
  const { i18n } = useTranslation();
  const lang = uiLanguage(i18n.language);
  const copy = content[lang];

  return (
    <main className="min-h-screen bg-white pt-24 pb-32 dark:bg-neutral-950">
      <div className="fixed right-6 top-4 z-50 sm:right-8 sm:top-5">
        <LegalControls />
      </div>
      <div className="mx-auto max-w-3xl px-6 sm:px-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
          title={copy.back}
        >
          &larr; {copy.back}
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{copy.updated}</p>
        <div className="mt-12 space-y-10">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">
                {section.title}
              </h2>
              {'items' in section && section.items ? (
                <>
                  <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">
                    {section.body}
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-neutral-600 dark:text-neutral-400">
                    {section.items.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">
                  {section.body}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
