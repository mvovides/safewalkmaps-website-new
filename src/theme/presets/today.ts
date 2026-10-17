import type { ThemeConfig } from '../config';
import { defaultTokens } from '../tokens';

const AUTHORED = '2026-10-11T00:00:00.000Z';
/** When the site adopted the direction chosen in the playground. */
const ADOPTED = '2026-10-17T00:00:00.000Z';

/** The site exactly as it ships today. Every other preset is measured against this. */
export const todayPreset: ThemeConfig = {
  schemaVersion: 1,
  meta: {
    id: 'today',
    name: 'SafeWalkMaps Today',
    description:
      'The current site: white surfaces, bright navy and calm green, Instrument Sans, pill buttons, glass navigation and cards, no shadows.',
    builtIn: true,
    basedOn: null,
    favourite: false,
    createdAt: AUTHORED,
    updatedAt: ADOPTED,
  },
  tokens: defaultTokens,
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'route-sheen' },
    card: { style: 'glass' },
    nav: { style: 'glass' },
    hero: { layout: 'split-phone' },
    cta: { style: 'shield-arrival' },
    footer: { style: 'navy-columns' },
    features: { layout: 'alternating' },
    stats: { style: 'inline' },
    badge: { style: 'soft' },
    routeOptions: { style: 'segmented' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'outline', strokeWidth: 2 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'expressive', reveal: 'rise', hoverLift: false },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
};
