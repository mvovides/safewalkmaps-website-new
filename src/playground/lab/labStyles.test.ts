import { describe, expect, it } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import { badgeOverride, cardClasses, iconTile, LAB_SECTIONS, labButtonProps } from './labStyles';

describe('labStyles', () => {
  it('lists fifteen sections with unique ids', () => {
    expect(LAB_SECTIONS).toHaveLength(15);
    expect(new Set(LAB_SECTIONS.map((s) => s.id)).size).toBe(15);
  });

  it('maps card styles to classes', () => {
    expect(cardClasses('outlined')).toContain('border-line');
    expect(cardClasses('navy')).toContain('bg-surface-navy');
    expect(cardClasses('glass')).toContain('backdrop-blur-md');
    expect(cardClasses('flat', 'p-0')).toMatch(/p-0$/);
  });

  it('maps button choices onto the real Button variants', () => {
    expect(labButtonProps(todayPreset)).toEqual({
      variant: 'primary',
      className: '',
      routeHover: true,
    });
    const green = {
      ...todayPreset,
      components: {
        ...todayPreset.components,
        button: { shape: 'pill', primary: 'green', hover: 'lift' } as const,
      },
    };
    const props = labButtonProps(green);
    expect(props.variant).toBe('accent');
    expect(props.className).toContain('hover:-translate-y-0.5');
    expect(props.routeHover).toBe(false);
  });

  it('builds icon tiles and badge overrides', () => {
    expect(iconTile(todayPreset).className).toContain('bg-navy-50');
    expect(iconTile(todayPreset).strokeWidth).toBe(2);
    expect(badgeOverride('solid', 'plus')).toContain('bg-green-800');
    expect(badgeOverride('soft', 'plus')).toBe('');
  });
});
