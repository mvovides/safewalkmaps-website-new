import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { navLinks } from '@/data/navigation';
import { renderWithRouter } from '@/test/renderWithRouter';

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('renders every nav link as a real path', () => {
    renderWithRouter(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.path,
      );
    }
  });

  it('marks the current route as current', () => {
    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks nothing current on the home page', () => {
    renderWithRouter(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });

  it('points the waitlist button at the home page anchor from a sub-page', () => {
    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    expect(screen.getAllByRole('link', { name: /join waitlist/i })[0]).toHaveAttribute(
      'href',
      '/#waitlist',
    );
  });
});
