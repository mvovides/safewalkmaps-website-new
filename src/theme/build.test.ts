import { describe, expect, it } from 'vitest';

import { buildTokens, deepMerge } from './build';
import { hexToRgb, rgbToHsl } from './color';
import { intensityMotion } from './derive';
import { defaultTokens, FONT_STACKS } from './tokens';

describe('buildTokens', () => {
  it('anchors the ramps on the given brand colours, with the builder defaults', () => {
    const tokens = buildTokens({ navy: '#062A5E', green: '#17F58B' });
    expect(tokens.colors.navy['800']).toBe('#062A5E');
    expect(tokens.colors.green['500']).toBe('#17F58B');
    // The original site's medium shadow, rebuilt from the logo navy.
    expect(tokens.shadows.md).toBe(
      '0 10px 28px -8px rgb(6 42 94 / 0.12), 0 2px 6px -2px rgb(6 42 94 / 0.06)',
    );
    expect(tokens.shadows.green).toMatch(/^0 12px 32px -10px rgb\(/);
    expect(tokens.spacing).toEqual(defaultTokens.spacing);
    expect(tokens.motion).toEqual(intensityMotion('standard'));
    expect(tokens.typography.sans).toBe(FONT_STACKS.inter);
  });

  it('builds a dark scheme', () => {
    const tokens = buildTokens({ navy: '#062A5E', green: '#17F58B', scheme: 'dark' });
    expect(tokens.colors.scheme).toBe('dark');
    expect(rgbToHsl(hexToRgb(tokens.colors.surface.base)).l).toBeLessThan(12);
  });

  it('applies overrides last', () => {
    const tokens = buildTokens({
      navy: '#062A5E',
      green: '#17F58B',
      overrides: { colors: { ink: { primary: '#0A0A0A' } }, radius: { card: '0px' } },
    });
    expect(tokens.colors.ink.primary).toBe('#0A0A0A');
    expect(tokens.radius.card).toBe('0px');
    expect(tokens.radius.lg).toBe('1rem');
  });

  it('deepMerge leaves untouched branches alone', () => {
    const merged = deepMerge({ a: { b: 1, c: 2 }, d: 3 }, { a: { c: 9 } });
    expect(merged).toEqual({ a: { b: 1, c: 9 }, d: 3 });
  });
});
