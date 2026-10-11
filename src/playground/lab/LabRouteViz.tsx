import { CityMap } from '@/components/illustrations/CityMap';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { ILLUSTRATIVE_NOTE } from '@/data/city';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabRouteViz({ config }: { config: ThemeConfig }) {
  const { tone, routeStroke } = config.components.mapUi;
  return (
    <LabSection
      id="route-viz"
      title="Route and safety visualisation"
      variant={`${tone} · ${routeStroke}`}
    >
      <div
        className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        data-route-stroke={routeStroke}
      >
        <figure className={cardClasses(config.components.card.style, 'overflow-hidden p-0')}>
          <ComparisonMap className="h-auto w-full" />
          <figcaption className="demo-note px-6 py-4">
            Fastest across the park against safer on main roads. {ILLUSTRATIVE_NOTE}
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-card border border-line">
          <div className="aspect-[393/520]">
            <CityMap
              width={393}
              height={520}
              band={{ top: 40, bottom: 500 }}
              activeRoute="safer"
              showAlternatives
              flow
              tone={tone === 'night' ? 'night' : 'day'}
            />
          </div>
        </figure>
      </div>
    </LabSection>
  );
}
