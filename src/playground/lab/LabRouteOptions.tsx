import { useState } from 'react';

import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { Chip } from '@/components/ui/Chip';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { defaultRouteKey, getRoute, ILLUSTRATIVE_NOTE, routes, type RouteKey } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride, cardClasses } from './labStyles';

const options = routes.map((r) => ({ value: r.key, label: r.name, meta: `${r.minutes} min` }));

export function LabRouteOptions({ config }: { config: ThemeConfig }) {
  const [selected, setSelected] = useState<RouteKey>(defaultRouteKey);
  const route = getRoute(selected);
  const style = config.components.routeOptions.style;
  const badge = config.components.badge.style;

  let picker: JSX.Element;
  if (style === 'segmented') {
    picker = (
      <SegmentedTabs
        options={options}
        value={selected}
        onChange={setSelected}
        idPrefix="lab-route"
        label="Compare walking routes"
      />
    );
  } else if (style === 'cards') {
    picker = (
      <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Compare walking routes">
        {routes.map((r) => (
          <button
            key={r.key}
            role="tab"
            type="button"
            aria-selected={r.key === selected}
            onClick={() => setSelected(r.key)}
            className={cn(
              cardClasses(config.components.card.style, 'text-left'),
              r.key === selected && 'ring-2 ring-green-500',
            )}
          >
            <span className="block text-body-sm font-semibold text-ink-primary">{r.name}</span>
            <span className="tabular mt-1 block text-display-sm text-ink-primary">
              {r.minutes}
              <span className="text-body-sm text-ink-tertiary"> min</span>
            </span>
            <span className="mt-2 block text-caption text-ink-tertiary">
              {r.distanceKm.toFixed(1)} km · safety {r.safetyScore}
            </span>
          </button>
        ))}
      </div>
    );
  } else {
    picker = (
      <ul
        className="divide-y divide-line rounded-card border border-line"
        role="tablist"
        aria-label="Compare walking routes"
      >
        {routes.map((r) => (
          <li key={r.key}>
            <button
              role="tab"
              type="button"
              aria-selected={r.key === selected}
              onClick={() => setSelected(r.key)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 rounded-full border-2',
                  r.key === selected ? 'border-green-700 bg-green-500' : 'border-line-strong',
                )}
              />
              <span className="flex-1 text-body-sm font-semibold text-ink-primary">{r.name}</span>
              <span className="tabular text-body-sm text-ink-secondary">
                {r.minutes} min · {r.distanceKm.toFixed(1)} km · {r.safetyScore}/100
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <LabSection id="route-options" title="Route options" variant={style}>
      <div
        className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center"
        data-route-stroke={config.components.mapUi.routeStroke}
      >
        <div>
          {picker}
          <div role="tabpanel" className="mt-8">
            <div className="flex flex-wrap items-end gap-x-9 gap-y-5">
              <div>
                <p className="text-label font-semibold uppercase text-ink-tertiary">Time</p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <AnimatedCounter
                    value={route.minutes}
                    live
                    durationMs={620}
                    className="text-display-md text-ink-primary"
                  />
                  <span className="text-body-lg font-medium text-ink-tertiary">min</span>
                </p>
              </div>
              <div>
                <p className="text-label font-semibold uppercase text-ink-tertiary">Distance</p>
                <p className="tabular mt-1.5 text-display-md text-ink-primary">
                  {route.distanceKm.toFixed(1)}
                  <span className="text-body-lg font-medium text-ink-tertiary"> km</span>
                </p>
              </div>
              <div>
                <p className="text-label font-semibold uppercase text-ink-tertiary">Safety</p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <AnimatedCounter
                    value={route.safetyScore}
                    live
                    durationMs={620}
                    className="text-display-md text-green-800"
                  />
                  <span className="text-body-lg font-medium text-ink-tertiary">/100</span>
                </p>
              </div>
              <SafetyScoreRing
                score={route.safetyScore}
                lowestSegment={route.lowestSegment}
                strokeWidth={14}
                className="w-20"
              >
                <span className="tabular text-body font-semibold">{route.safetyScore}</span>
              </SafetyScoreRing>
            </div>
            <p className="mt-6 text-body-lg text-ink-secondary">{route.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {route.factors.map((f) => (
                <li key={f.label}>
                  <Chip tone={f.tone} className={badgeOverride(badge, f.tone)}>
                    {f.label}
                  </Chip>
                </li>
              ))}
            </ul>
            <p className="demo-note mt-6">{ILLUSTRATIVE_NOTE}</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[19rem]">
          <PhoneFrame
            elevation="soft"
            label={`SafeWalkMaps showing the ${route.name.toLowerCase()} route.`}
          >
            <RoutePickerScreen activeRoute={selected} onSelect={setSelected} />
          </PhoneFrame>
        </div>
      </div>
    </LabSection>
  );
}
