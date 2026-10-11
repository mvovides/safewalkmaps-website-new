import { Chip, StatusPill, type ChipTone } from '@/components/ui/Chip';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride } from './labStyles';

const SAMPLES: Array<{ tone: ChipTone; label: string }> = [
  { tone: 'plus', label: 'Well lit for the full route' },
  { tone: 'minus', label: 'Very little footfall after 9pm' },
  { tone: 'flag', label: 'One stretch with older lighting data' },
  { tone: 'neutral', label: 'Planned' },
];

export function LabBadges({ config }: { config: ThemeConfig }) {
  const style = config.components.badge.style;
  return (
    <LabSection id="badges" title="Badges and chips" variant={style}>
      <div className="grid gap-6">
        <ul className="flex flex-wrap gap-2.5">
          {SAMPLES.map((s) => (
            <li key={s.label}>
              <Chip tone={s.tone} className={badgeOverride(style, s.tone)}>
                {s.label}
              </Chip>
            </li>
          ))}
          <li>
            <StatusPill>Coming soon on iOS</StatusPill>
          </li>
        </ul>
        <ul className="on-navy flex flex-wrap gap-2.5 rounded-card bg-surface-navy p-6">
          {SAMPLES.map((s) => (
            <li key={s.label}>
              <Chip tone={s.tone} inverse>
                {s.label}
              </Chip>
            </li>
          ))}
          <li>
            <StatusPill inverse>Coming soon on iOS</StatusPill>
          </li>
        </ul>
        <p className="demo-note">
          "Planned" is the honest label for a feature that is not yet in the build.
        </p>
      </div>
    </LabSection>
  );
}
