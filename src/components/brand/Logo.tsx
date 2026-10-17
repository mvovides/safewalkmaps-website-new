import { cn } from '@/lib/cn';

import { ShieldMark } from './ShieldMark';

/**
 * The SafeWalkMaps lockup: icon mark plus wordmark.
 *
 * The wordmark is live text in Inter 800 at -0.04em tracking, with "Walk" in
 * the brand green — matching the supplied horizontal logo rather than shipping
 * a second raster of it. Live text keeps the lockup crisp at every size and
 * readable to screen readers.
 *
 * Like the mark, the wordmark is pinned to the logo: its family, its
 * single-storey "a" (Inter's cv11) and its colours are literal, so a change to
 * the site's theme never redraws the logo.
 */

export type LogoProps = {
  className?: string;
  /** `mono-light` is for navy surfaces. */
  variant?: 'brand' | 'mono-light';
  /** Hide the wordmark and render the mark alone. */
  markOnly?: boolean;
  markClassName?: string;
};

export function Logo({
  className,
  variant = 'brand',
  markOnly = false,
  markClassName,
}: LogoProps) {
  const inverse = variant === 'mono-light';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ShieldMark
        variant={variant}
        className={cn('h-8 shrink-0', markClassName)}
        title={markOnly ? 'SafeWalkMaps' : undefined}
      />
      {!markOnly && (
        <span
          className={cn(
            "font-wordmark text-[1.21em] font-extrabold leading-none tracking-[-0.04em] [font-feature-settings:'cv11'_1]",
            inverse ? 'text-white' : 'text-[#062A5E]',
          )}
        >
          Safe<span className={inverse ? 'text-[#17F58B]' : 'text-[#32D583]'}>Walk</span>Maps
        </span>
      )}
    </span>
  );
}
