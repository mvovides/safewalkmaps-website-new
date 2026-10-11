import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import { Lab } from './Lab';
import { LAB_SECTIONS } from './labStyles';

describe('Lab', () => {
  it('renders every section with its id', () => {
    render(<Lab config={todayPreset} section={null} />);
    for (const section of LAB_SECTIONS) {
      expect(document.getElementById(section.id), section.id).not.toBeNull();
    }
  });

  it('route options switch the figures shown', () => {
    render(<Lab config={todayPreset} section={null} />);
    const section = document.getElementById('route-options') as HTMLElement;
    expect(within(section).getAllByText('24').length).toBeGreaterThan(0);
    // Both the picker and the phone mockup expose a "Fastest" tab; the picker comes first.
    const [pickerTab] = within(section).getAllByRole('tab', { name: /fastest/i });
    fireEvent.click(pickerTab as HTMLElement);
    expect(within(section).getAllByText('21').length).toBeGreaterThan(0);
  });

  it('shows the placeholder testimonial only as a placeholder', () => {
    const cards = {
      ...todayPreset,
      components: { ...todayPreset.components, testimonial: { style: 'cards' as const } },
    };
    render(<Lab config={cards} section={null} />);
    expect(screen.getAllByText(/placeholder quote/i).length).toBe(3);
    expect(screen.getByRole('note')).toHaveTextContent(/permission/i);
  });

  it('labels every illustrative figure', () => {
    render(<Lab config={todayPreset} section={null} />);
    for (const id of ['hero', 'route-options', 'safety-score', 'stats']) {
      const section = document.getElementById(id) as HTMLElement;
      expect(within(section).getAllByText(/illustrative route data/i).length, id).toBeGreaterThan(
        0,
      );
    }
  });

  it('renders the real footer for navy-columns and a light one otherwise', () => {
    const { unmount } = render(<Lab config={todayPreset} section={null} />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-surface-navy');
    unmount();
    const light = {
      ...todayPreset,
      components: { ...todayPreset.components, footer: { style: 'light-compact' as const } },
    };
    render(<Lab config={light} section={null} />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-surface');
  });
});
