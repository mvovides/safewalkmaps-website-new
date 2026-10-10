import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SafetyScoreSection } from '@/components/sections/SafetyScoreSection';
import { renderWithRouter } from '@/test/renderWithRouter';

import { SafetyScorePage } from './SafetyScorePage';

function renderPage() {
  return renderWithRouter(<SafetyScorePage />);
}

describe('SafetyScorePage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the safety score heading as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Understand the route/i);
  });

  it('shows the score ring section', () => {
    const { container } = renderPage();
    expect(container.querySelector('#safety-score')).toBeInTheDocument();
  });

  it('sets the document title and canonical path', () => {
    renderPage();
    expect(document.title).toMatch(/Safety score/i);
  });

  it('closes with a link to the waitlist that works from this page', () => {
    renderPage();
    const cta = screen.getAllByRole('link').find((a) => /waitlist/i.test(a.textContent ?? ''));
    expect(cta).toHaveAttribute('href', '/#waitlist');
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

describe('SafetyScoreSection', () => {
  it('renders its heading as an h2 when given no props', () => {
    renderWithRouter(<SafetyScoreSection />);
    expect(screen.getByRole('heading', { level: 2, name: /Understand the route/i })).toBeVisible();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });
});
