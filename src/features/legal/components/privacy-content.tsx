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
        title: 'Data Controller',
        body: 'Prosperify SAS, 40 rue de Bourgogne, 69009 Lyon, France. SIREN: 100136753. contact@prosperify.app.',
      },
      {
        title: 'Data Protection Officer',
        body: 'For any question or request relating to your personal data, contact our Data Protection Officer at dpo@prosperify.app. We respond within 30 days.',
      },
      {
        title: 'Data We Collect',
        body: 'When you use our contact form or book a meeting, we collect: name, email, company name, phone number (optional), and your message. When you use our platform, we collect usage data necessary for service operation.',
      },
      {
        title: 'Purpose and Legal Basis',
        body: 'We process your data to respond to your inquiry, schedule meetings, and provide our services. Our legal basis is legitimate interest (Article 6(1)(f) GDPR) for B2B inquiries and contract performance (Article 6(1)(b)) for platform users.',
      },
      {
        title: 'Data Retention',
        body: 'Contact form data is retained for 36 months after the last contact. Platform data is retained for the duration of the contract plus applicable legal retention periods. Usage logs are anonymized after 13 months.',
      },
      {
        title: 'Data Recipients and International Transfers',
        body: "Your data may be shared with: Google LLC (Google Calendar and Google Meet for meeting scheduling, and Google Analytics and Google Tag Manager for audience measurement, subject to your consent) - data is transferred to the US under Google's Data Processing Agreement incorporating EU Standard Contractual Clauses (2021/914). evps.net (cloud infrastructure) processes data in France. All sub-processors are bound by contractual data protection obligations.",
      },
      {
        title: 'Automated Decision-Making',
        body: 'We do not use your personal data for automated decision-making or profiling that produces legal effects concerning you or similarly significantly affects you (Article 22 GDPR). Documents you process on the platform are analyzed only to produce the answers you request, and the model is never trained on them.',
      },
      {
        title: 'Your Rights',
        body: "Under GDPR, you have the right to: access your data, rectify inaccurate data, erase your data ('right to be forgotten'), restrict processing, data portability, object to processing, withdraw consent at any time, and lodge a complaint with a supervisory authority. To exercise these rights, contact dpo@prosperify.app. Requests are free of charge and we respond within one month.",
      },
      {
        title: 'Cookies',
        body: 'Strictly necessary cookies for session management and security are always active. Audience measurement cookies set by Google Analytics and Google Tag Manager are placed only after your explicit consent, and you can withdraw that consent at any time from the cookie settings. See our GDPR page for details.',
      },
      {
        title: 'Security',
        body: 'We implement appropriate technical and organizational measures to protect your data, including encryption at rest and in transit, access controls, and regular security reviews.',
      },
      {
        title: 'Complaints',
        body: "You have the right to lodge a complaint with the CNIL (Commission Nationale de l'Informatique et des Libertés), 3 Place de Fontenoy, 75007 Paris, France - cnil.fr.",
      },
      {
        title: 'Providing Your Data',
        body: 'Providing the information in our contact form is optional, but without it we cannot respond to your request. For platform users, the data needed to operate the service is required to perform the contract.',
      },
      {
        title: 'Data Breach Notification',
        body: 'If a personal data breach is likely to result in a risk to your rights, we notify the CNIL within 72 hours of becoming aware of it and inform you directly without undue delay where the risk is high (Articles 33 and 34 GDPR).',
      },
      {
        title: 'Updates',
        body: 'This policy was last updated August 2026. We will notify you of material changes via our website.',
      },
    ],
    title: 'Privacy Policy',
    updated: 'Last updated: August 2026',
  },
  fr: {
    back: "Retour à l'accueil",
    sections: [
      {
        title: 'Responsable du traitement',
        body: 'Prosperify SAS, 40 rue de Bourgogne, 69009 Lyon, France. SIREN : 100136753. contact@prosperify.app.',
      },
      {
        title: 'Délégué à la protection des données',
        body: 'Pour toute question ou demande relative à vos données personnelles, contactez notre délégué à la protection des données à dpo@prosperify.app. Nous répondons sous 30 jours.',
      },
      {
        title: 'Données collectées',
        body: "Lorsque vous utilisez notre formulaire de contact ou réservez un rendez-vous, nous collectons : nom, email, nom d'entreprise, numéro de téléphone (optionnel) et votre message.",
      },
      {
        title: 'Finalité et base légale',
        body: 'Nous traitons vos données pour répondre à votre demande, planifier des rendez-vous et fournir nos services. Base légale : intérêt légitime (Art. 6(1)(f) RGPD) pour les demandes B2B, exécution du contrat (Art. 6(1)(b)) pour les utilisateurs.',
      },
      {
        title: 'Conservation des données',
        body: "Données de contact : 36 mois après dernier contact. Données plateforme : durée du contrat + obligations légales. Journaux d'usage : anonymisés après 13 mois.",
      },
      {
        title: 'Destinataires et transferts internationaux',
        body: "Vos données peuvent être partagées avec Google LLC (Google Calendar et Google Meet pour la planification de rendez-vous, Google Analytics et Google Tag Manager pour la mesure d'audience, sous réserve de votre consentement) - transfert vers les États-Unis encadré par les clauses contractuelles types UE (2021/914). evps.net (infrastructure cloud) traite les données en France. Tous les sous-traitants sont liés par des obligations contractuelles de protection des données.",
      },
      {
        title: 'Décision automatisée',
        body: "Nous n'utilisons pas vos données personnelles à des fins de décision automatisée ou de profilage produisant des effets juridiques vous concernant ou vous affectant de manière significative (article 22 RGPD). Les documents traités sur la plateforme sont analysés uniquement pour produire les réponses que vous demandez, et le modèle n'est jamais entraîné sur ces documents.",
      },
      {
        title: 'Vos droits',
        body: "Conformément au RGPD : accès, rectification, effacement, limitation, portabilité, opposition, retrait du consentement à tout moment et réclamation auprès d'une autorité de contrôle. Pour exercer ces droits, contactez dpo@prosperify.app. Les demandes sont gratuites et nous répondons sous un mois.",
      },
      {
        title: 'Cookies',
        body: "Les cookies strictement nécessaires à la session et à la sécurité sont toujours actifs. Les cookies de mesure d'audience déposés par Google Analytics et Google Tag Manager ne le sont qu'après votre consentement explicite, que vous pouvez retirer à tout moment depuis le paramétrage des cookies. Voir notre page RGPD pour le détail.",
      },
      {
        title: 'Sécurité',
        body: "Chiffrement au repos et en transit, contrôles d'accès, audits de sécurité réguliers.",
      },
      {
        title: 'Réclamations',
        body: 'Vous pouvez saisir la CNIL : 3 Place de Fontenoy, 75007 Paris - cnil.fr.',
      },
      {
        title: 'Fourniture de vos données',
        body: "La saisie des informations du formulaire de contact est facultative, mais sans elles nous ne pouvons pas répondre à votre demande. Pour les utilisateurs de la plateforme, les données nécessaires au fonctionnement du service sont requises pour l'exécution du contrat.",
      },
      {
        title: 'Notification de violation',
        body: "En cas de violation de données susceptible d'engendrer un risque pour vos droits, nous notifions la CNIL dans les 72 heures suivant sa constatation et vous informons directement dans les meilleurs délais lorsque le risque est élevé (articles 33 et 34 RGPD).",
      },
      {
        title: 'Mises à jour',
        body: 'Mise à jour : août 2026. Les modifications importantes seront communiquées via notre site.',
      },
    ],
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : août 2026',
  },
};

export default function PrivacyContent() {
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
