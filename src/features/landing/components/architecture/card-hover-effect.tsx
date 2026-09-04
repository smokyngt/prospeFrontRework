'use client';

import { cn } from '@/lib/utils';

import { Card, CardDescription, CardTitle } from './card';

import type { LucideIcon } from 'lucide-react';

export const HoverEffect = ({
  items,
  className,
}: {
  className?: string;
  items: {
    description: string;
    icon?: LucideIcon;
    link: string;
    title: string;
  }[];
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2.5 py-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item?.title} className="group relative block h-full w-full cursor-pointer">
            <Card>
              {Icon && (
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center border border-orange-200 bg-white text-orange-500 transition-colors duration-700 group-hover:border-orange-300 group-hover:bg-orange-50 dark:border-orange-500/30 dark:bg-neutral-900 dark:text-orange-400 dark:group-hover:border-orange-500/50 dark:group-hover:bg-orange-500/10">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </div>
              )}
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
