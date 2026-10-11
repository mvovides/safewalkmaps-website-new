import { buildTokens } from '../build';
import { preset } from './shared';

export const cleanMinimalPreset = preset({
  id: 'clean-minimal',
  name: 'Clean Minimal',
  description:
    'Near-black ink on white, navy as an accent only, hairline cards, square-ish corners, no shadows, lots of air.',
  tokens: buildTokens({
    navy: '#0B1F3A',
    green: '#17F58B',
    headingWeight: 500,
    radiusBase: 0.5,
    buttonShape: 'rounded',
    shadows: 'none',
    density: 'airy',
    contentWidth: 'narrow',
    intensity: 'subtle',
    overrides: {
      colors: {
        ink: { primary: '#0A0A0A', secondary: '#4B5563', tertiary: '#9CA3AF' },
        line: { base: 'rgb(10 10 10 / 0.10)', strong: 'rgb(10 10 10 / 0.18)' },
      },
    },
  }),
  components: {
    button: { shape: 'rounded', primary: 'navy', hover: 'none' },
    card: { style: 'outlined' },
    nav: { style: 'minimal' },
    hero: { layout: 'centered' },
    cta: { style: 'minimal' },
    footer: { style: 'light-compact' },
    features: { layout: 'three-column' },
    stats: { style: 'inline' },
    badge: { style: 'outline' },
    routeOptions: { style: 'list' },
    mapUi: { tone: 'light', routeStroke: 'solid' },
    icons: { style: 'outline', strokeWidth: 1.5 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'airy', contentWidth: 'narrow', dividers: 'hairline' },
  motion: { intensity: 'subtle', reveal: 'fade', hoverLift: false },
  content: { headline: 'direct', tone: 'calm', ctaLabel: 'Join the waitlist' },
});
