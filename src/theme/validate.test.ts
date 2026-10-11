import { describe, expect, it } from 'vitest';

import { todayPreset } from './presets/today';
import { parseThemeConfig } from './validate';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('parseThemeConfig', () => {
  it('accepts the baseline preset and returns an equal config', () => {
    const result = parseThemeConfig(clone(todayPreset));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config).toEqual(todayPreset);
  });

  it('rejects an object with no schemaVersion', () => {
    const result = parseThemeConfig({ foo: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/schemaVersion/);
  });

  it('rejects non-objects', () => {
    expect(parseThemeConfig(null).ok).toBe(false);
    expect(parseThemeConfig('{}').ok).toBe(false);
    expect(parseThemeConfig(42).ok).toBe(false);
  });

  it('rejects an unsupported schemaVersion', () => {
    const bad = { ...clone(todayPreset), schemaVersion: 2 };
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatch(/schemaVersion.*1/);
  });

  it('names the path of a bad enum value', () => {
    const bad = clone(todayPreset);
    (bad.components.nav as { style: string }).style = 'neon';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/components\.nav\.style/);
  });

  it('rejects a non-hex palette colour', () => {
    const bad = clone(todayPreset);
    bad.tokens.colors.navy['800'] = 'blue';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/tokens\.colors\.navy\.800/);
  });

  it('rejects a line colour that is not an rgb() string', () => {
    const bad = clone(todayPreset);
    bad.tokens.colors.line.base = '#FFFFFF';
    expect(parseThemeConfig(bad).ok).toBe(false);
  });

  it('rejects a CTA label over the limit', () => {
    const bad = clone(todayPreset);
    bad.content.ctaLabel = 'x'.repeat(41);
    expect(parseThemeConfig(bad).ok).toBe(false);
  });

  it('drops unknown keys and warns about them', () => {
    const extra = { ...clone(todayPreset), extra: 1, meta: { ...todayPreset.meta, nope: true } };
    const result = parseThemeConfig(extra);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect('extra' in result.config).toBe(false);
      expect('nope' in result.config.meta).toBe(false);
      expect(result.warnings.join('\n')).toMatch(/extra/);
    }
  });

  it('rejects token values that could escape a CSS declaration', () => {
    for (const payload of [
      "'Inter'; } body { display: none } :root { --x: 1",
      'clamp(1rem, 2vw, 3rem) /* comment */',
      '1rem }',
      '<script>',
    ]) {
      const bad = clone(todayPreset);
      bad.tokens.typography.sans = payload;
      const result = parseThemeConfig(bad);
      expect(result.ok, payload).toBe(false);
      if (!result.ok) expect(result.errors.join('\n')).toMatch(/tokens\.typography\.sans/);
    }
    const shadow = clone(todayPreset);
    shadow.tokens.shadows.md = '0 1px 2px red; color: red';
    expect(parseThemeConfig(shadow).ok).toBe(false);
  });

  it('reports every error, not just the first', () => {
    const bad = clone(todayPreset);
    (bad.layout as { density: string }).density = 'huge';
    (bad.motion as { reveal: string }).reveal = 'spin';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
