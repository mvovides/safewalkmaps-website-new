import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const boldStartupPreset = preset({
  id: 'bold-startup',
  name: 'Bold Startup',
  description:
    'Saturated green buttons, heavy display type, an editorial hero, a navy call-to-action band and solid badges.',
  tokens: buildTokens({
    navy: '#061A4A',
    green: '#14E07E',
    display: STACKS.plusJakarta,
    headingWeight: 800,
    typeScale: 'display',
    trackingAdjust: -0.01,
    radiusBase: 0.75,
    buttonShape: 'rounded',
    shadows: 'medium',
    density: 'compact',
    intensity: 'expressive',
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'lift' },
    card: { style: 'elevated' },
    nav: { style: 'solid' },
    hero: { layout: 'editorial' },
    cta: { style: 'navy-band' },
    footer: { style: 'navy-columns' },
    features: { layout: 'alternating' },
    stats: { style: 'tiles' },
    badge: { style: 'solid' },
    routeOptions: { style: 'cards' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2.5 },
    testimonial: { style: 'cards' },
  },
  layout: { density: 'compact', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'expressive', reveal: 'rise', hoverLift: true },
  content: { headline: 'benefit', tone: 'confident', ctaLabel: 'Get early access' },
});
