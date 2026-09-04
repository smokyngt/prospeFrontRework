import { cn } from '@/lib/utils';

import type React from 'react';

export const Card = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'relative z-20 h-full w-full overflow-hidden border border-neutral-200 bg-white/92 p-3.5 backdrop-blur-sm transition-all duration-700 ease-out group-hover:bg-white/96 group-hover:shadow-[0_8px_40px_-16px_rgba(255,106,19,0.2)] dark:border-neutral-800 dark:bg-neutral-950/90 dark:group-hover:bg-neutral-950/96 dark:group-hover:shadow-[0_8px_40px_-16px_rgba(255,106,19,0.15)]',
        className,
      )}
    >
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        'text-base font-semibold tracking-tight text-neutral-950 transition-colors duration-700 group-hover:text-orange-600 dark:text-neutral-50',
        className,
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        'mt-1.5 text-[13px] leading-5 text-neutral-600 dark:text-neutral-400',
        className,
      )}
    >
      {children}
    </p>
  );
};
