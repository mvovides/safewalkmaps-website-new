import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/renderWithRouter';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('keeps the narrative spine', () => {
    const { container } = renderWithRouter(<HomePage />);
    for (const id of ['hero', 'problem', 'how-it-works', 'routes', 'waitlist']) {
      expect(
        container.querySelector(`#${id}`),
        `#${id} should still be on the home page`,
      ).toBeInTheDocument();
    }
  });

  it('no longer carries the sections that moved', () => {
    const { container } = renderWithRouter(<HomePage />);
    for (const id of [
      'safety-score',
      'features',
      'privacy',
      'scenarios',
      'mission',
      'faq',
      'contact',
    ]) {
      expect(
        container.querySelector(`#${id}`),
        `#${id} should have moved off the home page`,
      ).toBeNull();
    }
  });

  it('renders exactly one h1', () => {
    const { container } = renderWithRouter(<HomePage />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('numbers the remaining sections in an unbroken run', () => {
    const { container } = renderWithRouter(<HomePage />);
    const indices = Array.from(container.querySelectorAll('.eyebrow .tabular'))
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text && /^\d+$/.test(text)));
    expect(indices).toEqual(['01', '02', '03', '04']);
  });

  it('forwards a link to a section that moved, to the page that now holds it', () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<p>features page</p>} />
      </Routes>,
      { initialEntries: ['/#features'] },
    );
    expect(screen.getByText('features page')).toBeInTheDocument();
  });

  it('keeps a visitor on the home page for a section it still has', () => {
    const { container } = renderWithRouter(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<p>somewhere else</p>} />
      </Routes>,
      { initialEntries: ['/#routes'] },
    );
    expect(container.querySelector('#routes')).toBeInTheDocument();
    expect(screen.queryByText('somewhere else')).not.toBeInTheDocument();
  });
});
