import { buildTokens } from '../build';
import { preset, STACKS } from './shared';

export const lightAiryPreset = preset({
  id: 'light-airy',
  name: 'Light and Airy',
  description:
    'Off-white surfaces, a lighter navy, pastel green tints, DM Sans, generous line-height and space.',
  tokens: buildTokens({
    navy: '#1F4A86',
    green: '#5BE7A6',
    sans: STACKS.dmSans,
    headingWeight: 600,
    typeScale: 'editorial',
    radiusBase: 1,
    shadows: 'soft',
    density: 'airy',
    contentWidth: 'wide',
    intensity: 'subtle',
    overrides: {
      colors: {
        surface: { base: '#FAFBFD', secondary: '#F3F6FA', tertiary: '#EAF0F7' },
        ink: { primary: '#1B2A44', secondary: '#5B6E8C', tertiary: '#8B9BB4' },
      },
    },
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'lift' },
    card: { style: 'flat' },
    nav: { style: 'glass' },
    hero: { layout: 'centered' },
    cta: { style: 'minimal' },
    footer: { style: 'light-compact' },
    features: { layout: 'three-column' },
    stats: { style: 'inline' },
    badge: { style: 'soft' },
    routeOptions: { style: 'list' },
    mapUi: { tone: 'light', routeStroke: 'solid' },
    icons: { style: 'outline', strokeWidth: 1.5 },
    testimonial: { style: 'cards' },
  },
  layout: { density: 'airy', contentWidth: 'wide', dividers: 'none' },
  motion: { intensity: 'subtle', reveal: 'scale', hoverLift: true },
  content: { headline: 'question', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
