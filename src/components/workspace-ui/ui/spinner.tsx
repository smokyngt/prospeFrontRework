import { cn } from '@/lib/utils';

const SPINNER_BASE = 'inline-flex items-center justify-center text-[#F47331]';
const spinnerSize = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-16 w-16',
} as const;
type SpinnerSize = keyof typeof spinnerSize;
type SpinnerVariant = 'default' | 'awaiting' | 'subtle';

const spinnerVariant = {
  default: 'text-[#F47331]',
  awaiting: 'text-[#F47331] drop-shadow-[0_0_8px_rgba(244,115,49,0.35)]',
  subtle: 'text-[#F47331]/75',
} as const;

function spinnerVariants({
  className,
  size = 'default',
  variant = 'default',
}: {
  className?: string;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}) {
  return cn(SPINNER_BASE, spinnerSize[size], spinnerVariant[variant], className);
}
export type SpinnerProps = {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
} & React.HTMLAttributes<HTMLDivElement>;

const PATH1_D =
  'M 0 45 L 75 7.5 L 75 80 L 25 105 L 25 160 L 0 172.5 L 0 92.5 L 50 67.5 L 50 45 L 0 70 Z';
const PATH2_D = 'M 25 175 L 25 200 L 0 212.5 L 0 187.5 Z';

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  const duration = variant === 'awaiting' ? '2.2s' : variant === 'subtle' ? '3.4s' : '3s';
  const delay = '0.15s';

  return (
    <div className={cn(spinnerVariants({ size, variant }), className)} {...props}>
      <style>{`
        @keyframes spin-draw {
          0%   { stroke-dashoffset: 100; }
          30%  { stroke-dashoffset: 0; }
          70%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -100; }
        }
        @keyframes spin-fill {
          0%   { fill-opacity: 0; }
          30%  { fill-opacity: 0; }
          50%  { fill-opacity: 1; }
          70%  { fill-opacity: 0; }
          100% { fill-opacity: 0; }
        }
      `}</style>
      <svg viewBox="0 0 100 230" aria-hidden="true" className="h-full w-full">
        <g transform="translate(12.5, 8.75)">
          <path
            pathLength={100}
            fill="currentColor"
            fillOpacity={0}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeDasharray={100}
            strokeDashoffset={100}
            d={PATH1_D}
            style={{
              animation: `spin-draw ${duration} ease-in-out infinite, spin-fill ${duration} ease-in-out infinite`,
              willChange: 'stroke-dashoffset, fill-opacity',
            }}
          />
          <path
            pathLength={100}
            fill="currentColor"
            fillOpacity={0}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeDasharray={100}
            strokeDashoffset={100}
            d={PATH2_D}
            style={{
              animation: `spin-draw ${duration} ease-in-out ${delay} infinite, spin-fill ${duration} ease-in-out ${delay} infinite`,
              willChange: 'stroke-dashoffset, fill-opacity',
            }}
          />
        </g>
      </svg>
    </div>
  );
}
export { Spinner, spinnerVariants };
