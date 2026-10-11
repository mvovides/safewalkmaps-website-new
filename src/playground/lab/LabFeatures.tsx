import {
  CloudOff,
  MapPinned,
  MessageSquareWarning,
  RefreshCw,
  Share2,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { features } from '@/data/features';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { cardClasses, iconTile } from './labStyles';

const ICON: Record<string, LucideIcon> = {
  navigation: MapPinned,
  updates: RefreshCw,
  sharing: Share2,
  reports: MessageSquareWarning,
  offline: CloudOff,
  sos: ShieldAlert,
};
const BENTO = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-3',
  'lg:col-span-4',
  'lg:col-span-12',
];

const phone = (
  <div className="mx-auto w-full max-w-[12rem]">
    <PhoneFrame elevation="soft" label="SafeWalkMaps navigating at night.">
      <NavigationScreen />
    </PhoneFrame>
  </div>
);

export function LabFeatures({ config }: { config: ThemeConfig }) {
  const layout = config.components.features.layout;
  const card = config.components.card.style;
  const tile = iconTile(config, card === 'navy');
  const inverseTile = iconTile(config, true);

  const Card = ({
    id,
    title,
    body,
    className,
  }: {
    id: string;
    title: string;
    body: string;
    className?: string;
  }) => {
    const Icon = ICON[id] ?? MapPinned;
    return (
      <article className={cardClasses(card, cn('flex flex-col', className))}>
        <span className={cn(tile.className, 'mb-5')}>
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} />
        </span>
        <h3 className="text-body-lg">{title}</h3>
        <p className={cn('mt-2.5', card === 'navy' ? 'text-white/65' : 'text-ink-secondary')}>
          {body}
        </p>
      </article>
    );
  };

  return (
    <LabSection id="features" title="Features" variant={`${layout} · ${card} cards`}>
      {layout === 'bento' && (
        <div className="grid gap-5 lg:grid-cols-12">
          {features.map((f, i) =>
            i === 0 ? (
              <article
                key={f.id}
                className={cardClasses('navy', 'lg:col-span-7 lg:flex lg:items-center lg:gap-8')}
              >
                <div className="lg:flex-1">
                  <span className={cn(inverseTile.className, 'mb-5')}>
                    <MapPinned
                      aria-hidden="true"
                      className="h-5 w-5"
                      strokeWidth={tile.strokeWidth}
                    />
                  </span>
                  <h3 className="text-display-sm text-white">{f.title}</h3>
                  <p className="mt-3.5 text-white/60">{f.body}</p>
                </div>
                <div className="mt-8 lg:mt-0 lg:w-48 lg:shrink-0">{phone}</div>
              </article>
            ) : (
              <Card key={f.id} {...f} className={BENTO[i]} />
            ),
          )}
        </div>
      )}
      {layout === 'three-column' && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.id} {...f} />
          ))}
        </div>
      )}
      {layout === 'list' && (
        <ul className="divide-y divide-line border-y border-line">
          {features.map((f) => {
            const Icon = ICON[f.id] ?? MapPinned;
            return (
              <li key={f.id} className="flex gap-5 py-6">
                <span className={tile.className}>
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} />
                </span>
                <div>
                  <h3 className="text-body-lg">{f.title}</h3>
                  <p className="mt-1.5 max-w-prose text-ink-secondary">{f.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {layout === 'alternating' && (
        <div className="grid gap-14">
          {features.slice(0, 4).map((f, i) => (
            <div
              key={f.id}
              className={cn(
                'grid items-center gap-8 lg:grid-cols-2',
                i % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <Card {...f} />
              <div className="overflow-hidden rounded-card border border-line bg-surface-secondary">
                {i % 2 === 0 ? (
                  <ComparisonMap className="h-auto w-full" />
                ) : (
                  <div className="py-8">{phone}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </LabSection>
  );
}
