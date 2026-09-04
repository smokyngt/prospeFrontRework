import {
  Building2,
  Code2,
  Cpu,
  GraduationCap,
  LineChart,
  Megaphone,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/** Adresse de candidature, partagée par la liste et le détail d'une offre. */
export const JOBS_CONTACT_EMAIL = "hello@prosperify.app";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Icône déduite du nom de l'équipe renvoyé par le workspace : celui-ci est
 * libre, on ne peut donc pas s'appuyer sur une énumération fermée.
 */
export function getJobCategoryIcon(category?: string): LucideIcon {
  const normalized = category?.trim().toLowerCase() ?? "";

  if (/(engineer|engineering|tech|software|product)/.test(normalized)) {
    return Code2;
  }

  if (/(ai|data|ml|research|science)/.test(normalized)) {
    return Cpu;
  }

  if (/(sales|growth|business|revenue|go.?to.?market)/.test(normalized)) {
    return LineChart;
  }

  if (/(marketing|content|brand|communication)/.test(normalized)) {
    return Megaphone;
  }

  if (/(design|creative|ux|ui)/.test(normalized)) {
    return Palette;
  }

  if (/(security|legal|compliance|trust)/.test(normalized)) {
    return ShieldCheck;
  }

  if (/(intern|student|apprentice|stage)/.test(normalized)) {
    return GraduationCap;
  }

  if (/(people|hr|talent|operations|ops)/.test(normalized)) {
    return Users;
  }

  return Building2;
}
