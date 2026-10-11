import { CityMap } from '@/components/illustrations/CityMap';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { ILLUSTRATIVE_NOTE } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { headlines, toneCaptions } from '../content';
import { LabSection } from './LabSection';
import { cardClasses, labButtonProps } from './labStyles';

export function LabHero({ config }: { config: ThemeConfig }) {
  const layout = config.components.hero.layout;
  const copy = headlines[config.content.headline];
  const caption = toneCaptions[config.content.tone];
  const button = labButtonProps(config);
  const inverse = layout === 'immersive-dark';
  const stroke = config.components.mapUi.routeStroke;

  const headline = (size: 'text-display-xl' | 'text-display-2xl' = 'text-display-xl') => (
    <h1 className={cn(size, inverse ? 'text-white' : 'text-ink-primary')}>
      {copy.line1}
      <span className={cn('block', inverse ? 'text-white/55' : 'text-ink-tertiary')}>
        {copy.line2}
      </span>
    </h1>
  );
  const lede = (
    <p
      className={cn(
        'mt-7 max-w-prose text-body-xl',
        inverse ? 'text-white/70' : 'text-ink-secondary',
      )}
    >
      {copy.lede}
    </p>
  );
  const actions = (
    <div
      className={cn(
        'mt-9 flex flex-col gap-3 sm:flex-row sm:items-center',
        layout === 'centered' && 'sm:justify-center',
      )}
    >
      <ButtonLink
        href="#waitlist"
        size="lg"
        variant={inverse ? 'accent' : button.variant}
        className={button.className}
        routeHover={button.routeHover}
      >
        {config.content.ctaLabel}
      </ButtonLink>
      <ButtonLink href="#route-options" variant={inverse ? 'inverse' : 'secondary'} size="lg">
        See how it works
      </ButtonLink>
    </div>
  );
  const note = (
    <p className={cn('mt-6 text-caption', inverse ? 'text-white/50' : 'text-ink-tertiary')}>
      {caption}
    </p>
  );
  const phone = (className: string, night = false) => (
    <div className={cn('mx-auto w-full', className)} data-route-stroke={stroke}>
      <PhoneFrame
        elevation="soft"
        label="The SafeWalkMaps route picker, comparing three walking routes."
      >
        {night ? <NavigationScreen /> : <RoutePickerScreen activeRoute="safer" />}
      </PhoneFrame>
      <p className={cn('demo-note mt-4 text-center', inverse && 'text-white/45')}>
        {ILLUSTRATIVE_NOTE}
      </p>
    </div>
  );

  if (layout === 'map-first') {
    return (
      <LabSection id="hero" title="Hero" variant={layout} bleed>
        <div className="relative min-h-[72svh] overflow-hidden" data-route-stroke={stroke}>
          <CityMap
            width={1200}
            height={760}
            band={{ top: 80, bottom: 700 }}
            activeRoute="safer"
            showAlternatives
            tone={config.components.mapUi.tone === 'night' ? 'night' : 'day'}
            className="absolute inset-0 h-full w-full"
          />
          <div className="shell relative py-section">
            <div className={cardClasses('glass', 'max-w-2xl')}>
              <StatusPill className="mb-6">Coming soon on iOS</StatusPill>
              {headline()}
              {lede}
              {actions}
              {note}
            </div>
          </div>
        </div>
      </LabSection>
    );
  }

  if (layout === 'editorial') {
    return (
      <LabSection id="hero" title="Hero" variant={layout}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <StatusPill className="mb-7">Coming soon on iOS</StatusPill>
            {headline('text-display-2xl')}
          </div>
          <div className="lg:col-span-4">
            {lede}
            {actions}
            {note}
          </div>
        </div>
        <div
          className="mt-14 overflow-hidden rounded-card border border-line bg-surface-secondary"
          data-route-stroke={stroke}
        >
          <ComparisonMap className="h-auto w-full" />
        </div>
      </LabSection>
    );
  }

  if (layout === 'centered') {
    return (
      <LabSection id="hero" title="Hero" variant={layout}>
        <div className="flex flex-col items-center text-center">
          <StatusPill className="mb-7">Coming soon on iOS</StatusPill>
          <div className="max-w-3xl">{headline()}</div>
          <div className="max-w-prose">{lede}</div>
          {actions}
          {note}
          {phone('mt-14 max-w-[18rem]')}
        </div>
      </LabSection>
    );
  }

  return (
    <LabSection id="hero" title="Hero" variant={layout} tone={inverse ? 'navy' : 'default'}>
      <div className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-16">
        {inverse && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-20 top-0 h-96 rounded-full bg-green-500/10 blur-3xl"
          />
        )}
        <div className="relative" data-reveal-stagger>
          <StatusPill className="mb-7" inverse={inverse}>
            Coming soon on iOS
          </StatusPill>
          {headline()}
          {lede}
          {actions}
          {note}
        </div>
        {phone('max-w-[20rem] sm:max-w-[21.5rem]', inverse)}
      </div>
    </LabSection>
  );
}
