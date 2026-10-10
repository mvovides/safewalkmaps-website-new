import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/renderWithRouter';

import { FinalCtaSection } from './FinalCtaSection';
import { HeroSection } from './hero/HeroSection';

function waitlistLink() {
  return screen.getAllByRole('link').find((a) => /waitlist/i.test(a.textContent ?? ''));
}

describe('waitlist cross-links', () => {
  it('resolves from a sub-page, not just from the home page', () => {
    renderWithRouter(<FinalCtaSection />, { initialEntries: ['/features'] });
    expect(waitlistLink()).toHaveAttribute('href', '/#waitlist');
  });

  it('points the hero call to action at the home page waitlist from any route', () => {
    renderWithRouter(<HeroSection />, { initialEntries: ['/features'] });
    expect(waitlistLink()).toHaveAttribute('href', '/#waitlist');
  });

  it('leaves the hero secondary link on the page it renders on', () => {
    renderWithRouter(<HeroSection />);
    const secondary = screen.getByRole('link', { name: /see how it works/i });
    expect(secondary).toHaveAttribute('href', '#how-it-works');
  });
});
