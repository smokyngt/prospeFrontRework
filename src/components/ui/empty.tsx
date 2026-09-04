import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';
type EmptyProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'card';
  size?: 'sm' | 'md' | 'lg';
};
const sizeClasses = {
  sm: {
    wrapper: 'py-6',
    icon: 'mb-2 h-8 w-8',
    title: 'text-sm',
    desc: 'text-xs',
  },
  md: {
    wrapper: 'py-12',
    icon: 'mb-4 h-12 w-12',
    title: 'text-lg',
    desc: 'text-sm',
  },
  lg: {
    wrapper: 'py-16',
    icon: 'mb-5 h-16 w-16',
    title: 'text-xl',
    desc: 'text-base',
  },
};

export function Empty({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
  size = 'md',
}: EmptyProps) {
  const { t } = useTranslation();
  const s = sizeClasses[size];
  const useFallback = !title.trim() && !description?.trim();
  const resolvedTitle = useFallback ? t('fallback.unavailable_title', 'Network error') : title;
  const resolvedDescription = useFallback
    ? t(
        'fallback.unavailable_description',
        "We couldn't load this right now. Check your connection and try again.",
      )
    : description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center opacity-100 duration-300',
        s.wrapper,
        variant === 'card' && 'rounded-xl border border-dashed border-border/80 bg-muted/20 px-6',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground',
            s.icon,
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn('font-medium', s.title)}>{resolvedTitle}</h3>
      {resolvedDescription && (
        <p className={cn('mt-1.5 max-w-sm text-muted-foreground leading-relaxed', s.desc)}>
          {resolvedDescription}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
