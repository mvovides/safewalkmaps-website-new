import type { BUTTON_SHAPES, CONTENT_WIDTHS, DENSITIES, MOTION_INTENSITIES } from './config';
import { deriveSemantic, generateRamp } from './color';
import {
  contentWidthSpacing,
  densitySpacing,
  intensityMotion,
  radiusScale,
  shadowSet,
  typeScale,
  type ShadowLevel,
  type TypeScaleName,
} from './derive';
import {
  defaultTokens,
  FONT_STACKS,
  TYPE_STEPS,
  type HeadingWeight,
  type ThemeTokens,
} from './tokens';

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type BuildOptions = {
  navy: string;
  green: string;
  scheme?: 'light' | 'dark';
  sans?: string;
  display?: string | null;
  mono?: string;
  headingWeight?: HeadingWeight;
  typeScale?: TypeScaleName;
  /** Added to every display step's letter-spacing, in em (negative = tighter). */
  trackingAdjust?: number;
  radiusBase?: number;
  buttonShape?: (typeof BUTTON_SHAPES)[number];
  shadows?: ShadowLevel;
  density?: (typeof DENSITIES)[number];
  contentWidth?: (typeof CONTENT_WIDTHS)[number];
  intensity?: (typeof MOTION_INTENSITIES)[number];
  /** Applied last, over everything derived above. */
  overrides?: DeepPartial<ThemeTokens>;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  if (!isObject(base) || !isObject(patch)) return (patch as T) ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isObject(value) && isObject(out[key]) ? deepMerge(out[key], value as never) : value;
  }
  return out as T;
}

/** Assemble a full token set from a handful of design decisions. Used by the presets and the Colours tab. */
export function buildTokens(options: BuildOptions): ThemeTokens {
  const scheme = options.scheme ?? 'light';
  const navy = generateRamp(options.navy, 'navy');
  const green = generateRamp(options.green, 'green');
  const semantic = deriveSemantic(navy, green, scheme);
  const scale = typeScale(options.typeScale ?? 'default');
  const adjust = options.trackingAdjust ?? 0;
  const tracked = adjust
    ? (Object.fromEntries(
        TYPE_STEPS.map((step) => {
          const style = scale[step];
          if (!step.startsWith('display')) return [step, style];
          const em = (parseFloat(style.letterSpacing) || 0) + adjust;
          return [step, { ...style, letterSpacing: `${Math.round(em * 1000) / 1000}em` }];
        }),
      ) as ThemeTokens['typography']['scale'])
    : scale;

  const tokens: ThemeTokens = {
    colors: {
      scheme,
      navy,
      green,
      ...semantic,
      danger: defaultTokens.colors.danger,
      warning: defaultTokens.colors.warning,
    },
    typography: {
      sans: options.sans ?? FONT_STACKS.inter,
      display: options.display ?? null,
      mono: options.mono ?? defaultTokens.typography.mono,
      headingWeight: options.headingWeight ?? 600,
      scale: tracked,
    },
    radius: radiusScale(options.radiusBase ?? 1, options.buttonShape ?? 'pill'),
    shadows: shadowSet(options.shadows ?? 'medium', navy['800'], navy['900'], green['700']),
    spacing: {
      ...densitySpacing(options.density ?? 'comfortable'),
      ...contentWidthSpacing(options.contentWidth ?? 'default'),
      prose: defaultTokens.spacing.prose,
      proseLg: defaultTokens.spacing.proseLg,
    },
    motion: intensityMotion(options.intensity ?? 'standard'),
  };
  return deepMerge(tokens, options.overrides);
}
