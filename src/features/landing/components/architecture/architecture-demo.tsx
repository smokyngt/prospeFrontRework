'use client';

import {
  CheckCircle2,
  Database,
  FileSearch,
  FolderTree,
  History,
  type LucideIcon,
  ScanText,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { HoverEffect } from './card-hover-effect';

export function ArchitectureDemo() {
  const { t } = useTranslation();
  const items = architectureSteps.map((step, index) => ({
    ...step,
    description: t(`architecture.steps.${index}.description`),
    title: t(`architecture.steps.${index}.title`),
  }));

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-2 lg:px-8">
      <HoverEffect items={items} />
    </div>
  );
}

type ArchitectureStep = {
  description: string;
  icon: LucideIcon;
  link: string;
  title: string;
};

const architectureSteps: ArchitectureStep[] = [
  {
    description:
      'Documents utiles rassemblés dans un périmètre contrôlé, sans imposer une refonte complète des outils.',
    icon: Database,
    link: '#',
    title: 'Data stores autorisés',
  },
  {
    description:
      'Textes, tableaux, pages et métadonnées préparés pour rendre chaque document plus facile à interroger.',
    icon: ScanText,
    link: '#',
    title: 'Contenu préparé',
  },
  {
    description:
      'Contenus organisés autour des clauses, articles, annexes, versions et éléments clés.',
    icon: FolderTree,
    link: '#',
    title: 'Informations structurées',
  },
  {
    description:
      'Les droits et le data store autorisé cadrent la recherche avant la génération de réponse.',
    icon: Search,
    link: '#',
    title: 'Recherche gouvernée',
  },
  {
    description:
      'Recherche sémantique, mots-clés, contexte et signaux visuels aident à retrouver les passages utiles.',
    icon: FileSearch,
    link: '#',
    title: 'Recherche hybride',
  },
  {
    description:
      'Les réponses conservent les références nécessaires pour relire les affirmations importantes.',
    icon: CheckCircle2,
    link: '#',
    title: 'Réponses sourcées',
  },
  {
    description:
      "Les limites et zones d'incertitude peuvent être signalées afin d'appuyer la validation humaine.",
    icon: ShieldCheck,
    link: '#',
    title: 'Revue humaine',
  },
  {
    description:
      'Chaque consultation reste journalisée et traçable pour appuyer les audits et la conformité.',
    icon: History,
    link: '#',
    title: 'Traçabilité et audit',
  },
];
