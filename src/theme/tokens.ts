/**
 * The SafeWalkMaps design tokens, as data.
 *
 * `defaultTokens` holds the site's values: the "SafeWalkMaps Today" preset as
 * chosen in the theme playground on 2026-10-17. The Tailwind config imports
 * this file and emits the values as CSS custom properties, so this module must
 * stay free of DOM types and `import.meta` (it is type-checked under
 * tsconfig.node.json too).
 */

export const NAVY_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;
export const GREEN_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
] as const;
export const TYPE_STEPS = [
  'display-2xl',
  'display-xl',
  'display-lg',
  'display-md',
  'display-sm',
  'body-xl',
  'body-lg',
  'body',
  'body-sm',
  'caption',
  'label',
] as const;
export const RADIUS_KEYS = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'phone',
  'pill',
  'control',
  'card',
] as const;
export const SHADOW_KEYS = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'phone',
  'phoneSm',
  'green',
  'greenLg',
  'inset',
] as const;

export type NavyStep = (typeof NAVY_STEPS)[number];
export type GreenStep = (typeof GREEN_STEPS)[number];
export type TypeStep = (typeof TYPE_STEPS)[number];
export type RadiusKey = (typeof RADIUS_KEYS)[number];
export type ShadowKey = (typeof SHADOW_KEYS)[number];

/**
 * Stacks for the families the site bundles through @fontsource. Each package
 * registers its family with a " Variable" suffix — "Inter Variable", not
 * "Inter" — and a stack that leaves it out silently falls through to the
 * system font.
 */
export const FONT_STACKS = {
  instrumentSans:
    "'Instrument Sans Variable', 'Instrument Sans', 'Inter Variable', Inter, system-ui, sans-serif",
  inter:
    "'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
} as const;

export type TypeStyle = { size: string; lineHeight: string; letterSpacing: string };
export type HeadingWeight = 500 | 600 | 700 | 800;

export type ThemeTokens = {
  colors: {
    scheme: 'light' | 'dark';
    navy: Record<NavyStep, string>;
    green: Record<GreenStep, string>;
    ink: { primary: string; secondary: string; tertiary: string; inverse: string };
    surface: { base: string; secondary: string; tertiary: string; navy: string; navySoft: string };
    /** Full `rgb(r g b / a)` strings: the alpha is part of the value. */
    line: { base: string; strong: string; inverse: string; inverseStrong: string };
    danger: { base: string; soft: string };
    warning: { base: string; ink: string; soft: string };
  };
  typography: {
    sans: string;
    /** Heading family; null means "same as sans". */
    display: string | null;
    mono: string;
    headingWeight: HeadingWeight;
    scale: Record<TypeStep, TypeStyle>;
  };
  radius: Record<RadiusKey, string>;
  shadows: Record<ShadowKey, string>;
  spacing: {
    section: string;
    sectionLg: string;
    gutter: string;
    shell: string;
    shellWide: string;
    prose: string;
    proseLg: string;
  };
  motion: {
    duration: { fast: string; base: string; slow: string; slower: string };
    ease: { outExpo: string; outQuint: string; inOutSoft: string; outBack: string };
    /** Multiplies the distance a scroll reveal travels. 1 = today, 0 = none. */
    revealScale: number;
  };
};

/*
 * The palette is the playground's calmer take on the logo: a brighter, bluer
 * navy and a softer green than the logo's own gradients. The logo itself does
 * not follow it — ShieldMark and the wordmark in Logo keep the supplied
 * artwork's colours.
 */
export const defaultTokens: ThemeTokens = {
  colors: {
    scheme: 'light',
    navy: {
      '50': '#F8FAFC',
      '100': '#F8FAFC',
      '200': '#E1E9F4',
      '300': '#A6C1E8',
      '400': '#5D8FD5',
      '500': '#3169BA',
      '600': '#25508E',
      '700': '#20457A',
      '800': '#244E8A', // primary buttons, navigation labels, focus ring
      '900': '#152E51',
      '950': '#0F2039',
    },
    green: {
      '50': '#EAF7F1',
      '100': '#D7F1E4',
      '200': '#ACE9CC',
      '300': '#7CDCAE', // green text on the navy surface
      '400': '#4FD192',
      '500': '#34C57F', // signature accent: graphics, routes, accent buttons
      '600': '#2A9F67',
      '700': '#1E734A',
      '800': '#175638', // green text on white
      '900': '#0F3A25',
    },
    ink: { primary: '#06162D', secondary: '#4A5F7D', tertiary: '#768BA7', inverse: '#FFFFFF' },
    surface: {
      base: '#FFFFFF',
      secondary: '#F6F8FB',
      tertiary: '#EDF1F7',
      navy: '#09479C',
      navySoft: '#06234B',
    },
    line: {
      base: 'rgb(31 92 178 / 0.17)',
      strong: 'rgb(31 92 178 / 0.31)',
      inverse: 'rgb(255 255 255 / 0.12)',
      inverseStrong: 'rgb(255 255 255 / 0.22)',
    },
    danger: { base: '#D92D20', soft: '#FEF3F2' },
    warning: { base: '#F79009', ink: '#B54708', soft: '#FFFAEB' },
  },
  typography: {
    sans: FONT_STACKS.instrumentSans,
    display: null,
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    headingWeight: 700,
    scale: {
      'display-2xl': {
        size: 'clamp(2.875rem, 9.4vw, 8rem)',
        lineHeight: '0.94',
        letterSpacing: '-0.045em',
      },
      'display-xl': {
        size: 'clamp(2.5rem, 6.6vw, 5.25rem)',
        lineHeight: '0.98',
        letterSpacing: '-0.04em',
      },
      'display-lg': {
        size: 'clamp(2.125rem, 5.4vw, 4.25rem)',
        lineHeight: '1.02',
        letterSpacing: '-0.035em',
      },
      'display-md': {
        size: 'clamp(1.75rem, 3.9vw, 3rem)',
        lineHeight: '1.06',
        letterSpacing: '-0.03em',
      },
      'display-sm': {
        size: 'clamp(1.4375rem, 2.6vw, 2.125rem)',
        lineHeight: '1.14',
        letterSpacing: '-0.022em',
      },
      'body-xl': {
        size: 'clamp(1.125rem, 1.5vw, 1.4375rem)',
        lineHeight: '1.5',
        letterSpacing: '-0.012em',
      },
      'body-lg': {
        size: 'clamp(1.0625rem, 1.1vw, 1.1875rem)',
        lineHeight: '1.6',
        letterSpacing: '-0.008em',
      },
      body: { size: '1.0625rem', lineHeight: '1.62', letterSpacing: '-0.006em' },
      'body-sm': { size: '0.9375rem', lineHeight: '1.6', letterSpacing: '-0.004em' },
      caption: { size: '0.8125rem', lineHeight: '1.5', letterSpacing: '0' },
      label: { size: '0.6875rem', lineHeight: '1.4', letterSpacing: '0.12em' },
    },
  },
  radius: {
    xs: '0.375rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.75rem',
    '3xl': '2.25rem',
    phone: '2.875rem',
    pill: '999px',
    control: '999px',
    card: '1.75rem',
  },
  // Flat: depth comes from hairlines and translucent material, not elevation.
  shadows: {
    xs: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
    phone: 'none',
    phoneSm: 'none',
    green: 'none',
    greenLg: 'none',
    inset: 'none',
  },
  spacing: {
    section: 'clamp(5rem, 11vh, 9.5rem)',
    sectionLg: 'clamp(6.5rem, 15vh, 13rem)',
    gutter: 'clamp(1.25rem, 4vw, 2.5rem)',
    shell: '80rem', // 1280px content column
    shellWide: '90rem', // 1440px for full-bleed visuals
    prose: '38rem',
    proseLg: '44rem',
  },
  motion: {
    // The "expressive" intensity: longer transitions, reveals that travel further.
    duration: { fast: '180ms', base: '320ms', slow: '560ms', slower: '900ms' },
    ease: {
      outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      outQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
      inOutSoft: 'cubic-bezier(0.65, 0, 0.35, 1)',
      outBack: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
    },
    revealScale: 1.4,
  },
};
