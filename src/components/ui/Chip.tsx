import { Check, Info, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type ChipTone = 'plus' | 'minus' | 'flag' | 'neutral';

const tones: Record<ChipTone, string> = {
  plus: 'border-green-200 bg-green-50 text-green-900',
  minus: 'border-navy-200 bg-navy-50 text-navy-800',
  flag: 'border-warning/30 bg-warning-soft text-warning-ink',
  neutral: 'border-line-strong bg-surface-secondary text-ink-secondary',
};

const inverseTones: Record<ChipTone, string> = {
  plus: 'border-green-500/30 bg-green-500/12 text-green-300',
  minus: 'border-white/15 bg-white/8 text-white/75',
  flag: 'border-warning/30 bg-warning/12 text-warning',
  neutral: 'border-white/15 bg-white/8 text-white/70',
};

const icons: Record<ChipTone, typeof Check | null> = {
  plus: Check,
  minus: Minus,
  flag: Info,
  neutral: null,
};

export type ChipProps = {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
  inverse?: boolean;
  showIcon?: boolean;
};

/**
 * A single reason behind a score. These are the "why", so they carry an icon
 * as well as colour — the sign of a factor is never conveyed by hue alone.
 */
export function Chip({
  tone = 'neutral',
  children,
  className,
  inverse = false,
  showIcon = true,
}: ChipProps) {
  const Icon = icons[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-caption font-medium',
        inverse ? inverseTones[tone] : tones[tone],
        className,
      )}
    >
      {showIcon && Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

export type StatusPillProps = {
  children: ReactNode;
  className?: string;
  inverse?: boolean;
};

/** The "Coming soon on iOS" style status marker, with a live dot. */
export function StatusPill({ children, className, inverse = false }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-pill border px-3.5 py-1.5 text-caption font-medium',
        inverse
          ? 'border-white/16 bg-white/8 text-white/80'
          : 'border-line-strong bg-white/70 text-ink-secondary backdrop-blur-sm',
        className,
      )}
    >
      <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inset-0 animate-node-pulse rounded-full bg-green-500" />
        <span className="relative h-2 w-2 rounded-full bg-green-500" />
      </span>
      {children}
    </span>
  );
}
