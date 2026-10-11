import { hexToChannels } from './cssVariables';
import type { GreenStep, NavyStep, ThemeTokens } from './tokens';

export type Rgb = { r: number; g: number; b: number };
/** h in degrees 0–360, s and l in percent 0–100. */
export type Hsl = { h: number; s: number; l: number };

export function hexToRgb(hex: string): Rgb {
  const [r, g, b] = hexToChannels(hex).split(' ').map(Number) as [number, number, number];
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const sector = Math.floor((((h % 360) + 360) % 360) / 60);
  const table: ReadonlyArray<readonly [number, number, number]> = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r1, g1, b1] = table[sector] ?? [0, 0, 0];
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

/** Linear mix of two hex colours in rgb space; t = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
  });
}

export function relativeLuminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio, to two decimals. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function wcagLevel(ratio: number, largeText = false): 'AAA' | 'AA' | 'Fail' {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'Fail';
}

/** Lightness targets per step, read off today's palette. The anchor step is kept exactly. */
export const NAVY_LIGHTNESS: Record<NavyStep, number> = {
  '50': 97,
  '100': 93,
  '200': 85,
  '300': 71,
  '400': 53,
  '500': 39,
  '600': 28,
  '700': 23,
  '800': 20,
  '900': 13,
  '950': 7,
};
export const GREEN_LIGHTNESS: Record<GreenStep, number> = {
  '50': 96,
  '100': 91,
  '200': 81,
  '300': 69,
  '400': 58,
  '500': 52,
  '600': 41,
  '700': 30,
  '800': 23,
  '900': 16,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A tonal ramp from one anchor colour. Hue is kept, lightness follows the step table
 * (shifted half-way toward the anchor's own lightness so an unusual anchor still gets a
 * usable ramp), and saturation eases off toward the light end so tints stay clean.
 */
export function generateRamp<F extends 'navy' | 'green'>(
  anchor: string,
  family: F,
): F extends 'navy' ? Record<NavyStep, string> : Record<GreenStep, string> {
  const base = rgbToHsl(hexToRgb(anchor));
  const table: Record<string, number> = family === 'navy' ? NAVY_LIGHTNESS : GREEN_LIGHTNESS;
  const anchorStep = family === 'navy' ? '800' : '500';
  const offset = (base.l - (table[anchorStep] ?? base.l)) * 0.5;
  const entries = Object.entries(table).map(([step, target]) => {
    if (step === anchorStep) return [step, rgbToHex(hexToRgb(anchor))];
    const l = clamp(target + offset, 3, 98);
    const s = l > 80 ? base.s * (1 - (l - 80) / 60) : base.s;
    return [step, hslToHex({ h: base.h, s: clamp(s, 8, 100), l })];
  });
  return Object.fromEntries(entries) as never;
}

type Semantic = Pick<ThemeTokens['colors'], 'ink' | 'surface' | 'line'>;

/** Ink, surface and line colours that suit a palette, for either scheme. */
export function deriveSemantic(
  navy: Record<NavyStep, string>,
  green: Record<GreenStep, string>,
  scheme: 'light' | 'dark',
): Semantic {
  const h = rgbToHsl(hexToRgb(navy['800'])).h;
  const navyChannels = hexToChannels(navy['800']);
  void green;
  if (scheme === 'light') {
    return {
      ink: {
        primary: hslToHex({ h, s: 77, l: 10 }),
        secondary: hslToHex({ h, s: 26, l: 39 }),
        tertiary: hslToHex({ h, s: 22, l: 56 }),
        inverse: '#FFFFFF',
      },
      surface: {
        base: '#FFFFFF',
        secondary: hslToHex({ h, s: 38, l: 97.5 }),
        tertiary: hslToHex({ h, s: 40, l: 95 }),
        navy: navy['900'],
        navySoft: hslToHex({ h, s: 85, l: 16 }),
      },
      line: {
        base: `rgb(${navyChannels} / 0.09)`,
        strong: `rgb(${navyChannels} / 0.16)`,
        inverse: 'rgb(255 255 255 / 0.12)',
        inverseStrong: 'rgb(255 255 255 / 0.22)',
      },
    };
  }
  return {
    ink: {
      primary: hslToHex({ h, s: 40, l: 97 }),
      secondary: hslToHex({ h, s: 20, l: 76 }),
      tertiary: hslToHex({ h, s: 16, l: 58 }),
      inverse: hslToHex({ h, s: 70, l: 10 }),
    },
    surface: {
      base: hslToHex({ h, s: 60, l: 6 }),
      secondary: hslToHex({ h, s: 50, l: 9 }),
      tertiary: hslToHex({ h, s: 45, l: 13 }),
      navy: navy['900'],
      navySoft: hslToHex({ h, s: 85, l: 16 }),
    },
    line: {
      base: 'rgb(255 255 255 / 0.10)',
      strong: 'rgb(255 255 255 / 0.18)',
      inverse: 'rgb(255 255 255 / 0.12)',
      inverseStrong: 'rgb(255 255 255 / 0.22)',
    },
  };
}
