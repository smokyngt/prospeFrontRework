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
        title: 'Service Description',
        body: 'Prosperify provides a document intelligence platform that enables organizations to query, search, and analyze their documents with sourced answers, governed access, and verifiable citations.',
      },
      {
        title: 'Scope and Order of Precedence',
        body: 'These terms govern your use of the Prosperify website and platform. Where you have signed a separate service agreement or order form with Prosperify SAS, that document prevails over these terms in the event of a conflict.',
      },
      {
        title: 'Acceptable Use',
        body: 'You agree not to use the service unlawfully, to attempt to access data outside your authorized perimeter, to reverse engineer or extract the underlying models, to resell access without our written agreement, or to upload content you have no right to process. We may suspend access without notice where use threatens the security or integrity of the service, and we will tell you why as soon as reasonably possible.',
      },
      {
        title: 'Your Responsibilities for Uploaded Content',
        body: 'You confirm that you hold the rights and, where required, the legal basis to upload and process the documents you place in the service, including any personal data they contain. You remain the data controller for that content. Where we process personal data on your behalf, a data processing agreement compliant with Article 28 GDPR governs that processing and is available at dpo@prosperify.app.',
      },
      {
        title: 'Account Registration',
        body: 'You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.',
      },
      {
        title: 'Data Processing',
        body: 'You retain all rights to your data. Prosperify processes your data solely to provide the service and does not use your data to train general AI models. Data is processed within the agreed deployment perimeter.',
      },
      {
        title: 'Service Levels',
        body: 'Prosperify will use commercially reasonable efforts to make the service available. Specific SLAs are defined in your service agreement.',
      },
      {
        title: 'Intellectual Property',
        body: 'The Prosperify platform, including its software, algorithms, and user interface, is the intellectual property of Prosperify SAS.',
      },
      {
        title: 'Nature of Outputs',
        body: 'Prosperify produces sourced answers with citations to support review by qualified professionals. Outputs are decision-support, not legal, financial, tax or medical advice, and they do not replace professional judgement. You are responsible for verifying any answer against the cited source before relying on it. We do not warrant that outputs are complete or error-free.',
      },
      {
        title: 'Confidentiality',
        body: 'Each party will keep the other party confidential information secret and use it only to perform this agreement. This obligation survives termination for five years. It does not apply to information that is or becomes public through no fault of the receiving party, or that must be disclosed by law.',
      },
      {
        title: 'Limitation of Liability',
        body: "Prosperify's liability is limited to the amount paid for the service in the 12 months preceding the claim. Neither party is liable for indirect or consequential loss, including loss of profit, revenue or data. Nothing in these terms excludes liability that cannot be excluded under applicable law, including in cases of fraud, gross negligence or personal injury.",
      },
      {
        title: 'Termination',
        body: 'Either party may terminate with written notice. Either party may also terminate for material breach if the breach is not cured within 30 days of written notice. On termination, your data is exported or deleted within 30 days according to your instructions, after which it is removed from active systems and purged from backups within 90 days.',
      },
      {
        title: 'Changes to These Terms',
        body: 'We may update these terms to reflect changes to the service or to legal requirements. We publish the updated version on this page with a new effective date, and we notify account holders of material changes before they take effect.',
      },
      {
        title: 'Force Majeure',
        body: 'Neither party is liable for a failure to perform caused by an event beyond its reasonable control, including network or infrastructure failures outside its systems, provided it informs the other party and works to limit the effects.',
      },
      {
        title: 'Governing Law',
        body: 'These terms are governed by French law. Any disputes shall be submitted to the competent courts of Lyon, France.',
      },
      {
        title: 'Contact',
        body: 'Prosperify SAS, 40 rue de Bourgogne, 69009 Lyon, France. contact@prosperify.app. SIREN: 100136753.',
      },
    ],
    title: 'Terms of Service',
    updated: 'Last updated: August 2026',
  },
  fr: {
    back: "Retour à l'accueil",
    sections: [
      {
        title: 'Description du service',
        body: "Prosperify est une plateforme d'intelligence documentaire qui permet aux organisations d'interroger et d'analyser leurs documents avec des réponses sourcées et des accès gouvernés.",
      },
      {
        title: 'Portée et ordre de priorité',
        body: 'Les présentes conditions régissent votre utilisation du site et de la plateforme Prosperify. Lorsque vous avez signé un contrat de service ou un bon de commande distinct avec Prosperify SAS, ce document prévaut sur les présentes conditions en cas de contradiction.',
      },
      {
        title: 'Usage acceptable',
        body: "Vous vous engagez à ne pas utiliser le service de manière illicite, à ne pas tenter d'accéder à des données hors de votre périmètre autorisé, à ne pas rétro-concevoir ni extraire les modèles sous-jacents, à ne pas revendre l'accès sans notre accord écrit, et à ne pas déposer de contenu que vous n'avez pas le droit de traiter. Nous pouvons suspendre l'accès sans préavis lorsque l'usage menace la sécurité ou l'intégrité du service, en vous en indiquant le motif dans les meilleurs délais.",
      },
      {
        title: 'Vos responsabilités sur les contenus déposés',
        body: "Vous confirmez détenir les droits et, le cas échéant, la base légale permettant de déposer et de faire traiter les documents que vous placez dans le service, y compris les données personnelles qu'ils contiennent. Vous restez responsable de traitement pour ces contenus. Lorsque nous traitons des données personnelles pour votre compte, un accord de traitement conforme à l'article 28 RGPD encadre ce traitement et peut être demandé à dpo@prosperify.app.",
      },
      {
        title: 'Inscription',
        body: 'Vous devez fournir des informations exactes lors de la création de votre compte. Vous êtes responsable de la confidentialité de vos identifiants.',
      },
      {
        title: 'Traitement des données',
        body: "Vous conservez tous les droits sur vos données. Prosperify traite vos données uniquement pour fournir le service et ne les utilise pas pour entraîner des modèles d'IA généraux.",
      },
      {
        title: 'Niveaux de service',
        body: "Prosperify s'efforce de maintenir le service disponible. Les SLA spécifiques sont définis dans votre contrat.",
      },
      {
        title: 'Propriété intellectuelle',
        body: 'La plateforme Prosperify, y compris ses logiciels, algorithmes et interface utilisateur, est la propriété intellectuelle de Prosperify SAS.',
      },
      {
        title: 'Nature des réponses',
        body: "Prosperify produit des réponses sourcées et citées destinées à être revues par des professionnels qualifiés. Ces réponses constituent une aide à la décision et non un conseil juridique, financier, fiscal ou médical, et ne remplacent pas le jugement professionnel. Il vous appartient de vérifier chaque réponse au regard de la source citée avant de vous en prévaloir. Nous ne garantissons pas que les réponses soient complètes ou exemptes d'erreur.",
      },
      {
        title: 'Confidentialité',
        body: "Chaque partie préserve la confidentialité des informations confidentielles de l'autre et ne les utilise que pour l'exécution du contrat. Cette obligation survit cinq ans à la fin du contrat. Elle ne s'applique pas aux informations devenues publiques sans faute de la partie destinataire ou dont la divulgation est imposée par la loi.",
      },
      {
        title: 'Limitation de responsabilité',
        body: "La responsabilité de Prosperify est limitée au montant payé pour le service dans les 12 mois précédant la réclamation. Aucune partie n'est responsable des dommages indirects, notamment perte de profit, de chiffre d'affaires ou de données. Rien dans les présentes conditions n'exclut une responsabilité qui ne peut être écartée par le droit applicable, notamment en cas de dol, de faute lourde ou de dommage corporel.",
      },
      {
        title: 'Résiliation',
        body: "Chaque partie peut résilier le contrat par notification écrite. Chaque partie peut également résilier pour manquement substantiel si le manquement n'est pas corrigé dans les 30 jours suivant une mise en demeure écrite. À la résiliation, vos données sont exportées ou supprimées dans les 30 jours selon vos instructions, puis retirées des systèmes actifs et purgées des sauvegardes sous 90 jours.",
      },
      {
        title: 'Modification des conditions',
        body: "Nous pouvons faire évoluer les présentes conditions pour tenir compte des évolutions du service ou des exigences légales. La version à jour est publiée sur cette page avec une nouvelle date d'effet, et les titulaires de compte sont informés des modifications substantielles avant leur entrée en vigueur.",
      },
      {
        title: 'Force majeure',
        body: "Aucune partie n'est responsable d'un manquement causé par un événement échappant à son contrôle raisonnable, y compris une défaillance réseau ou d'infrastructure extérieure à ses systèmes, sous réserve d'en informer l'autre partie et d'oeuvrer à en limiter les effets.",
      },
      {
        title: 'Droit applicable',
        body: 'Ces conditions sont régies par le droit français. Tout litige relève des tribunaux compétents de Lyon.',
      },
      {
        title: 'Contact',
        body: 'Prosperify SAS, 40 rue de Bourgogne, 69009 Lyon, France. contact@prosperify.app. SIREN : 100136753.',
      },
    ],
    title: "Conditions d'utilisation",
    updated: 'Dernière mise à jour : août 2026',
  },
};

export default function TermsContent() {
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
