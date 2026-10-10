import { useState } from 'react';

import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { Section, SectionHeading } from '@/components/layout/Section';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { Chip } from '@/components/ui/Chip';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import {
  defaultRouteKey,
  getRoute,
  ILLUSTRATIVE_NOTE,
  routes,
  type RouteKey,
} from '@/data/city';

const options = routes.map((route) => ({
  value: route.key,
  label: route.name,
  meta: `${route.minutes} min`,
}));

export function RouteChoiceSection() {
  const [selected, setSelected] = useState<RouteKey>(defaultRouteKey);
  const route = getRoute(selected);
  const fastest = getRoute('fastest');
  const delta = route.minutes - fastest.minutes;

  return (
    <Section id="routes" tone="secondary">
      <SectionHeading
        index="03"
        eyebrow="Three routes"
        title={
          <>
            You pick the route.
            <span className="block text-ink-tertiary">We just show the trade.</span>
          </>
        }
        lede="Fastest, Balanced and Safer are presented side by side with their times, distances and scores. SafeWalkMaps adds information to the decision — it never takes the decision away from you."
        className="max-w-4xl"
      />

      <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
        {/* Controls and detail */}
        <div className="order-2 lg:order-1" data-reveal>
          <SegmentedTabs
            options={options}
            value={selected}
            onChange={setSelected}
            idPrefix="route"
            label="Compare walking routes"
          />

          <div
            role="tabpanel"
            id={`route-panel-${selected}`}
            aria-labelledby={`route-tab-${selected}`}
            className="mt-8"
          >
            <div className="flex flex-wrap items-end gap-x-9 gap-y-5">
              <div>
                <p className="text-label font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                  Time
                </p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <AnimatedCounter
                    value={route.minutes}
                    live
                    durationMs={620}
                    className="text-display-md font-semibold text-ink-primary"
                  />
                  <span className="text-body-lg font-medium text-ink-tertiary">min</span>
                </p>
              </div>

              <div>
                <p className="text-label font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                  Distance
                </p>
                <p className="tabular mt-1.5 flex items-baseline gap-1.5 text-display-md font-semibold text-ink-primary">
                  {route.distanceKm.toFixed(1)}
                  <span className="text-body-lg font-medium text-ink-tertiary">km</span>
                </p>
              </div>

              <div>
                <p className="text-label font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                  Safety
                </p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <AnimatedCounter
                    value={route.safetyScore}
                    live
                    durationMs={620}
                    className="text-display-md font-semibold text-green-800"
                  />
                  <span className="text-body-lg font-medium text-ink-tertiary">/100</span>
                </p>
              </div>
            </div>

            <p className="mt-6 text-body-lg text-ink-secondary">
              {route.summary}
              {delta > 0 && (
                <>
                  {' '}
                  <span className="font-medium text-ink-primary">
                    {delta} minute{delta === 1 ? '' : 's'} more than the fastest option.
                  </span>
                </>
              )}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              {route.factors.map((factor) => (
                <li key={factor.label}>
                  <Chip tone={factor.tone}>{factor.label}</Chip>
                </li>
              ))}
            </ul>

            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-caption text-ink-tertiary">Lowest stretch</dt>
                <dd className="tabular mt-1 text-body-lg font-semibold text-ink-primary">
                  {route.lowestSegment}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-ink-tertiary">Below par</dt>
                <dd className="tabular mt-1 text-body-lg font-semibold text-ink-primary">
                  {route.exposurePercent}%
                </dd>
              </div>
              <div>
                <dt className="text-caption text-ink-tertiary">Confidence</dt>
                <dd className="tabular mt-1 text-body-lg font-semibold text-ink-primary">
                  {route.confidencePercent}%
                </dd>
              </div>
            </dl>

            <p className="demo-note mt-6">{ILLUSTRATIVE_NOTE}</p>
          </div>
        </div>

        {/* Live phone */}
        <div className="order-1 mx-auto w-full max-w-[19rem] lg:order-2 sm:max-w-[20.5rem]" data-reveal="scale">
          <PhoneFrame
            elevation="soft"
            label={`SafeWalkMaps showing the ${route.name.toLowerCase()} route: ${route.minutes} minutes, safety score ${route.safetyScore}.`}
          >
            <RoutePickerScreen activeRoute={selected} onSelect={setSelected} />
          </PhoneFrame>
        </div>
      </div>
    </Section>
  );
}
