"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import type React from "react";

export type OnPageNavigationItem = { id: string; label: string };
export type OnPageNavigationLink = { href: string; label: string };

export function OnPageNavigation({
  items,
  pageLinks = [],
  pagesTitle,
  sectionsTitle,
  title,
}: {
  items: OnPageNavigationItem[];
  pageLinks?: OnPageNavigationLink[];
  pagesTitle?: string;
  sectionsTitle?: string;
  title: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-34% 0px -48% 0px", threshold: [0.08, 0.18, 0.32] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setActiveId(id);
    const top = target.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
  };

  return (
    <div className="contents">
      <aside className="sticky top-[92px] hidden h-fit self-start xl:block">
        <div className="flex items-center gap-2 pb-4 text-[13px] text-[var(--pf-fg-muted)]">
          <Menu size={15} strokeWidth={1.6} />
          <span>{title}</span>
        </div>
        <div className="mb-2 pl-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--pf-fg-dim)]">
          {sectionsTitle ?? title}
        </div>
        <nav aria-label={sectionsTitle ?? title} className="border-l border-[var(--pf-border)]">
          {items.map(({ id, label }) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                onClick={handleClick(id)}
                className={cn(
                  "relative -ml-px flex min-h-9 items-center border-l pl-3 pr-2 text-[13px] transition-colors",
                  active
                    ? "border-[#FF6A13] text-[#FF6A13]"
                    : "border-transparent text-[var(--pf-fg-muted)] hover:text-[var(--pf-fg)]",
                )}
              >
                {label}
              </a>
            );
          })}
        </nav>
        {pageLinks.length > 0 && (
          <div className="mt-6 border-t border-[var(--pf-border)] pt-4">
            <div className="mb-2 pl-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--pf-fg-dim)]">
              {pagesTitle ?? "Pages à découvrir"}
            </div>
            <nav aria-label={pagesTitle ?? "Pages à découvrir"} className="border-l border-[var(--pf-border)]">
              {pageLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="flex min-h-9 items-center border-l border-transparent pl-3 pr-2 text-[13px] text-[var(--pf-fg-muted)] transition-colors hover:border-[#FF6A13] hover:text-[#FF6A13]"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </aside>

      <div
        className="fixed inset-x-0 top-16 z-40 border-y border-[var(--pf-border)] px-3 py-0 backdrop-blur-md xl:hidden"
        style={{ background: "var(--pf-nav-bg)" }}
      >
        <nav aria-label={sectionsTitle ?? title} className="flex min-w-0 gap-1 overflow-x-auto">
          <span className="shrink-0 px-2 py-[3px] font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--pf-fg-dim)]">
            {sectionsTitle ?? title}
          </span>
          {items.map(({ id, label }) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                onClick={handleClick(id)}
                className={cn(
                  "shrink-0 border-b-2 px-2 py-[3px] text-xs transition-colors",
                  active
                    ? "border-[#FF6A13] text-[#FF6A13]"
                    : "border-transparent text-[var(--pf-fg-muted)]",
                )}
              >
                {label}
              </a>
            );
          })}
        </nav>
        {pageLinks.length > 0 && (
          <nav aria-label={pagesTitle ?? "Pages à découvrir"} className="flex min-w-0 gap-1 overflow-x-auto border-t border-[var(--pf-border)]">
            <span className="shrink-0 px-2 py-[3px] font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--pf-fg-dim)]">
              {pagesTitle ?? "Pages à découvrir"}
            </span>
            {pageLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="shrink-0 px-2 py-[3px] text-xs text-[var(--pf-fg-muted)] transition-colors hover:text-[#FF6A13]"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
