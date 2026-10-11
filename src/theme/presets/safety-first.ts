import { buildTokens } from '../build';
import { preset } from './shared';

export const safetyFirstPreset = preset({
  id: 'safety-first',
  name: 'Safety First',
  description:
    'High contrast. The AA-safe green is the signal colour, amber flags stand out, routes are cards and figures are tiles.',
  tokens: buildTokens({
    navy: '#0A2F6B',
    green: '#0A9159',
    headingWeight: 700,
    radiusBase: 0.75,
    buttonShape: 'rounded',
    shadows: 'soft',
    overrides: {
      colors: {
        ink: { primary: '#0B1220' },
        green: { '500': '#0FBF6D', '400': '#2FD98A', '300': '#6AE8A8' },
      },
    },
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'fill' },
    card: { style: 'outlined' },
    nav: { style: 'solid' },
    hero: { layout: 'split-phone' },
    cta: { style: 'navy-band' },
    footer: { style: 'navy-columns' },
    features: { layout: 'list' },
    stats: { style: 'tiles' },
    badge: { style: 'solid' },
    routeOptions: { style: 'cards' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2.5 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'hairline' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: false },
  content: { headline: 'direct', tone: 'confident', ctaLabel: 'Get early access' },
});
