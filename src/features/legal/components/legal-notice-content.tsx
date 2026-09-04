'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { LegalControls } from './legal-controls';

const content = {
  en: {
    back: 'Back to home',
    sections: [
      {
        title: 'Site Publisher',
        body: 'PROSPERIFY, a simplified joint-stock company (SAS) with share capital of EUR 600. Registered office: 40 rue de Bourgogne, 69009 Lyon, France. Registered with the Lyon Trade and Companies Register under RCS Lyon 100 136 753. SIREN: 100136753. SIRET: 10013675300017. Intra-community VAT: FR10100136753. Email: contact@prosperify.app.',
      },
      {
        title: 'Publication Director',
        body: 'The publication director is the legal representative of PROSPERIFY SAS, reachable at contact@prosperify.app.',
      },
      {
        title: 'Hosting',
        body: 'Application and document hosting is provided by evps.net, with infrastructure located in France. Certain ancillary services are provided by Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, United States, under Standard Contractual Clauses. Details of sub-processors are set out on our GDPR page.',
      },
      {
        title: 'Intellectual Property',
        body: 'The entire site, including its structure, texts, graphics, logos, software and databases, is the exclusive property of PROSPERIFY SAS or of its licensors, and is protected by French and international intellectual property law. Any reproduction, representation, adaptation or exploitation, in whole or in part, without prior written authorization is prohibited.',
      },
      {
        title: 'Personal Data',
        body: 'Processing of personal data carried out through this site is described in our Privacy Policy and on our GDPR page. For any request relating to your data, contact dpo@prosperify.app.',
      },
      {
        title: 'Cookies',
        body: 'Only strictly necessary cookies are placed without consent. Audience measurement cookies are placed only after your explicit consent and can be withdrawn at any time from the cookie settings. See our GDPR page for details.',
      },
      {
        title: 'Liability',
        body: 'PROSPERIFY SAS works to keep the information published on this site accurate and up to date, but gives no warranty that it is free of error or omission. Hypertext links to third-party sites do not engage the responsibility of PROSPERIFY SAS for their content.',
      },
      {
        title: 'Applicable Law',
        body: 'This site and these legal notices are governed by French law. Any dispute falls within the jurisdiction of the competent courts of Lyon, France.',
      },
    ],
    title: 'Legal Notice',
    updated: 'Last updated: August 2026',
  },
  fr: {
    back: "Retour à l'accueil",
    sections: [
      {
        title: 'Éditeur du site',
        body: 'PROSPERIFY, société par actions simplifiée (SAS) au capital social de 600 EUR. Siège social : 40 rue de Bourgogne, 69009 Lyon, France. Immatriculée au registre du commerce et des sociétés de Lyon sous le numéro RCS Lyon 100 136 753. SIREN : 100136753. SIRET : 10013675300017. TVA intracommunautaire : FR10100136753. Courriel : contact@prosperify.app.',
      },
      {
        title: 'Directeur de la publication',
        body: 'Le directeur de la publication est le représentant légal de PROSPERIFY SAS, joignable à contact@prosperify.app.',
      },
      {
        title: 'Hébergement',
        body: "L'hébergement applicatif et documentaire est assuré par evps.net, avec une infrastructure située en France. Certains services annexes sont fournis par Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis, encadrés par les clauses contractuelles types. Le détail des sous-traitants figure sur notre page RGPD.",
      },
      {
        title: 'Propriété intellectuelle',
        body: "L'ensemble du site, y compris sa structure, ses textes, graphismes, logos, logiciels et bases de données, est la propriété exclusive de PROSPERIFY SAS ou de ses concédants, et est protégé par le droit français et international de la propriété intellectuelle. Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.",
      },
      {
        title: 'Données personnelles',
        body: 'Les traitements de données personnelles réalisés via ce site sont décrits dans notre politique de confidentialité et sur notre page RGPD. Pour toute demande relative à vos données, contactez dpo@prosperify.app.',
      },
      {
        title: 'Cookies',
        body: "Seuls les cookies strictement nécessaires sont déposés sans consentement. Les cookies de mesure d'audience ne sont déposés qu'après votre consentement explicite et peuvent être retirés à tout moment depuis le paramétrage des cookies. Voir notre page RGPD pour le détail.",
      },
      {
        title: 'Responsabilité',
        body: "PROSPERIFY SAS s'efforce de maintenir exactes et à jour les informations publiées sur ce site, sans garantir qu'elles soient exemptes d'erreur ou d'omission. Les liens hypertextes vers des sites tiers n'engagent pas la responsabilité de PROSPERIFY SAS quant à leur contenu.",
      },
      {
        title: 'Droit applicable',
        body: 'Le présent site et les présentes mentions légales sont régis par le droit français. Tout litige relève de la compétence des tribunaux de Lyon, France.',
      },
    ],
    title: 'Mentions légales',
    updated: 'Dernière mise à jour : août 2026',
  },
};

export default function LegalNoticeContent() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
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
              <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
