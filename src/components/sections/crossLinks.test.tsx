import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/renderWithRouter';

import { FinalCtaSection } from './FinalCtaSection';
import { HeroSection } from './hero/HeroSection';

function waitlistLink() {
  return screen.getAllByRole('link').find((a) => /waitlist/i.test(a.textContent ?? ''));
}

// Both ends matter. A bare `#waitlist` is wrong anywhere but the home page, but
// `/` is the case a "bare on home, absolute elsewhere" shortcut would change, so
// it is not enough to check a sub-page.
const WHERE_THE_LINK_RENDERS = ['/', '/features'];

describe('waitlist cross-links', () => {
  it.each(WHERE_THE_LINK_RENDERS)(
    'points the final call to action at the home page waitlist from %s',
    (path) => {
      renderWithRouter(<FinalCtaSection />, { initialEntries: [path] });
      expect(waitlistLink()).toHaveAttribute('href', '/#waitlist');
    },
  );

  it.each(WHERE_THE_LINK_RENDERS)(
    'points the hero call to action at the home page waitlist from %s',
    (path) => {
      renderWithRouter(<HeroSection />, { initialEntries: [path] });
      expect(waitlistLink()).toHaveAttribute('href', '/#waitlist');
    },
  );

  it('leaves the hero secondary link on the page it renders on', () => {
    renderWithRouter(<HeroSection />);
    const secondary = screen.getByRole('link', { name: /see how it works/i });
    expect(secondary).toHaveAttribute('href', '#how-it-works');
  });
});
