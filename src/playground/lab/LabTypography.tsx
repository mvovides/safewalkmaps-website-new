import type { ThemeConfig } from '@/theme/config';
import { TYPE_STEPS, type TypeStep } from '@/theme/tokens';

import { headlines } from '../content';
import { LabSection } from './LabSection';

/** Literal class names so Tailwind generates every step for the lab. */
const CLASS: Record<TypeStep, string> = {
  'display-2xl': 'text-display-2xl',
  'display-xl': 'text-display-xl',
  'display-lg': 'text-display-lg',
  'display-md': 'text-display-md',
  'display-sm': 'text-display-sm',
  'body-xl': 'text-body-xl',
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
  label: 'text-label uppercase',
};

const SAMPLE = 'Lit for most of the journey. Joins the main road early.';

export function LabTypography({ config }: { config: ThemeConfig }) {
  const copy = headlines[config.content.headline];
  const { sans, display, headingWeight } = config.tokens.typography;
  return (
    <LabSection
      id="typography"
      title="Typography"
      variant={`${display ? 'two families' : 'one family'} · heading ${headingWeight}`}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          {TYPE_STEPS.map((step) => {
            const isDisplay = step.startsWith('display');
            return (
              <div key={step} className="grid gap-1">
                <span className="lab-chrome">{step}</span>
                <p
                  className={`${CLASS[step]} ${isDisplay ? 'font-display text-ink-primary' : 'text-ink-secondary'}`}
                  style={isDisplay ? { fontWeight: headingWeight } : undefined}
                >
                  {isDisplay ? copy.line1 : SAMPLE}
                </p>
              </div>
            );
          })}
        </div>
        <aside className="grid gap-4 self-start rounded-card border border-line bg-surface-secondary p-6 text-body-sm text-ink-secondary">
          <p>
            <strong className="text-ink-primary">Body:</strong> {sans}
          </p>
          <p>
            <strong className="text-ink-primary">Headings:</strong> {display ?? 'same as body'}
          </p>
          <p>
            <strong className="text-ink-primary">Headline variant:</strong>{' '}
            {config.content.headline}
          </p>
        </aside>
      </div>
    </LabSection>
  );
}
