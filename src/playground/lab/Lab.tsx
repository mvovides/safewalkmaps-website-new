import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { ThemeConfig } from '@/theme/config';

import { LabBadges } from './LabBadges';
import { LabButtons } from './LabButtons';
import { LabCta } from './LabCta';
import { LabFeatures } from './LabFeatures';
import { LabFooter } from './LabFooter';
import { LabHero } from './LabHero';
import { LabIcons } from './LabIcons';
import { LabMapUi } from './LabMapUi';
import { LabNav } from './LabNav';
import { LabRouteOptions } from './LabRouteOptions';
import { LabRouteViz } from './LabRouteViz';
import { LabSafetyScore } from './LabSafetyScore';
import { LabStats } from './LabStats';
import { LabTestimonial } from './LabTestimonial';
import { LabTypography } from './LabTypography';

export type LabProps = { config: ThemeConfig; section: string | null };

/**
 * Every SafeWalkMaps composition the playground can style, in page order. Runs the
 * site's own scroll-reveal controller so motion settings can be judged here too.
 */
export function Lab({ config, section }: LabProps) {
  useScrollReveal();

  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [section]);

  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LabNav config={config} />
      <main>
        <LabHero config={config} />
        <LabRouteViz config={config} />
        <LabRouteOptions config={config} />
        <LabSafetyScore config={config} />
        <LabFeatures config={config} />
        <LabStats config={config} />
        <LabBadges config={config} />
        <LabButtons config={config} />
        <LabTypography config={config} />
        <LabIcons config={config} />
        <LabMapUi config={config} />
        <LabTestimonial config={config} />
        <LabCta config={config} />
      </main>
      <LabFooter config={config} />
    </MemoryRouter>
  );
}
