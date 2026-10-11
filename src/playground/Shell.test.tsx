import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Shell } from './Shell';

vi.mock('./shell/download', () => ({
  downloadText: vi.fn(),
  copyText: vi.fn(async () => true),
}));

describe('Shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('lists the nine built-in presets and selects one', () => {
    render(<Shell />);
    const list = screen.getByRole('list', { name: 'Built-in presets' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(9);
    fireEvent.click(within(list).getByRole('button', { name: /select cupertino/i }));
    expect(screen.getByTestId('active-name')).toHaveTextContent('Cupertino');
  });

  it('exports the active preset as JSON naming its id', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    const dialog = screen.getByRole('dialog', { name: /export/i });
    expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toContain(
      '"id": "today"',
    );
    fireEvent.click(within(dialog).getByRole('tab', { name: 'CSS' }));
    expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toContain(
      '--color-navy-800: 6 42 94;',
    );
  });

  it('refuses an import that is not a theme and lists why', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    const dialog = screen.getByRole('dialog', { name: /import/i });
    fireEvent.change(within(dialog).getByLabelText(/paste/i), { target: { value: '{"foo":1}' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /import preset/i }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/schemaVersion/);
  });

  it('compare mode shows a second frame with the chosen preset', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByTitle('Preview b')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'wayfinder' } });
    expect((screen.getByLabelText('Compare with') as HTMLSelectElement).value).toBe('wayfinder');
  });

  it('asks before resetting a custom preset, from the top bar and from the list', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: /save as/i }));
    fireEvent.change(screen.getByLabelText('New preset name'), { target: { value: 'Mine' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    const confirm = screen.getByRole('button', { name: /confirm reset/i });
    expect(confirm).toBeInTheDocument();
    fireEvent.click(confirm);
    expect(screen.queryByRole('button', { name: /confirm reset/i })).toBeNull();

    const mine = screen.getByRole('list', { name: 'My presets' });
    fireEvent.click(within(mine).getByRole('button', { name: /reset mine to its base/i }));
    fireEvent.click(within(mine).getByRole('button', { name: /cancel/i }));
    expect(within(mine).queryByRole('button', { name: /confirm reset mine/i })).toBeNull();
    expect(screen.getByTestId('active-name')).toHaveTextContent('Mine');
  });

  it('save as creates a custom preset, which can be renamed, favourited and deleted', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: /save as/i }));
    fireEvent.change(screen.getByLabelText('New preset name'), { target: { value: 'Mine' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    const mine = screen.getByRole('list', { name: 'My presets' });
    expect(within(mine).getByText('Mine')).toBeInTheDocument();
    fireEvent.click(within(mine).getByRole('button', { name: /favourite mine/i }));
    expect(within(mine).getByRole('button', { name: /unfavourite mine/i })).toBeInTheDocument();
    fireEvent.click(within(mine).getByRole('button', { name: /delete mine/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete mine/i }));
    expect(screen.queryByRole('list', { name: 'My presets' })).toBeNull();
    expect(screen.getByTestId('active-name')).toHaveTextContent('SafeWalkMaps Today');
  });
});
