import type { ThemeTokens } from './tokens';

/**
 * The choices a theme makes beyond its tokens: component variants, layout,
 * motion and copy. Each list is the single source of truth for its enum; the
 * validator, the panel controls and the lab compositions all read from here.
 */

export const BUTTON_SHAPES = ['pill', 'rounded', 'square'] as const;
export const BUTTON_PRIMARIES = ['navy', 'green', 'gradient', 'outline'] as const;
export const BUTTON_HOVERS = ['route-sheen', 'lift', 'fill', 'none'] as const;
export const CARD_STYLES = ['outlined', 'elevated', 'flat', 'glass', 'navy'] as const;
export const NAV_STYLES = ['glass', 'solid', 'floating-pill', 'minimal', 'dark'] as const;
export const HERO_LAYOUTS = [
  'split-phone',
  'centered',
  'immersive-dark',
  'editorial',
  'map-first',
] as const;
export const CTA_STYLES = ['shield-arrival', 'navy-band', 'gradient-band', 'minimal'] as const;
export const FOOTER_STYLES = ['navy-columns', 'light-compact', 'dark-big-logo'] as const;
export const FEATURE_LAYOUTS = ['bento', 'three-column', 'list', 'alternating'] as const;
export const STATS_STYLES = ['inline', 'tiles', 'ring'] as const;
export const BADGE_STYLES = ['soft', 'outline', 'solid'] as const;
export const ROUTE_OPTION_STYLES = ['segmented', 'cards', 'list'] as const;
export const MAP_TONES = ['light', 'night'] as const;
export const ROUTE_STROKES = ['cased', 'solid', 'dashed'] as const;
export const ICON_STYLES = ['outline', 'filled-tile', 'duotone'] as const;
export const ICON_STROKES = [1.5, 2, 2.5] as const;
export const TESTIMONIAL_STYLES = ['cards', 'single-quote', 'hidden'] as const;
export const DENSITIES = ['compact', 'comfortable', 'airy'] as const;
export const CONTENT_WIDTHS = ['narrow', 'default', 'wide'] as const;
export const DIVIDERS = ['none', 'hairline', 'tonal'] as const;
export const MOTION_INTENSITIES = ['none', 'subtle', 'standard', 'expressive'] as const;
export const REVEAL_STYLES = ['rise', 'fade', 'mask', 'scale'] as const;
export const HEADLINES = ['default', 'benefit', 'direct', 'question'] as const;
export const TONES = ['calm', 'confident', 'urgent'] as const;
export const CTA_LABEL_MAX = 40;
export const SCHEMA_VERSION = 1;

type Of<T extends readonly unknown[]> = T[number];

export type ThemeComponents = {
  button: {
    shape: Of<typeof BUTTON_SHAPES>;
    primary: Of<typeof BUTTON_PRIMARIES>;
    hover: Of<typeof BUTTON_HOVERS>;
  };
  card: { style: Of<typeof CARD_STYLES> };
  nav: { style: Of<typeof NAV_STYLES> };
  hero: { layout: Of<typeof HERO_LAYOUTS> };
  cta: { style: Of<typeof CTA_STYLES> };
  footer: { style: Of<typeof FOOTER_STYLES> };
  features: { layout: Of<typeof FEATURE_LAYOUTS> };
  stats: { style: Of<typeof STATS_STYLES> };
  badge: { style: Of<typeof BADGE_STYLES> };
  routeOptions: { style: Of<typeof ROUTE_OPTION_STYLES> };
  mapUi: { tone: Of<typeof MAP_TONES>; routeStroke: Of<typeof ROUTE_STROKES> };
  icons: { style: Of<typeof ICON_STYLES>; strokeWidth: Of<typeof ICON_STROKES> };
  testimonial: { style: Of<typeof TESTIMONIAL_STYLES> };
};

export type ThemeMeta = {
  id: string;
  name: string;
  description: string;
  builtIn: boolean;
  /** The built-in a custom preset was duplicated from, for "reset to base". */
  basedOn: string | null;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ThemeConfig = {
  schemaVersion: typeof SCHEMA_VERSION;
  meta: ThemeMeta;
  tokens: ThemeTokens;
  components: ThemeComponents;
  layout: {
    density: Of<typeof DENSITIES>;
    contentWidth: Of<typeof CONTENT_WIDTHS>;
    dividers: Of<typeof DIVIDERS>;
  };
  motion: {
    intensity: Of<typeof MOTION_INTENSITIES>;
    reveal: Of<typeof REVEAL_STYLES>;
    hoverLift: boolean;
  };
  content: {
    headline: Of<typeof HEADLINES>;
    tone: Of<typeof TONES>;
    ctaLabel: string;
  };
};
