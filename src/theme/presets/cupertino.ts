import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const cupertinoPreset = preset({
  id: 'cupertino',
  name: 'Cupertino',
  description:
    'System type, tight tracking, large soft radii, glass everywhere, grey-tinted secondary surfaces and quiet motion.',
  tokens: buildTokens({
    navy: '#0A3C85',
    green: '#17F58B',
    sans: STACKS.system,
    headingWeight: 700,
    trackingAdjust: -0.012,
    radiusBase: 1.125,
    shadows: 'soft',
    overrides: {
      colors: {
        surface: { secondary: '#F5F5F7', tertiary: '#EDEDF0' },
        ink: { primary: '#1D1D1F', secondary: '#6E6E73', tertiary: '#86868B' },
        line: { base: 'rgb(0 0 0 / 0.08)', strong: 'rgb(0 0 0 / 0.14)' },
      },
    },
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'none' },
    card: { style: 'glass' },
    nav: { style: 'glass' },
    hero: { layout: 'centered' },
    cta: { style: 'minimal' },
    footer: { style: 'light-compact' },
    features: { layout: 'three-column' },
    stats: { style: 'inline' },
    badge: { style: 'soft' },
    routeOptions: { style: 'segmented' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'outline', strokeWidth: 2 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'hairline' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: false },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
