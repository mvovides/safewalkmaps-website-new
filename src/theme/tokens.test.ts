import { describe, expect, it } from 'vitest';

import { hexToChannels, kebab, tokensToCssVariables } from './cssVariables';
import { defaultTokens } from './tokens';

/** The literals that lived in tailwind.config.ts and index.css before the bridge. */
const PRE_BRIDGE = {
  navy800: '#062A5E',
  green500: '#17F58B',
  inkSecondary: '#4A5F7D',
  surfaceSecondary: '#F6F8FB',
  lineStrong: 'rgb(6 42 94 / 0.16)',
  radiusLg: '1rem',
  shadowMd: '0 10px 28px -8px rgb(6 42 94 / 0.12), 0 2px 6px -2px rgb(6 42 94 / 0.06)',
  displayXl: {
    size: 'clamp(2.5rem, 6.6vw, 5.25rem)',
    lineHeight: '0.98',
    letterSpacing: '-0.04em',
  },
  section: 'clamp(5rem, 11vh, 9.5rem)',
  durationBase: '240ms',
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
  it('pins the pre-bridge literals', () => {
    expect(defaultTokens.colors.navy['800']).toBe(PRE_BRIDGE.navy800);
    expect(defaultTokens.colors.green['500']).toBe(PRE_BRIDGE.green500);
    expect(defaultTokens.colors.ink.secondary).toBe(PRE_BRIDGE.inkSecondary);
    expect(defaultTokens.colors.surface.secondary).toBe(PRE_BRIDGE.surfaceSecondary);
    expect(defaultTokens.colors.line.strong).toBe(PRE_BRIDGE.lineStrong);
    expect(defaultTokens.radius.lg).toBe(PRE_BRIDGE.radiusLg);
    expect(defaultTokens.shadows.md).toBe(PRE_BRIDGE.shadowMd);
    expect(defaultTokens.typography.scale['display-xl']).toEqual(PRE_BRIDGE.displayXl);
    expect(defaultTokens.spacing.section).toBe(PRE_BRIDGE.section);
    expect(defaultTokens.motion.duration.base).toBe(PRE_BRIDGE.durationBase);
    expect(defaultTokens.motion.ease.outExpo).toBe(PRE_BRIDGE.easeOutExpo);
    expect(defaultTokens.radius.control).toBe('999px');
    expect(defaultTokens.radius.card).toBe('1.75rem');
    expect(defaultTokens.typography.headingWeight).toBe(600);
    expect(defaultTokens.motion.revealScale).toBe(1);
  });
});

describe('tokensToCssVariables', () => {
  const vars = tokensToCssVariables(defaultTokens);

  it('emits channel triplets for alpha-capable families', () => {
    expect(vars['--color-navy-800']).toBe('6 42 94');
    expect(vars['--color-green-500']).toBe('23 245 139');
    expect(vars['--color-ink-primary']).toBe('6 21 46');
    expect(vars['--color-surface']).toBe('255 255 255');
    expect(vars['--color-surface-navy-soft']).toBe('6 35 76');
    expect(vars['--color-warning-ink']).toBe('181 71 8');
    expect(vars['--color-danger-soft']).toBe('254 243 242');
  });

  it('emits line colours verbatim because their alpha is part of the value', () => {
    expect(vars['--color-line']).toBe('rgb(6 42 94 / 0.09)');
    expect(vars['--color-line-inverse-strong']).toBe('rgb(255 255 255 / 0.22)');
  });

  it('emits typography, radius, shadow, spacing and motion variables', () => {
    expect(vars['--font-sans']).toContain("'Inter Variable'");
    expect(vars['--font-display']).toBe('var(--font-sans)');
    expect(vars['--heading-weight']).toBe('600');
    expect(vars['--text-display-xl']).toBe('clamp(2.5rem, 6.6vw, 5.25rem)');
    expect(vars['--leading-display-xl']).toBe('0.98');
    expect(vars['--tracking-display-xl']).toBe('-0.04em');
    expect(vars['--radius-2xl']).toBe('1.75rem');
    expect(vars['--radius-control']).toBe('999px');
    expect(vars['--shadow-phone-sm']).toContain('0 28px 64px');
    expect(vars['--shadow-green-lg']).toContain('rgb(10 145 89 / 0.46)');
    expect(vars['--space-section-lg']).toBe('clamp(6.5rem, 15vh, 13rem)');
    expect(vars['--width-shell']).toBe('80rem');
    expect(vars['--duration-slower']).toBe('700ms');
    expect(vars['--ease-in-out-soft']).toBe('cubic-bezier(0.65, 0, 0.35, 1)');
    expect(vars['--reveal-scale']).toBe('1');
    expect(vars['--color-scheme']).toBe('light');
  });

  it('derives the legacy hex variables the SVG illustrations read', () => {
    expect(vars['--brand-navy']).toBe('#062a5e');
    expect(vars['--brand-navy-bright']).toBe('#062e6f');
    expect(vars['--brand-navy-deep']).toBe('#031b3d');
    expect(vars['--brand-navy-darkest']).toBe('#020f24');
    expect(vars['--brand-green']).toBe('#17f58b');
    expect(vars['--brand-green-light']).toBe('#6af5a4');
    expect(vars['--brand-green-mid']).toBe('#43e68d');
    expect(vars['--brand-green-muted']).toBe('#0a9159');
    expect(vars['--brand-green-ink']).toBe('#07704a');
    expect(vars['--surface']).toBe('#ffffff');
    expect(vars['--surface-navy']).toBe('#031b3d');
    expect(vars['--text-tertiary']).toBe('#788ca6');
    expect(vars['--border']).toBe('rgb(6 42 94 / 0.09)');
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
