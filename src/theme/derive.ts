import type { BUTTON_SHAPES, CONTENT_WIDTHS, DENSITIES, MOTION_INTENSITIES } from './config';
import { hexToChannels } from './cssVariables';
import {
  defaultTokens,
  SHADOW_KEYS,
  TYPE_STEPS,
  type ShadowKey,
  type ThemeTokens,
  type TypeStep,
} from './tokens';

type Density = (typeof DENSITIES)[number];
type ContentWidth = (typeof CONTENT_WIDTHS)[number];
type Intensity = (typeof MOTION_INTENSITIES)[number];
type ButtonShape = (typeof BUTTON_SHAPES)[number];
export type ShadowLevel = 'none' | 'soft' | 'medium' | 'dramatic';
export type TypeScaleName = 'compact' | 'default' | 'editorial' | 'display';

const trim = (n: number) => String(Math.round(n * 10000) / 10000);
const rem = (n: number) => (n === 0 ? '0px' : `${trim(n)}rem`);

export function densitySpacing(
  density: Density,
): Pick<ThemeTokens['spacing'], 'section' | 'sectionLg' | 'gutter'> {
  switch (density) {
    case 'compact':
      return {
        section: 'clamp(3.5rem, 7vh, 6rem)',
        sectionLg: 'clamp(4.5rem, 9vh, 8rem)',
        gutter: 'clamp(1rem, 3vw, 2rem)',
      };
    case 'airy':
      return {
        section: 'clamp(6.5rem, 14vh, 12rem)',
        sectionLg: 'clamp(8rem, 18vh, 16rem)',
        gutter: 'clamp(1.5rem, 5vw, 3rem)',
      };
    default:
      return {
        section: defaultTokens.spacing.section,
        sectionLg: defaultTokens.spacing.sectionLg,
        gutter: defaultTokens.spacing.gutter,
      };
  }
}

export function contentWidthSpacing(
  width: ContentWidth,
): Pick<ThemeTokens['spacing'], 'shell' | 'shellWide'> {
  switch (width) {
    case 'narrow':
      return { shell: '68rem', shellWide: '80rem' };
    case 'wide':
      return { shell: '90rem', shellWide: '100rem' };
    default:
      return { shell: '80rem', shellWide: '90rem' };
  }
}

export function intensityMotion(intensity: Intensity): ThemeTokens['motion'] {
  const ease = defaultTokens.motion.ease;
  switch (intensity) {
    case 'none':
      return {
        duration: { fast: '0ms', base: '0ms', slow: '0ms', slower: '0ms' },
        ease,
        revealScale: 0,
      };
    case 'subtle':
      return {
        duration: { fast: '120ms', base: '180ms', slow: '300ms', slower: '480ms' },
        ease,
        revealScale: 0.6,
      };
    case 'expressive':
      return {
        duration: { fast: '180ms', base: '320ms', slow: '560ms', slower: '900ms' },
        ease,
        revealScale: 1.4,
      };
    default:
      // Spelled out rather than read from `defaultTokens`: the site's own motion
      // is a choice of intensity, so it cannot also define what "standard" means.
      return {
        duration: { fast: '150ms', base: '240ms', slow: '420ms', slower: '700ms' },
        ease,
        revealScale: 1,
      };
  }
}

/** The radius scale from one base (today 1rem = `lg`). The phone bezel is a device, so it is fixed. */
export function radiusScale(baseRem: number, shape: ButtonShape): ThemeTokens['radius'] {
  const scale = {
    xs: rem(baseRem * 0.375),
    sm: rem(baseRem * 0.5),
    md: rem(baseRem * 0.75),
    lg: rem(baseRem),
    xl: rem(baseRem * 1.25),
    '2xl': rem(baseRem * 1.75),
    '3xl': rem(baseRem * 2.25),
    phone: '2.875rem',
    pill: '999px',
  };
  const control = shape === 'pill' ? '999px' : shape === 'rounded' ? scale.md : '0.25rem';
  return { ...scale, control, card: scale['2xl'] };
}

type Layer = {
  y: number;
  blur: number;
  spread?: number;
  alpha: number;
  color: 'navy' | 'navyDeep' | 'green' | 'white';
  inset?: boolean;
};

/** Today's shadows as geometry, so other levels can be derived from the same layers. */
const MEDIUM: Record<ShadowKey, Layer[]> = {
  xs: [{ y: 1, blur: 2, alpha: 0.06, color: 'navy' }],
  sm: [
    { y: 2, blur: 8, spread: -2, alpha: 0.08, color: 'navy' },
    { y: 1, blur: 2, alpha: 0.04, color: 'navy' },
  ],
  md: [
    { y: 10, blur: 28, spread: -8, alpha: 0.12, color: 'navy' },
    { y: 2, blur: 6, spread: -2, alpha: 0.06, color: 'navy' },
  ],
  lg: [
    { y: 26, blur: 60, spread: -18, alpha: 0.16, color: 'navy' },
    { y: 6, blur: 16, spread: -8, alpha: 0.08, color: 'navy' },
  ],
  xl: [
    { y: 44, blur: 96, spread: -28, alpha: 0.22, color: 'navy' },
    { y: 10, blur: 24, spread: -12, alpha: 0.1, color: 'navy' },
  ],
  phone: [
    { y: 56, blur: 120, spread: -32, alpha: 0.34, color: 'navyDeep' },
    { y: 12, blur: 32, spread: -12, alpha: 0.18, color: 'navyDeep' },
  ],
  phoneSm: [
    { y: 28, blur: 64, spread: -22, alpha: 0.3, color: 'navyDeep' },
    { y: 6, blur: 18, spread: -8, alpha: 0.14, color: 'navyDeep' },
  ],
  green: [{ y: 12, blur: 32, spread: -10, alpha: 0.42, color: 'green' }],
  greenLg: [{ y: 18, blur: 48, spread: -12, alpha: 0.46, color: 'green' }],
  inset: [{ y: 1, blur: 0, alpha: 0.08, color: 'white', inset: true }],
};

const LEVELS: Record<Exclude<ShadowLevel, 'none'>, { alpha: number; blur: number; y: number }> = {
  soft: { alpha: 0.6, blur: 0.85, y: 0.85 },
  medium: { alpha: 1, blur: 1, y: 1 },
  dramatic: { alpha: 1.35, blur: 1.3, y: 1.2 },
};

/** A complete shadow set tinted from the palette; `medium` reproduces today's strings exactly. */
export function shadowSet(
  level: ShadowLevel,
  navy800: string,
  navy900: string,
  green700: string,
): ThemeTokens['shadows'] {
  if (level === 'none') {
    return Object.fromEntries(SHADOW_KEYS.map((key) => [key, 'none'])) as ThemeTokens['shadows'];
  }
  const factor = LEVELS[level];
  const colors = {
    navy: hexToChannels(navy800),
    navyDeep: hexToChannels(navy900),
    green: hexToChannels(green700),
    white: '255 255 255',
  };
  const render = (layer: Layer) => {
    const y = layer.inset ? layer.y : Math.round(layer.y * factor.y);
    const blur = layer.inset ? layer.blur : Math.round(layer.blur * factor.blur);
    const alpha = Math.min(0.6, layer.alpha * factor.alpha).toFixed(2);
    const spread = layer.spread === undefined ? '' : ` ${layer.spread}px`;
    const prefix = layer.inset ? 'inset ' : '';
    // A zero blur is written bare, matching how the original strings were authored.
    const blurText = blur === 0 ? '0' : `${blur}px`;
    return `${prefix}0 ${y}px ${blurText}${spread} rgb(${colors[layer.color]} / ${alpha})`;
  };
  return Object.fromEntries(
    SHADOW_KEYS.map((key) => [key, MEDIUM[key].map(render).join(', ')]),
  ) as ThemeTokens['shadows'];
}

const scaleClamp = (value: string, factor: number) =>
  value.replace(
    /(\d*\.?\d+)(rem|vw)/g,
    (_, n: string, unit: string) => `${trim(Number(n) * factor)}${unit}`,
  );
const adjustEm = (value: string, delta: number) => `${trim((parseFloat(value) || 0) + delta)}em`;
const adjustNumber = (value: string, delta: number, min = 0.9) =>
  trim(Math.max(min, parseFloat(value) + delta));
const DISPLAY_STEPS: TypeStep[] = [
  'display-2xl',
  'display-xl',
  'display-lg',
  'display-md',
  'display-sm',
];

/** Named type scales. Only the display steps move; body copy stays readable at every setting. */
export function typeScale(name: TypeScaleName): ThemeTokens['typography']['scale'] {
  const base = defaultTokens.typography.scale;
  if (name === 'default') return base;
  const factor = name === 'compact' ? 0.86 : name === 'editorial' ? 1.08 : 1.22;
  const leading = name === 'compact' ? 0.04 : name === 'editorial' ? 0.02 : -0.03;
  const tracking = name === 'compact' ? 0 : name === 'editorial' ? 0.01 : -0.01;
  return Object.fromEntries(
    TYPE_STEPS.map((step) => {
      const style = base[step];
      if (!DISPLAY_STEPS.includes(step)) {
        if (name === 'editorial' && (step === 'body' || step === 'body-lg')) {
          return [step, { ...style, lineHeight: '1.7' }];
        }
        return [step, style];
      }
      return [
        step,
        {
          size: scaleClamp(style.size, factor),
          lineHeight: adjustNumber(style.lineHeight, leading),
          letterSpacing: adjustEm(style.letterSpacing, tracking),
        },
      ];
    }),
  ) as ThemeTokens['typography']['scale'];
}
