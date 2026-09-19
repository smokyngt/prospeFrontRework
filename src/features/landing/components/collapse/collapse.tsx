import { cn } from "@/lib/utils";

import type React from "react";

/**
 * Déploiement fluide d'un contenu (FAQ, menus) : la hauteur passe de 0 à sa
 * taille naturelle via `grid-template-rows`, sans mesurer le contenu en JS.
 */
export function Collapse({
  children,
  className,
  open,
}: {
  children: React.ReactNode;
  className?: string;
  open: boolean;
}) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out",
        open ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
