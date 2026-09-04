import * as React from 'react';

import { cn } from '@/lib/utils';
export type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  max: number;
  min: number;
  value: number;
};
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, max, min, value, ...props }, ref) => {
    const filled = max === min ? 0 : ((value - min) / (max - min)) * 100;
    return (
      <span className={cn('relative flex h-4 w-full items-center', className)}>
        <span className="h-1 w-full bg-border" />
        <span
          className="pointer-events-none absolute left-0 h-1 bg-primary"
          style={{ width: `${filled}%` }}
        />
        <span
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 border border-background bg-primary"
          style={{ left: `${filled}%` }}
        />
        <input
          type="range"
          max={max}
          min={min}
          value={value}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed"
          ref={ref}
          {...props}
        />
      </span>
    );
  },
);
Slider.displayName = 'Slider';
export { Slider };
