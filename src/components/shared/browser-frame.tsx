'use client';

import { cn } from '@/lib/utils';

import type React from 'react';

type SafariProps = {
  url?: string;
  className?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  showUrl?: boolean;
};

export function Safari({
  url = 'prosperify.ai',
  className,
  headerActions,
  onClose,
  showUrl = true,
  children,
}: SafariProps) {
  return (
    <div
      className={cn(
        'flex min-h-[456px] w-full flex-col overflow-hidden rounded-[8px] border border-neutral-200 bg-white/74 shadow-2xl backdrop-blur-sm sm:min-h-[556px] dark:border-neutral-800 dark:bg-neutral-950/82',
        className,
      )}
    >
      {/* Safari Header */}
      <div className="shrink-0 border-b border-neutral-200 bg-neutral-100/86 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900/86 sm:px-4 sm:py-3">
        <div className={cn('flex items-center justify-between gap-2', showUrl && 'mb-2')}>
          <div className="flex gap-1 sm:gap-2">
            <button
              type="button"
              className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            />
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
          </div>
          {headerActions ? (
            <div className="flex shrink-0 items-center gap-1.5">{headerActions}</div>
          ) : null}
        </div>
        {showUrl ? (
          <div className="truncate rounded-[6px] border border-neutral-200 bg-white/78 px-2 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/78 dark:text-neutral-400 sm:px-3 sm:py-1.5 sm:text-sm">
            🔒 {url}
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white/72 dark:bg-neutral-950/72">
        {children}
      </div>
    </div>
  );
}
