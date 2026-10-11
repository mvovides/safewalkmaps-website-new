import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const nightNavigationPreset = preset({
  id: 'night-navigation',
  name: 'Night Navigation',
  description:
    'Dark surfaces, a brighter green, mono figures, night map, immersive hero and a dark bar. The app at 11pm.',
  tokens: buildTokens({
    navy: '#0F2A5F',
    green: '#2CFF9A',
    scheme: 'dark',
    display: STACKS.spaceGrotesk,
    mono: STACKS.jetbrainsMono,
    headingWeight: 600,
    radiusBase: 0.875,
    buttonShape: 'rounded',
    shadows: 'dramatic',
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'route-sheen' },
    card: { style: 'glass' },
    nav: { style: 'dark' },
    hero: { layout: 'immersive-dark' },
    cta: { style: 'gradient-band' },
    footer: { style: 'dark-big-logo' },
    features: { layout: 'bento' },
    stats: { style: 'ring' },
    badge: { style: 'outline' },
    routeOptions: { style: 'segmented' },
    mapUi: { tone: 'night', routeStroke: 'dashed' },
    icons: { style: 'duotone', strokeWidth: 2 },
    testimonial: { style: 'single-quote' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'tonal' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: true },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
