import { CornerUpRight, Share2, ShieldAlert } from 'lucide-react';

import { CityMap } from '@/components/illustrations/CityMap';
import { getRoute } from '@/data/city';

const MAP_BAND = { top: 190, bottom: 600 } as const;
const route = getRoute('safer');

/**
 * The walking screen: what SafeWalkMaps looks like once you have set off.
 *
 * Night map, one instruction at a time, and the route's score kept on screen
 * rather than buried behind a tap — the whole argument of the product is that
 * you should be able to see why you are being sent this way.
 */
export function NavigationScreen() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0">
        <CityMap
          width={393}
          height={852}
          band={MAP_BAND}
          activeRoute="safer"
          tone="night"
          flow
        />
      </div>

      {/* Turn instruction */}
      <div className="absolute inset-x-[0.75em] top-[3.1em] z-20">
        <div className="flex items-center gap-[0.85em] rounded-[1.15em] bg-navy-900/88 px-[1em] py-[0.9em] text-white shadow-[0_0.6em_1.8em_-0.5em_rgba(2,15,36,0.6)] backdrop-blur-md">
          <span className="grid h-[2.3em] w-[2.3em] shrink-0 place-items-center rounded-[0.7em] bg-green-500 text-navy-900">
            <CornerUpRight aria-hidden="true" className="h-[1.3em] w-[1.3em]" strokeWidth={2.5} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="tabular text-[1.05em] font-semibold">120 m</span>
            <span className="truncate text-[0.76em] text-white/65">
              Turn right onto Chapel Street
            </span>
          </span>
        </div>
      </div>

      {/* Live safety notice */}
      <div className="absolute inset-x-[0.75em] top-[7.4em] z-20">
        <div className="flex items-start gap-[0.6em] rounded-[0.9em] border border-green-500/25 bg-green-500/12 px-[0.8em] py-[0.6em] backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="relative mt-[0.3em] flex h-[0.45em] w-[0.45em] shrink-0"
          >
            <span className="absolute inset-0 animate-node-pulse rounded-full bg-green-500" />
            <span className="relative h-full w-full rounded-full bg-green-500" />
          </span>
          <span className="text-[0.72em] leading-snug text-green-100">
            Ahead is lit and busier than usual for this time.
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[1.6em] bg-navy-900/92 px-[0.9em] pb-[1.6em] pt-[0.6em] text-white backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="mx-auto mb-[0.9em] block h-[0.25em] w-[2.4em] rounded-pill bg-white/22"
        />

        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-baseline gap-[0.3em] leading-none">
              <span className="tabular text-[1.65em] font-semibold tracking-[-0.03em]">18</span>
              <span className="text-[0.8em] font-medium text-white/60">min left</span>
            </p>
            <p className="tabular mt-[0.35em] text-[0.74em] text-white/50">
              Arrive 23:59 · 1.4 km to go
            </p>
          </div>

          <div className="flex items-center gap-[0.45em] rounded-pill border border-green-500/30 bg-green-500/14 px-[0.7em] py-[0.4em]">
            <span className="tabular text-[0.95em] font-semibold text-green-300">
              {route.safetyScore}
            </span>
            <span className="text-[0.6em] font-semibold uppercase tracking-[0.1em] text-green-300/70">
              Safety
            </span>
          </div>
        </div>

        <div className="mt-[1em] grid grid-cols-2 gap-[0.6em]">
          <span className="flex h-[2.7em] items-center justify-center gap-[0.4em] rounded-[0.85em] bg-white/10 text-[0.8em] font-semibold">
            <Share2 aria-hidden="true" className="h-[1.05em] w-[1.05em]" />
            Share walk
          </span>
          <span className="flex h-[2.7em] items-center justify-center gap-[0.4em] rounded-[0.85em] bg-danger/90 text-[0.8em] font-semibold text-white">
            <ShieldAlert aria-hidden="true" className="h-[1.05em] w-[1.05em]" />
            SOS
          </span>
        </div>
      </div>
    </div>
  );
}
