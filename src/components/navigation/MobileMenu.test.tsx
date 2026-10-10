import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { navLinks } from '@/data/navigation';
import { renderWithRouter } from '@/test/renderWithRouter';

import { MobileMenu } from './MobileMenu';

function renderMenu(path: string) {
  return renderWithRouter(<MobileMenu open onOpenChange={() => {}} />, {
    initialEntries: [path],
  });
}

const mobileNav = () => screen.getByRole('navigation', { name: 'Mobile' });

describe('MobileMenu', () => {
  it('links every nav item to its real path', () => {
    renderMenu('/');
    for (const link of navLinks) {
      expect(within(mobileNav()).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.path,
      );
    }
  });

  it.each(['/', '/features'])(
    'points the waitlist button at the home page anchor from %s',
    (path) => {
      renderMenu(path);
      expect(screen.getByRole('link', { name: /join the ios waitlist/i })).toHaveAttribute(
        'href',
        '/#waitlist',
      );
    },
  );

  it('marks the current route as current, as the desktop navigation does', () => {
    // On a phone this menu is the only navigation, so it is the only place a
    // screen reader can learn which page it is on.
    renderMenu('/features');
    expect(within(mobileNav()).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks only the current route', () => {
    renderMenu('/features');
    const current = within(mobileNav())
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.getAttribute('href'))).toEqual(['/features']);
  });

  it('marks nothing current on the home page', () => {
    renderMenu('/');
    for (const link of navLinks) {
      expect(within(mobileNav()).getByRole('link', { name: link.label })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });
});
