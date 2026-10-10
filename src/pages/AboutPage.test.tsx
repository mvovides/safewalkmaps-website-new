import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/renderWithRouter';

import { AboutPage } from './AboutPage';

function renderPage() {
  return renderWithRouter(<AboutPage />);
}

describe('AboutPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the mission statement as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Walking should not mean/i);
  });

  it('carries mission, privacy and contact', () => {
    const { container } = renderPage();
    expect(container.querySelector('#mission')).toBeInTheDocument();
    expect(container.querySelector('#privacy')).toBeInTheDocument();
    expect(container.querySelector('#contact')).toBeInTheDocument();
  });

  it('keeps #contact addressable, so /about#contact lands on the form', () => {
    const { container } = renderPage();
    expect(container.querySelector('#contact')).toBeInTheDocument();
  });

  it('sets the document title', () => {
    renderPage();
    expect(document.title).toMatch(/About/i);
  });

  it('never skips a heading level', () => {
    const { container } = renderPage();
    const levels = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
      Number(heading.tagName.slice(1)),
    );

    expect(levels.length).toBeGreaterThan(1);
    levels.forEach((level, index) => {
      const previous = levels[index - 1] ?? 0;
      expect(level, `heading ${index + 1} (h${level}) follows h${previous}`).toBeLessThanOrEqual(
        previous + 1,
      );
    });
  });
});
