import { describe, expect, it } from 'vitest';

import {
  contentWidthSpacing,
  densitySpacing,
  intensityMotion,
  radiusScale,
  shadowSet,
  typeScale,
} from './derive';
import { defaultTokens } from './tokens';

describe('derive', () => {
  it('reproduces today at the default settings', () => {
    expect(densitySpacing('comfortable')).toEqual({
      section: defaultTokens.spacing.section,
      sectionLg: defaultTokens.spacing.sectionLg,
      gutter: defaultTokens.spacing.gutter,
    });
    expect(contentWidthSpacing('default')).toEqual({ shell: '80rem', shellWide: '90rem' });
    expect(intensityMotion('standard')).toEqual(defaultTokens.motion);
    expect(radiusScale(1, 'pill')).toEqual(defaultTokens.radius);
    expect(shadowSet('medium', '#062A5E', '#031B3D', '#0A9159')).toEqual(defaultTokens.shadows);
    expect(typeScale('default')).toEqual(defaultTokens.typography.scale);
  });

  it('shapes buttons from the radius scale', () => {
    expect(radiusScale(0.5, 'rounded').control).toBe(radiusScale(0.5, 'rounded').md);
    expect(radiusScale(0.5, 'square').control).toBe('0.25rem');
    expect(radiusScale(0, 'rounded').lg).toBe('0px');
    expect(radiusScale(0, 'rounded').pill).toBe('999px');
  });

  it('scales shadows by level', () => {
    expect(shadowSet('none', '#062A5E', '#031B3D', '#0A9159').md).toBe('none');
    expect(shadowSet('soft', '#062A5E', '#031B3D', '#0A9159').md).toMatch(
      /rgb\(6 42 94 \/ 0\.07\)/,
    );
    expect(shadowSet('dramatic', '#062A5E', '#031B3D', '#0A9159').md).toMatch(/36px/);
  });

  it('standard motion is fixed, whatever the site itself uses', () => {
    expect(intensityMotion('standard')).toEqual({
      duration: { fast: '150ms', base: '240ms', slow: '420ms', slower: '700ms' },
      ease: defaultTokens.motion.ease,
      revealScale: 1,
    });
  });

  it('motion intensity none stops the reveals', () => {
    const none = intensityMotion('none');
    expect(none.revealScale).toBe(0);
    expect(none.duration.base).toBe('0ms');
    expect(intensityMotion('expressive').revealScale).toBeGreaterThan(1);
  });

  it('type scales move the display steps only', () => {
    const display = typeScale('display');
    expect(display['display-xl'].size).not.toBe(defaultTokens.typography.scale['display-xl'].size);
    expect(display.body).toEqual(defaultTokens.typography.scale.body);
    expect(typeScale('compact')['display-xl'].size).toMatch(/^clamp\(2\.15rem/);
  });
});
