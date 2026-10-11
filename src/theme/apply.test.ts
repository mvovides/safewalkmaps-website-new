import { describe, expect, it } from 'vitest';

import { applyTheme } from './apply';
import { todayPreset } from './presets/today';

describe('applyTheme', () => {
  it('writes every variable and the data hooks, and the cleanup removes them', () => {
    const root = document.createElement('div');
    const cleanup = applyTheme(root, todayPreset);
    expect(root.style.getPropertyValue('--color-navy-800')).toBe('6 42 94');
    expect(root.style.getPropertyValue('--font-display')).toBe('var(--font-sans)');
    expect(root.dataset.swmDensity).toBe('comfortable');
    expect(root.dataset.swmDividers).toBe('none');
    expect(root.dataset.swmReveal).toBe('rise');
    expect(root.dataset.swmHoverLift).toBe('false');
    expect(root.dataset.swmScheme).toBe('light');
    cleanup();
    expect(root.style.getPropertyValue('--color-navy-800')).toBe('');
    expect(root.dataset.swmDensity).toBeUndefined();
  });

  it('re-applying overwrites rather than accumulates', () => {
    const root = document.createElement('div');
    applyTheme(root, todayPreset);
    const dark = {
      ...todayPreset,
      tokens: {
        ...todayPreset.tokens,
        colors: { ...todayPreset.tokens.colors, scheme: 'dark' as const },
      },
    };
    applyTheme(root, dark);
    expect(root.style.getPropertyValue('--color-scheme')).toBe('dark');
    expect(root.dataset.swmScheme).toBe('dark');
  });
});
