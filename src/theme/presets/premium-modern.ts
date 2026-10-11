import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const premiumModernPreset = preset({
  id: 'premium-modern',
  name: 'Premium Modern',
  description:
    'Deeper navy, softer green, large radii, layered shadows, a gradient primary button and a bento feature grid.',
  tokens: buildTokens({
    navy: '#071C3F',
    green: '#2EDC8C',
    display: STACKS.manrope,
    headingWeight: 700,
    radiusBase: 1.25,
    shadows: 'dramatic',
    intensity: 'expressive',
  }),
  components: {
    button: { shape: 'pill', primary: 'gradient', hover: 'lift' },
    card: { style: 'elevated' },
    nav: { style: 'glass' },
    hero: { layout: 'split-phone' },
    cta: { style: 'gradient-band' },
    footer: { style: 'navy-columns' },
    features: { layout: 'bento' },
    stats: { style: 'tiles' },
    badge: { style: 'soft' },
    routeOptions: { style: 'cards' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2 },
    testimonial: { style: 'cards' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'expressive', reveal: 'rise', hoverLift: true },
  content: { headline: 'benefit', tone: 'confident', ctaLabel: 'Join the iOS waitlist' },
});
