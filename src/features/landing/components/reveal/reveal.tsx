"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type React from "react";

/**
 * Révèle un élément la première fois qu'il entre dans la fenêtre.
 *
 * L'élément part masqué dès le rendu serveur : pas de scintillement au
 * montage. Ce qui est déjà dans la fenêtre est révélé par le premier passage
 * de l'observateur, donc sans attendre un défilement.
 *
 * Filets de sécurité : révélation immédiate si `IntersectionObserver` manque,
 * et une règle `<noscript>` (layout.tsx) qui neutralise l'état masqué sans
 * JavaScript. `prefers-reduced-motion` annule l'effet côté CSS.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

type RevealSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
};

/** `<section>` qui apparaît au défilement. */
export function RevealSection({
  children,
  className,
  id,
  style,
}: RevealSectionProps) {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={cn("pf-reveal", className)}
      data-revealed={revealed}
      id={id}
      style={style}
    >
      {children}
    </section>
  );
}
