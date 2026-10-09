import { Check, ChevronRight, Info, Minus, Navigation } from 'lucide-react';

import { CityMap } from '@/components/illustrations/CityMap';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { destination, getRoute, origin, routes, type RouteKey } from '@/data/city';
import { cn } from '@/lib/cn';

/** Where the map must keep the route visible, in screen points. */
const MAP_BAND = { top: 128, bottom: 472 } as const;

const factorIcon = { plus: Check, minus: Minus, flag: Info } as const;
const factorColor = {
  plus: 'text-green-800',
  minus: 'text-ink-tertiary',
  flag: 'text-warning-ink',
} as const;

export type RoutePickerScreenProps = {
  activeRoute: RouteKey;
  /** Supplied when the screen is interactive; omitted for display-only use. */
  onSelect?: (key: RouteKey) => void;
  /** 0–1, for scroll-driven route drawing. */
  routeProgress?: number;
  networkProgress?: number;
  className?: string;
};

/**
 * The SafeWalkMaps route-picker screen.
 *
 * Built from DOM elements at iPhone proportions so the map, the sheet and the
 * score can all animate. Everything is sized in `em` against the phone screen's
 * container width (see `.phone-ui`), so the whole interface scales as one.
 */
export function RoutePickerScreen({
  activeRoute,
  onSelect,
  routeProgress = 1,
  networkProgress = 1,
  className,
}: RoutePickerScreenProps) {
  const route = getRoute(activeRoute);
  const interactive = typeof onSelect === 'function';

  return (
    <div className={cn('absolute inset-0', className)}>
      {/* Map */}
      <div className="absolute inset-0">
        <CityMap
          width={393}
          height={852}
          band={MAP_BAND}
          activeRoute={activeRoute}
          showAlternatives
          routeProgress={routeProgress}
          networkProgress={networkProgress}
        />
      </div>

      {/* Journey field */}
      <div className="absolute inset-x-[0.75em] top-[3.1em] z-20">
        <div className="flex items-center gap-[0.75em] rounded-[1.05em] bg-white/88 px-[0.9em] py-[0.72em] shadow-[0_0.5em_1.5em_-0.5em_rgba(6,42,94,0.28)] backdrop-blur-md">
          <span aria-hidden="true" className="flex flex-col items-center gap-[0.18em]">
            <span className="h-[0.42em] w-[0.42em] rounded-full border-[0.11em] border-navy-800" />
            <span className="h-[0.5em] w-px bg-navy-800/25" />
            <span className="h-[0.42em] w-[0.42em] rounded-[0.1em] bg-green-500" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.72em] font-medium text-ink-tertiary">
              {origin.label}
            </span>
            <span className="truncate text-[0.82em] font-semibold text-ink-primary">
              {destination.label}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="ml-auto h-[1.1em] w-[1.1em] shrink-0 text-ink-tertiary"
          />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[1.6em] bg-white/94 pb-[1.5em] pt-[0.6em] shadow-[0_-0.75em_2.5em_-0.75em_rgba(6,42,94,0.26)] backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="mx-auto mb-[0.85em] block h-[0.25em] w-[2.4em] rounded-pill bg-navy-900/16"
        />

        {/* Route segmented control */}
        <div
          className="mx-[0.9em] grid grid-cols-3 gap-[0.2em] rounded-[0.9em] bg-surface-tertiary p-[0.22em]"
          role={interactive ? 'tablist' : undefined}
          aria-label={interactive ? 'Route options' : undefined}
        >
          {routes.map((option) => {
            const selected = option.key === activeRoute;
            const content = (
              <>
                <span className="text-[0.72em] font-semibold leading-tight">{option.name}</span>
                <span className="tabular text-[0.65em] leading-tight opacity-70">
                  {option.minutes} min
                </span>
              </>
            );
            const classes = cn(
              'flex flex-col items-center justify-center rounded-[0.72em] py-[0.42em] transition-all duration-base ease-out-expo',
              selected
                ? 'bg-white text-navy-800 shadow-[0_0.15em_0.5em_-0.15em_rgba(6,42,94,0.25)]'
                : 'text-ink-secondary',
            );

            return interactive ? (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSelect?.(option.key)}
                // The segment is drawn at iOS proportions, which is roughly
                // 30px tall at phone scale. The pseudo-element extends the
                // touch area past 44px without inflating the mockup.
                className={cn(
                  classes,
                  "relative touch-manipulation active:opacity-70 after:absolute after:inset-x-0 after:-inset-y-[0.62em] after:content-['']",
                )}
              >
                {content}
              </button>
            ) : (
              <span key={option.key} className={classes}>
                {content}
              </span>
            );
          })}
        </div>

        {/* Selected route summary */}
        <div className="mx-[0.9em] mt-[1.05em] flex items-start gap-[0.9em]">
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-[0.35em] leading-none">
              <span className="tabular text-[1.72em] font-semibold tracking-[-0.03em] text-ink-primary">
                {route.minutes}
              </span>
              <span className="text-[0.82em] font-medium text-ink-secondary">min</span>
              <span aria-hidden="true" className="text-[0.82em] text-ink-tertiary">
                ·
              </span>
              <span className="tabular text-[0.82em] font-medium text-ink-secondary">
                {route.distanceKm.toFixed(1)} km
              </span>
            </p>
            <p className="mt-[0.3em] text-[0.74em] leading-snug text-ink-tertiary">
              {route.summary}
            </p>
          </div>

          <SafetyScoreRing
            score={route.safetyScore}
            lowestSegment={route.lowestSegment}
            strokeWidth={15}
            className="w-[4.1em] shrink-0"
          >
            <span className="tabular text-[1.05em] font-semibold leading-none text-ink-primary">
              {route.safetyScore}
            </span>
            <span className="mt-[0.1em] text-[0.5em] font-semibold uppercase tracking-[0.1em] text-ink-tertiary">
              Safety
            </span>
          </SafetyScoreRing>
        </div>

        {/* Why it scored that way */}
        <ul className="mx-[0.9em] mt-[0.85em] space-y-[0.4em]">
          {route.factors.slice(0, 3).map((factor) => {
            const Icon = factorIcon[factor.tone];
            return (
              <li key={factor.label} className="flex items-start gap-[0.5em]">
                <Icon
                  aria-hidden="true"
                  className={cn('mt-[0.12em] h-[0.78em] w-[0.78em] shrink-0', factorColor[factor.tone])}
                  strokeWidth={2.5}
                />
                <span className="text-[0.74em] leading-snug text-ink-secondary">
                  {factor.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Primary action */}
        <div className="mx-[0.9em] mt-[1.1em]">
          <span className="flex h-[3em] w-full items-center justify-center gap-[0.45em] rounded-[0.95em] bg-navy-800 text-[0.86em] font-semibold text-white">
            <Navigation aria-hidden="true" className="h-[1.05em] w-[1.05em]" fill="currentColor" />
            Start walking
          </span>
        </div>
      </div>
    </div>
  );
}
