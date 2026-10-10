import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { navLinks } from '@/data/navigation';

import { SiteHeader } from './SiteHeader';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
    </MemoryRouter>,
  );
}

describe('SiteHeader', () => {
  it('renders every nav link as a real path', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.path,
      );
    }
  });

  it('marks the current route as current', () => {
    renderAt('/features');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks nothing current on the home page', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });

  it('points the waitlist button at the home page anchor from a sub-page', () => {
    renderAt('/features');
    expect(screen.getAllByRole('link', { name: /join waitlist/i })[0]).toHaveAttribute(
      'href',
      '/#waitlist',
    );
  });
});
