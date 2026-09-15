'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { IntelligenceDemo } from '@/features/landing/components/demo-v2';

import type { DemoSector } from '@/features/landing/components/demo-v2/data';

const SECTORS: DemoSector[] = ['legal', 'healthcare', 'finance'];

function isSector(value: null | string): value is DemoSector {
  return value !== null && (SECTORS as string[]).includes(value);
}

/**
 * Route de capture vidéo : rejoue la démo (données locales, aucun appel
 * réseau) plein écran, sans navbar/footer, pour filmer l'écran proprement.
 * `?sector=` choisit le jeu de données, `?auto=0` désactive le lancement
 * automatique de la visite guidée à l'arrivée sur la page.
 */
export function DemoPreviewClient() {
  const searchParams = useSearchParams();
  const requestedSector = searchParams.get('sector');
  const autoStart = searchParams.get('auto') !== '0';

  const [sector, setSector] = useState<DemoSector>(
    isSector(requestedSector) ? requestedSector : 'legal',
  );
  const [tick, setTick] = useState(autoStart ? 1 : 0);

  const relaunch = (next?: DemoSector) => {
    if (next) {
      setSector(next);
    }
    setTick((current) => current + 1);
  };

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="fixed left-3 top-3 z-[1] flex gap-1.5">
        {SECTORS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => relaunch(option)}
            className={`border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              option === sector
                ? 'border-[#FF6A13] bg-[#FF6A13] text-white'
                : 'border-neutral-300 bg-white text-neutral-600 hover:border-[#FF6A13] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300'
            }`}
          >
            {option}
          </button>
        ))}
        <button
          type="button"
          onClick={() => relaunch()}
          className="border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:border-[#FF6A13] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
        >
          Relancer
        </button>
      </div>

      <div className="h-[720px] w-[1180px] max-w-full">
        <IntelligenceDemo key={sector} autoOpenTick={tick} sector={sector} />
      </div>
    </div>
  );
}
