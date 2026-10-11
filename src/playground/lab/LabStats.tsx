import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { ILLUSTRATIVE_NOTE, routes } from '@/data/city';
import type { ThemeConfig } from '@/theme/config';

import { labStats } from '../content';
import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabStats({ config }: { config: ThemeConfig }) {
  const style = config.components.stats.style;
  return (
    <LabSection id="stats" title="Stats" variant={style}>
      {style === 'inline' && (
        <dl className="flex flex-wrap gap-x-12 gap-y-6">
          {labStats.map((s) => (
            <div key={s.label}>
              <dt className="text-label font-semibold uppercase text-ink-tertiary">{s.label}</dt>
              <dd className="mt-1.5 text-display-md text-ink-primary">
                {'prefix' in s ? s.prefix : ''}
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {style === 'tiles' && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {labStats.map((s) => (
            <div key={s.label} className={cardClasses(config.components.card.style)}>
              <dd className="text-display-sm text-ink-primary">
                {'prefix' in s ? s.prefix : ''}
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </dd>
              <dt className="mt-2 text-caption text-ink-tertiary">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
      {style === 'ring' && (
        <ul className="grid gap-8 sm:grid-cols-3">
          {routes.map((r) => (
            <li key={r.key} className="flex flex-col items-center text-center">
              <SafetyScoreRing
                score={r.safetyScore}
                lowestSegment={r.lowestSegment}
                strokeWidth={12}
                className="w-40"
              >
                <span className="tabular text-display-sm text-ink-primary">{r.safetyScore}</span>
                <span className="text-label font-semibold uppercase text-ink-tertiary">
                  {r.name}
                </span>
              </SafetyScoreRing>
              <p className="mt-3 text-body-sm text-ink-secondary">
                {r.minutes} min · {r.distanceKm.toFixed(1)} km
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="demo-note mt-6">{ILLUSTRATIVE_NOTE}</p>
    </LabSection>
  );
}
