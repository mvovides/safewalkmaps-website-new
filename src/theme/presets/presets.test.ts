import { describe, expect, it } from 'vitest';

import { parseThemeConfig } from '../validate';
import { builtInPresets } from './index';

describe('built-in presets', () => {
  it('are nine, start with today, and have unique slugs', () => {
    expect(builtInPresets).toHaveLength(9);
    expect(builtInPresets[0]?.meta.id).toBe('today');
    expect(new Set(builtInPresets.map((p) => p.meta.id)).size).toBe(9);
    for (const p of builtInPresets) expect(p.meta.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('every preset parses and is marked built in', () => {
    for (const p of builtInPresets) {
      const result = parseThemeConfig(JSON.parse(JSON.stringify(p)));
      expect(result.ok, `${p.meta.id}: ${!result.ok ? result.errors.join('; ') : ''}`).toBe(true);
      expect(p.meta.builtIn).toBe(true);
      expect(p.meta.basedOn).toBeNull();
    }
  });

  it('no two presets are merely a recolour of each other', () => {
    for (const a of builtInPresets) {
      for (const b of builtInPresets) {
        if (a === b) continue;
        const sameStructure = JSON.stringify(a.components) === JSON.stringify(b.components);
        expect(sameStructure, `${a.meta.id} and ${b.meta.id} share every component choice`).toBe(
          false,
        );
      }
    }
  });

  it('dark presets declare the dark scheme and light ones do not', () => {
    const byId = Object.fromEntries(builtInPresets.map((p) => [p.meta.id, p]));
    expect(byId['night-navigation']?.tokens.colors.scheme).toBe('dark');
    expect(byId['today']?.tokens.colors.scheme).toBe('light');
    expect(byId['cupertino']?.tokens.colors.scheme).toBe('light');
  });
});
