import type { ChipTone } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

/** Every composition in the lab, in page order. The top bar's jump list reads this. */
export const LAB_SECTIONS = [
  { id: 'nav', title: 'Navigation' },
  { id: 'hero', title: 'Hero' },
  { id: 'route-viz', title: 'Route and safety visualisation' },
  { id: 'route-options', title: 'Route options' },
  { id: 'safety-score', title: 'Safety score' },
  { id: 'features', title: 'Features' },
  { id: 'stats', title: 'Stats' },
  { id: 'badges', title: 'Badges and chips' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'typography', title: 'Typography' },
  { id: 'icons', title: 'Icons' },
  { id: 'map-ui', title: 'Map UI elements' },
  { id: 'testimonial', title: 'Testimonial' },
  { id: 'cta', title: 'Call to action' },
  { id: 'footer', title: 'Footer' },
] as const;
export type LabSectionId = (typeof LAB_SECTIONS)[number]['id'];

type CardStyle = ThemeConfig['components']['card']['style'];
type BadgeStyle = ThemeConfig['components']['badge']['style'];

const CARD: Record<CardStyle, string> = {
  outlined: 'border border-line bg-surface shadow-xs',
  elevated: 'border border-transparent bg-surface shadow-lg',
  flat: 'bg-surface-secondary',
  glass: 'border border-line bg-surface/70 backdrop-blur-md',
  navy: 'on-navy border border-white/10 bg-surface-navy text-white',
};

export function cardClasses(style: CardStyle, extra?: string): string {
  return cn('lab-card rounded-card p-6 sm:p-7', CARD[style], extra);
}

/** How the preset's button choices land on the real `Button` variants. */
export function labButtonProps(config: ThemeConfig): {
  variant: 'primary' | 'accent' | 'secondary';
  className: string;
  routeHover: boolean;
} {
  const { primary, hover } = config.components.button;
  const variant = primary === 'green' ? 'accent' : primary === 'outline' ? 'secondary' : 'primary';
  const className = cn(
    primary === 'gradient' &&
      'bg-gradient-to-br from-navy-600 to-navy-900 hover:from-navy-500 hover:to-navy-800',
    hover === 'lift' && 'hover:-translate-y-0.5 hover:shadow-lg',
    hover === 'fill' &&
      variant === 'secondary' &&
      'hover:border-navy-800 hover:bg-navy-800 hover:text-white',
    hover === 'none' && 'hover:shadow-none',
  );
  return { variant, className, routeHover: hover === 'route-sheen' };
}

export function iconTile(
  config: ThemeConfig,
  inverse = false,
): { className: string; strokeWidth: number } {
  const { style, strokeWidth } = config.components.icons;
  const className = cn(
    'grid h-10 w-10 place-items-center rounded-lg',
    style === 'outline' && (inverse ? 'text-green-500' : 'text-navy-700'),
    style === 'filled-tile' &&
      (inverse ? 'bg-white/10 text-green-500' : 'bg-navy-50 text-navy-700'),
    style === 'duotone' &&
      (inverse ? 'bg-green-500/15 text-green-300' : 'bg-green-500/15 text-green-800'),
  );
  return { className, strokeWidth };
}

const SOLID: Record<ChipTone, string> = {
  plus: 'border-transparent bg-green-800 text-white',
  minus: 'border-transparent bg-navy-800 text-white',
  flag: 'border-transparent bg-warning-ink text-white',
  neutral: 'border-transparent bg-ink-secondary text-white',
};
const OUTLINE: Record<ChipTone, string> = {
  plus: 'border-green-700 bg-transparent text-green-800',
  minus: 'border-navy-400 bg-transparent text-navy-800',
  flag: 'border-warning bg-transparent text-warning-ink',
  neutral: 'border-line-strong bg-transparent text-ink-secondary',
};

/** Extra classes for `Chip`; `soft` is the component's own look, so nothing is added. */
export function badgeOverride(style: BadgeStyle, tone: ChipTone): string {
  if (style === 'solid') return SOLID[tone];
  if (style === 'outline') return OUTLINE[tone];
  return '';
}
