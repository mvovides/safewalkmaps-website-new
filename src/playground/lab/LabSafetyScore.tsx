import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { Chip } from '@/components/ui/Chip';
import { getRoute, ILLUSTRATIVE_NOTE } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride, cardClasses } from './labStyles';

const route = getRoute('safer');
const figures = [
  { label: 'Lowest single stretch', value: route.lowestSegment, suffix: '' },
  { label: 'Below par', value: route.exposurePercent, suffix: '%' },
  { label: 'Data confidence', value: route.confidencePercent, suffix: '%' },
];

export function LabSafetyScore({ config }: { config: ThemeConfig }) {
  const card = config.components.card.style;
  const dark = card === 'navy';
  return (
    <LabSection id="safety-score" title="Safety score" variant={`panel ${card}`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
        <div className={cardClasses(card, 'mx-auto w-full max-w-[24rem]')}>
          <SafetyScoreRing
            score={route.safetyScore}
            lowestSegment={route.lowestSegment}
            tone={dark ? 'dark' : 'light'}
            strokeWidth={10}
            className="w-full"
          >
            <span className="flex items-baseline">
              <AnimatedCounter
                value={route.safetyScore}
                className={cn(
                  'text-[clamp(3.25rem,9.5vw,4.75rem)] font-semibold leading-none tracking-[-0.045em]',
                  dark ? 'text-white' : 'text-ink-primary',
                )}
              />
              <span
                className={cn(
                  'ml-1 text-body-lg font-medium',
                  dark ? 'text-white/40' : 'text-ink-tertiary',
                )}
              >
                /100
              </span>
            </span>
            <span
              className={cn(
                'mt-2 text-label font-semibold uppercase tracking-[0.14em]',
                dark ? 'text-green-500' : 'text-green-800',
              )}
            >
              Safety score
            </span>
          </SafetyScoreRing>
          <p
            className={cn(
              'mt-5 text-center text-caption',
              dark ? 'text-white/50' : 'text-ink-tertiary',
            )}
          >
            The ring's green gradient is a brand constant and does not follow the palette.
          </p>
        </div>
        <div>
          <ul className="flex flex-wrap gap-2.5">
            {route.factors.map((f) => (
              <li key={f.label}>
                <Chip
                  tone={f.tone}
                  className={badgeOverride(config.components.badge.style, f.tone)}
                >
                  {f.label}
                </Chip>
              </li>
            ))}
          </ul>
          <dl className="mt-8 divide-y divide-line border-t border-line">
            {figures.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-6 py-5">
                <dt className="text-body-lg font-semibold text-ink-primary">{f.label}</dt>
                <dd>
                  <AnimatedCounter
                    value={f.value}
                    suffix={f.suffix}
                    className="text-display-sm font-semibold text-green-800"
                  />
                </dd>
              </div>
            ))}
          </dl>
          <p className="demo-note mt-4">{ILLUSTRATIVE_NOTE}</p>
        </div>
      </div>
    </LabSection>
  );
}
