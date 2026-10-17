import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  deriveSemantic,
  generateRamp,
  hexToRgb,
  hslToHex,
  mix,
  rgbToHex,
  rgbToHsl,
  wcagLevel,
} from './color';
import { defaultTokens } from './tokens';

describe('conversions', () => {
  it('round-trips hex through rgb', () => {
    expect(rgbToHex(hexToRgb('#062A5E'))).toBe('#062A5E');
    expect(rgbToHex(hexToRgb('#17f58b'))).toBe('#17F58B');
  });

  it('reads the brand navy as a ~215° hue at ~20% lightness', () => {
    const hsl = rgbToHsl(hexToRgb('#062A5E'));
    expect(Math.round(hsl.h)).toBe(215);
    expect(Math.round(hsl.l)).toBe(20);
  });

  it('hslToHex inverts rgbToHsl closely', () => {
    expect(hslToHex(rgbToHsl(hexToRgb('#4A5F7D')))).toBe('#4A5F7D');
  });

  it('mixes in rgb space', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});

describe('contrast', () => {
  it('matches the documented palette figures', () => {
    expect(contrastRatio('#06152E', '#FFFFFF')).toBeCloseTo(18.2, 0);
    expect(contrastRatio('#4A5F7D', '#FFFFFF')).toBeCloseTo(6.5, 0);
    expect(contrastRatio('#17F58B', '#031B3D')).toBeCloseTo(11.8, 0);
  });

  it('grades against WCAG 2.1', () => {
    expect(wcagLevel(7.2)).toBe('AAA');
    expect(wcagLevel(4.6)).toBe('AA');
    expect(wcagLevel(3.4)).toBe('Fail');
    expect(wcagLevel(3.4, true)).toBe('AA');
  });
});

describe('generateRamp', () => {
  it('keeps the anchor exactly and gets lighter toward 50', () => {
    const navy = generateRamp('#062A5E', 'navy');
    expect(navy['800']).toBe('#062A5E');
    const l = (hex: string) => rgbToHsl(hexToRgb(hex)).l;
    expect(l(navy['50'])).toBeGreaterThan(l(navy['100']));
    expect(l(navy['100'])).toBeGreaterThan(l(navy['500']));
    expect(l(navy['900'])).toBeGreaterThan(l(navy['950']));
    const green = generateRamp('#17F58B', 'green');
    expect(green['500']).toBe('#17F58B');
    expect(l(green['50'])).toBeGreaterThan(90);
  });
});

describe('deriveSemantic', () => {
  it('produces a light scheme close to the original site from the logo colours', () => {
    const semantic = deriveSemantic(
      generateRamp('#062A5E', 'navy'),
      generateRamp('#17F58B', 'green'),
      'light',
    );
    expect(semantic.surface.base).toBe('#FFFFFF');
    expect(contrastRatio(semantic.ink.primary, '#FFFFFF')).toBeGreaterThan(15);
    expect(semantic.line.base).toBe('rgb(6 42 94 / 0.09)');
  });

  it('produces dark surfaces for the dark scheme', () => {
    const semantic = deriveSemantic(defaultTokens.colors.navy, defaultTokens.colors.green, 'dark');
    expect(rgbToHsl(hexToRgb(semantic.surface.base)).l).toBeLessThan(12);
    expect(contrastRatio(semantic.ink.primary, semantic.surface.base)).toBeGreaterThan(12);
    expect(semantic.line.base).toBe('rgb(255 255 255 / 0.10)');
  });
});
