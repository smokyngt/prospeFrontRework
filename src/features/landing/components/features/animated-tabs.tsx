"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type React from "react";

export type Tab = {
  content?: React.ReactNode;
  title: string;
  value: string;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  activeTabClassName?: string;
  contentClassName?: string;
  containerClassName?: string;
  tabClassName?: string;
  tabs: Tab[];
}) => {
  const [order, setOrder] = useState<string[]>(() => propTabs.map((tab) => tab.value));
  const [instant, setInstant] = useState(false);
  const busy = useRef(false);

  const tabs = order
    .map((value) => propTabs.find((tab) => tab.value === value))
    .filter((tab): tab is Tab => tab !== undefined);
  const active = tabs[0];

  const arrange = (front: string, second: string) => [
    front,
    second,
    ...propTabs.map((tab) => tab.value).filter((value) => value !== front && value !== second),
  ];

  // Au clic, la carte visée est d'abord glissée sans transition juste derrière
  // la carte active (invisible : seules les tranches du haut dépassent), puis
  // animée vers l'avant. Le mouvement est donc identique quel que soit le bouton.
  const select = (value: string) => {
    if (busy.current || value === order[0]) return;
    const from = order.indexOf(value);
    if (from === 1) {
      setOrder(arrange(value, order[0]));
      return;
    }
    busy.current = true;
    const staged = [...order];
    [staged[1], staged[from]] = [staged[from], staged[1]];
    setInstant(true);
    setOrder(staged);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setInstant(false);
        setOrder(arrange(value, staged[0]));
        busy.current = false;
      }),
    );
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName,
        )}
      >
        {propTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => select(tab.value)}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{ transformStyle: "preserve-3d" }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full",
                  activeTabClassName,
                )}
              />
            )}

            <span
              className={cn(
                "relative block",
                active.value === tab.value ? "text-white" : "text-black",
              )}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <FadeInDiv
        className={cn("mt-32", contentClassName)}
        instant={instant}
        tabs={tabs}
      />
    </>
  );
};

const FRONT = { opacity: 1, scale: 1 };
const BACK = { opacity: 0.85, scale: 0.94 };
const SMOOTH = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

export const FadeInDiv = ({
  className,
  tabs,
  instant,
}: {
  className?: string;
  instant?: boolean;
  tabs: Tab[];
}) => {
  const isActive = (tab: Tab) => tab.value === tabs[0].value;

  return (
    <div className="relative isolate w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          initial={false}
          style={{ zIndex: -idx }}
          animate={isActive(tab) ? FRONT : BACK}
          transition={instant ? { duration: 0 } : SMOOTH}
          className={cn(
            "w-full h-full absolute top-0 left-0",
            idx > 0 && "pointer-events-none",
            className,
          )}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
