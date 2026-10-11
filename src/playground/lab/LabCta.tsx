import { ShieldMark } from '@/components/brand/ShieldMark';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

const TITLE = 'Take the route that considers more.';
const BODY =
  'Three minutes is usually the whole difference. SafeWalkMaps just makes sure you know what those three minutes buy.';

export function LabCta({ config }: { config: ThemeConfig }) {
  const style = config.components.cta.style;
  const button = labButtonProps(config);
  const dark = style === 'navy-band' || style === 'gradient-band';
  const inner = (
    <div className="flex flex-col items-center text-center">
      {style === 'shield-arrival' && <ShieldMark className="mb-6 h-24" />}
      <h2
        className={cn(
          style === 'minimal' ? 'text-display-sm' : 'text-display-xl',
          'max-w-[17ch]',
          dark ? 'text-white' : 'text-ink-primary',
        )}
      >
        {TITLE}
      </h2>
      <p
        className={cn(
          'mt-6 max-w-prose text-body-xl',
          dark ? 'text-white/70' : 'text-ink-secondary',
        )}
      >
        {BODY}
      </p>
      <div className="mt-9 flex flex-col items-center gap-5">
        <ButtonLink
          href="#waitlist"
          size="lg"
          variant={dark ? 'accent' : style === 'minimal' ? 'secondary' : button.variant}
          className={button.className}
          routeHover={button.routeHover}
        >
          {config.content.ctaLabel}
        </ButtonLink>
        <StatusPill inverse={dark}>Coming soon on iOS</StatusPill>
      </div>
    </div>
  );

  if (style === 'gradient-band') {
    return (
      <LabSection id="cta" title="Call to action" variant={style} bleed>
        <div
          className="on-navy relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white"
          data-nav-theme="dark"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-green-500/15 blur-3xl"
          />
          <div className="shell relative py-section-lg">{inner}</div>
        </div>
      </LabSection>
    );
  }
  return (
    <LabSection
      id="cta"
      title="Call to action"
      variant={style}
      tone={style === 'navy-band' ? 'navy' : 'default'}
    >
      {inner}
    </LabSection>
  );
}
