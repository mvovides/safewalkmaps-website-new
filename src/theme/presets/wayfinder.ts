import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const wayfinderPreset = preset({
  id: 'wayfinder',
  name: 'Wayfinder',
  description:
    'Map first. A teal-shifted navy, cased route strokes, a floating pill bar and filled icon tiles, like a navigation app.',
  tokens: buildTokens({
    navy: '#0A3D66',
    green: '#17F58B',
    display: STACKS.sora,
    headingWeight: 700,
    radiusBase: 1,
    shadows: 'medium',
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'route-sheen' },
    card: { style: 'outlined' },
    nav: { style: 'floating-pill' },
    hero: { layout: 'map-first' },
    cta: { style: 'shield-arrival' },
    footer: { style: 'navy-columns' },
    features: { layout: 'bento' },
    stats: { style: 'inline' },
    badge: { style: 'soft' },
    routeOptions: { style: 'segmented' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'standard', reveal: 'mask', hoverLift: false },
  content: { headline: 'direct', tone: 'confident', ctaLabel: 'Join the iOS waitlist' },
});
