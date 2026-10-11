import { CornerUpRight, Navigation, Share2, ShieldAlert } from 'lucide-react';

import { getRoute, routes } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';

const safer = getRoute('safer');

/** The app's chrome, lifted out of the phone screens at 1rem scale, on a map-coloured plate. */
export function LabMapUi({ config }: { config: ThemeConfig }) {
  const night = config.components.mapUi.tone === 'night';
  const sw = config.components.icons.strokeWidth;
  return (
    <LabSection id="map-ui" title="Map UI elements" variant={night ? 'night' : 'light'}>
      <div
        className={cn(
          'grid gap-5 rounded-card p-6 sm:grid-cols-2',
          night ? 'bg-[#071F42] text-white' : 'bg-[#EEF2F7] text-ink-primary',
        )}
      >
        <div className="flex items-center gap-3.5 rounded-xl bg-navy-900/88 px-4 py-3.5 text-white shadow-lg backdrop-blur-md">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-green-500 text-navy-900">
            <CornerUpRight aria-hidden="true" className="h-5 w-5" strokeWidth={sw} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="tabular text-body-lg font-semibold">120 m</span>
            <span className="truncate text-body-sm text-white/65">
              Turn right onto Chapel Street
            </span>
          </span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-green-500/25 bg-green-500/12 px-3.5 py-2.5">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <span className={cn('text-body-sm', night ? 'text-green-100' : 'text-green-900')}>
            Ahead is lit and busier than usual for this time.
          </span>
        </div>
        <div className="flex items-center gap-2 self-start rounded-control border border-green-500/30 bg-green-500/14 px-3 py-1.5">
          <span
            className={cn(
              'tabular text-body font-semibold',
              night ? 'text-green-300' : 'text-green-800',
            )}
          >
            {safer.safetyScore}
          </span>
          <span
            className={cn(
              'text-label font-semibold uppercase',
              night ? 'text-green-300/70' : 'text-green-800/70',
            )}
          >
            Safety
          </span>
        </div>
        <div
          className={cn(
            'grid grid-cols-3 gap-1 rounded-lg p-1',
            night ? 'bg-white/10' : 'bg-surface-tertiary',
          )}
        >
          {routes.map((r) => (
            <span
              key={r.key}
              className={cn(
                'flex flex-col items-center rounded-md py-1.5 text-caption',
                r.key === 'safer'
                  ? 'bg-white font-semibold text-navy-800 shadow-sm'
                  : night
                    ? 'text-white/70'
                    : 'text-ink-secondary',
              )}
            >
              {r.name}
              <span className="tabular opacity-70">{r.minutes} min</span>
            </span>
          ))}
        </div>
        <span className="flex h-12 items-center justify-center gap-2 rounded-control bg-navy-800 text-body-sm font-semibold text-white">
          <Navigation aria-hidden="true" className="h-4 w-4" fill="currentColor" strokeWidth={sw} />
          Start walking
        </span>
        <div className="grid grid-cols-2 gap-2">
          <span
            className={cn(
              'flex h-11 items-center justify-center gap-2 rounded-lg text-body-sm font-semibold',
              night ? 'bg-white/10 text-white' : 'bg-navy-50 text-navy-800',
            )}
          >
            <Share2 aria-hidden="true" className="h-4 w-4" strokeWidth={sw} />
            Share walk
          </span>
          <span className="flex h-11 items-center justify-center gap-2 rounded-lg bg-danger/90 text-body-sm font-semibold text-white">
            <ShieldAlert aria-hidden="true" className="h-4 w-4" strokeWidth={sw} />
            SOS
          </span>
        </div>
      </div>
    </LabSection>
  );
}
