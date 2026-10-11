import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useActiveConfig } from '../store/hooks';
import { PlaygroundProvider } from '../store/PlaygroundProvider';
import { Panel } from './Panel';

function Probe() {
  const config = useActiveConfig();
  return (
    <output data-testid="probe">
      {config.components.nav.style}|{config.tokens.colors.navy['800']}|{config.layout.density}|
      {config.tokens.spacing.section}|{config.content.ctaLabel}
    </output>
  );
}

function setup(tab?: string) {
  render(
    <PlaygroundProvider storage={null}>
      <Panel />
      <Probe />
    </PlaygroundProvider>,
  );
  if (tab) fireEvent.click(screen.getByRole('tab', { name: tab }));
}

describe('Panel', () => {
  it('shows every tab', () => {
    setup();
    for (const name of [
      'Presets',
      'Colours',
      'Typography',
      'Shape',
      'Layout',
      'Motion',
      'Content',
    ]) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }
  });

  it('changing the brand navy regenerates the ramp around it', () => {
    setup('Colours');
    fireEvent.change(screen.getByLabelText('Brand navy'), { target: { value: '#0a3d66' } });
    expect(screen.getByTestId('probe').textContent).toContain('#0A3D66');
  });

  it('a component select writes the variant', () => {
    setup('Layout');
    fireEvent.change(screen.getByLabelText('Navigation'), { target: { value: 'floating-pill' } });
    expect(screen.getByTestId('probe').textContent).toContain('floating-pill');
  });

  it('density writes both the enum and the spacing tokens', () => {
    setup('Layout');
    fireEvent.click(screen.getByRole('radio', { name: 'Airy' }));
    const text = screen.getByTestId('probe').textContent ?? '';
    expect(text).toContain('airy');
    expect(text).toContain('clamp(6.5rem, 14vh, 12rem)');
  });

  it('the CTA label is capped at 40 characters', () => {
    setup('Content');
    const input = screen.getByLabelText('CTA label') as HTMLInputElement;
    expect(input.maxLength).toBe(40);
    fireEvent.change(input, { target: { value: 'Get the app' } });
    expect(screen.getByTestId('probe').textContent).toContain('Get the app');
  });
});
