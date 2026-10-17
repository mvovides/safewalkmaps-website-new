import { describe, expect, it } from 'vitest';

import { hexToChannels, kebab, tokensToCssVariables } from './cssVariables';
import { defaultTokens } from './tokens';

/** Values from the preset chosen in the playground on 2026-10-17. */
const CHOSEN = {
  navy800: '#244E8A',
  green500: '#34C57F',
  inkSecondary: '#4A5F7D',
  surfaceSecondary: '#F6F8FB',
  surfaceNavy: '#09479C',
  lineStrong: 'rgb(31 92 178 / 0.31)',
  radiusLg: '1rem',
  shadowMd: 'none',
  displayXl: {
    size: 'clamp(2.5rem, 6.6vw, 5.25rem)',
    lineHeight: '0.98',
    letterSpacing: '-0.04em',
  },
  section: 'clamp(5rem, 11vh, 9.5rem)',
  durationBase: '320ms',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

describe('hexToChannels', () => {
  it('converts six-digit hex to space-separated channels', () => {
    expect(hexToChannels('#062A5E')).toBe('6 42 94');
    expect(hexToChannels('#ffffff')).toBe('255 255 255');
  });

  it('expands three-digit hex', () => {
    expect(hexToChannels('#fff')).toBe('255 255 255');
  });

  it('throws on anything else', () => {
    expect(() => hexToChannels('rgb(1 2 3)')).toThrow(/hex/);
  });
});

describe('kebab', () => {
  it('turns camelCase into kebab-case', () => {
    expect(kebab('navySoft')).toBe('navy-soft');
    expect(kebab('phoneSm')).toBe('phone-sm');
    expect(kebab('base')).toBe('base');
  });
});

describe('defaultTokens', () => {
  it('pins the values chosen in the playground', () => {
    expect(defaultTokens.colors.navy['800']).toBe(CHOSEN.navy800);
    expect(defaultTokens.colors.green['500']).toBe(CHOSEN.green500);
    expect(defaultTokens.colors.ink.secondary).toBe(CHOSEN.inkSecondary);
    expect(defaultTokens.colors.surface.secondary).toBe(CHOSEN.surfaceSecondary);
    expect(defaultTokens.colors.surface.navy).toBe(CHOSEN.surfaceNavy);
    expect(defaultTokens.colors.line.strong).toBe(CHOSEN.lineStrong);
    expect(defaultTokens.radius.lg).toBe(CHOSEN.radiusLg);
    expect(defaultTokens.shadows.md).toBe(CHOSEN.shadowMd);
    expect(defaultTokens.typography.scale['display-xl']).toEqual(CHOSEN.displayXl);
    expect(defaultTokens.spacing.section).toBe(CHOSEN.section);
    expect(defaultTokens.motion.duration.base).toBe(CHOSEN.durationBase);
    expect(defaultTokens.motion.ease.outExpo).toBe(CHOSEN.easeOutExpo);
    expect(defaultTokens.radius.control).toBe('999px');
    expect(defaultTokens.radius.card).toBe('1.75rem');
    expect(defaultTokens.typography.headingWeight).toBe(700);
    expect(defaultTokens.motion.revealScale).toBe(1.4);
  });

  it('names the bundled family the way its package registers it', () => {
    expect(defaultTokens.typography.sans).toMatch(/^'Instrument Sans Variable', /);
  });
});

describe('tokensToCssVariables', () => {
  const vars = tokensToCssVariables(defaultTokens);

  it('emits channel triplets for alpha-capable families', () => {
    expect(vars['--color-navy-800']).toBe('36 78 138');
    expect(vars['--color-green-500']).toBe('52 197 127');
    expect(vars['--color-ink-primary']).toBe('6 22 45');
    expect(vars['--color-surface']).toBe('255 255 255');
    expect(vars['--color-surface-navy-soft']).toBe('6 35 75');
    expect(vars['--color-warning-ink']).toBe('181 71 8');
    expect(vars['--color-danger-soft']).toBe('254 243 242');
  });

  it('emits line colours verbatim because their alpha is part of the value', () => {
    expect(vars['--color-line']).toBe('rgb(31 92 178 / 0.17)');
    expect(vars['--color-line-inverse-strong']).toBe('rgb(255 255 255 / 0.22)');
  });

  it('emits typography, radius, shadow, spacing and motion variables', () => {
    expect(vars['--font-sans']).toContain("'Instrument Sans Variable'");
    expect(vars['--font-display']).toBe('var(--font-sans)');
    expect(vars['--heading-weight']).toBe('700');
    expect(vars['--text-display-xl']).toBe('clamp(2.5rem, 6.6vw, 5.25rem)');
    expect(vars['--leading-display-xl']).toBe('0.98');
    expect(vars['--tracking-display-xl']).toBe('-0.04em');
    expect(vars['--radius-2xl']).toBe('1.75rem');
    expect(vars['--radius-control']).toBe('999px');
    expect(vars['--shadow-phone-sm']).toBe('none');
    expect(vars['--shadow-green-lg']).toBe('none');
    expect(vars['--space-section-lg']).toBe('clamp(6.5rem, 15vh, 13rem)');
    expect(vars['--width-shell']).toBe('80rem');
    expect(vars['--duration-slower']).toBe('900ms');
    expect(vars['--ease-in-out-soft']).toBe('cubic-bezier(0.65, 0, 0.35, 1)');
    expect(vars['--reveal-scale']).toBe('1.4');
    expect(vars['--color-scheme']).toBe('light');
  });

  it('derives the legacy hex variables the SVG illustrations read', () => {
    expect(vars['--brand-navy']).toBe('#244e8a');
    expect(vars['--brand-navy-bright']).toBe('#20457a');
    expect(vars['--brand-navy-deep']).toBe('#152e51');
    expect(vars['--brand-navy-darkest']).toBe('#0f2039');
    expect(vars['--brand-green']).toBe('#34c57f');
    expect(vars['--brand-green-light']).toBe('#7cdcae');
    expect(vars['--brand-green-mid']).toBe('#4fd192');
    expect(vars['--brand-green-muted']).toBe('#1e734a');
    expect(vars['--brand-green-ink']).toBe('#175638');
    expect(vars['--surface']).toBe('#ffffff');
    expect(vars['--surface-navy']).toBe('#09479c');
    expect(vars['--text-tertiary']).toBe('#768ba7');
    expect(vars['--border']).toBe('rgb(31 92 178 / 0.17)');
    expect(vars['--danger']).toBe('#d92d20');
    expect(vars['--warning']).toBe('#f79009');
  });

  it('emits a display family verbatim when one is set', () => {
    const withDisplay = {
      ...defaultTokens,
      typography: { ...defaultTokens.typography, display: "'Manrope', sans-serif" },
    };
    expect(tokensToCssVariables(withDisplay)['--font-display']).toBe("'Manrope', sans-serif");
  });
});
