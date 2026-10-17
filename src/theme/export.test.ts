import { describe, expect, it } from 'vitest';

import {
  exportFileName,
  familyKey,
  flattenChoices,
  isBundledFamily,
  primaryFamily,
  toCss,
  toJson,
  toTypeScript,
} from './export';
import { todayPreset } from './presets/today';
import { parseThemeConfig } from './validate';

describe('toJson', () => {
  it('round-trips through the parser', () => {
    const parsed = parseThemeConfig(JSON.parse(toJson(todayPreset)));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.config).toEqual(todayPreset);
  });
});

describe('toCss', () => {
  const css = toCss(todayPreset);

  it('emits a :root block with every variable', () => {
    expect(css).toContain(':root {');
    expect(css).toContain('  --color-navy-800: 6 42 94;');
    expect(css).toContain('  --radius-control: 999px;');
    expect(css).toContain('  --brand-green: #17f58b;');
  });

  it('names the preset and lists the component choices', () => {
    expect(css).toContain('SafeWalkMaps Today');
    expect(css).toContain('components.nav.style: glass');
    expect(css).toContain('layout.density: comfortable');
  });

  it('adds a font note only for a non-Inter family', () => {
    expect(css).not.toMatch(/fontsource/);
    const manrope = {
      ...todayPreset,
      tokens: {
        ...todayPreset.tokens,
        typography: { ...todayPreset.tokens.typography, sans: "'Manrope', sans-serif" },
      },
    };
    expect(toCss(manrope)).toMatch(/@fontsource-variable.*Manrope/);
  });
});

describe('comment safety', () => {
  const hostile = {
    ...todayPreset,
    meta: { ...todayPreset.meta, name: 'Evil */ body { display: none } /*', description: 'x */ y' },
  };

  it('never lets a preset name close the CSS comment early', () => {
    const css = toCss(hostile);
    const header = css.split('\n')[0] ?? '';
    expect(header.indexOf('*/')).toBe(header.length - 2);
    expect(css).not.toMatch(/\*\/ body/);
  });

  it('never lets a preset name close the TypeScript doc comment early', () => {
    const ts = toTypeScript(hostile);
    const doc = ts.split('\n')[2] ?? '';
    expect(doc.startsWith('/**')).toBe(true);
    expect(doc.indexOf('*/')).toBe(doc.length - 2);
  });
});

describe('toTypeScript', () => {
  it('is a module exporting a ThemeConfig', () => {
    const ts = toTypeScript(todayPreset);
    expect(ts.startsWith("import type { ThemeConfig } from '../config';")).toBe(true);
    expect(ts).toContain('const theme: ThemeConfig = {');
    expect(ts).toContain('"id": "today"');
    expect(ts.trimEnd().endsWith('export default theme;')).toBe(true);
  });
});

describe('helpers', () => {
  it('builds file names from the id', () => {
    expect(exportFileName(todayPreset, 'json')).toBe('safewalkmaps-theme-today.json');
    expect(exportFileName(todayPreset, 'ts')).toBe('safewalkmaps-theme-today.ts');
  });

  it('extracts the first family of a stack', () => {
    expect(primaryFamily("'Inter Variable', Inter, sans-serif")).toBe('Inter Variable');
    expect(primaryFamily('ui-monospace, Menlo')).toBe('ui-monospace');
  });

  it('compares families without the suffix @fontsource registers them under', () => {
    expect(familyKey('Inter Variable')).toBe('inter');
    expect(familyKey('Inter')).toBe('inter');
    expect(isBundledFamily('Inter')).toBe(true);
    expect(isBundledFamily('Inter Variable')).toBe(true);
    expect(isBundledFamily('Manrope')).toBe(false);
  });

  it('flattens every non-token choice', () => {
    const keys = flattenChoices(todayPreset).map(([k]) => k);
    expect(keys).toContain('components.button.shape');
    expect(keys).toContain('motion.hoverLift');
    expect(keys).toContain('content.ctaLabel');
    expect(keys.some((k) => k.startsWith('tokens.'))).toBe(false);
  });
});
