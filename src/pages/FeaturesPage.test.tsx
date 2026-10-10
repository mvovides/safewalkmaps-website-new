import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeatureSection } from '@/components/sections/FeatureSection';
import { renderWithRouter } from '@/test/renderWithRouter';

import { FeaturesPage } from './FeaturesPage';

function renderPage() {
  return renderWithRouter(<FeaturesPage />);
}

describe('FeaturesPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the features heading as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/keeps telling you why/i);
  });

  it('shows both the features and the scenarios', () => {
    const { container } = renderPage();
    expect(container.querySelector('#features')).toBeInTheDocument();
    expect(container.querySelector('#scenarios')).toBeInTheDocument();
  });

  it('alternates surface tone so the two sections read as separate', () => {
    const { container } = renderPage();
    expect(container.querySelector('#scenarios')).toHaveClass('bg-surface-secondary');
  });

  it('sets the document title', () => {
    renderPage();
    expect(document.title).toMatch(/Features/i);
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

describe('FeatureSection', () => {
  it('renders its heading as an h2, with h3 card titles, when given no props', () => {
    renderWithRouter(<FeatureSection />);
    expect(screen.getByRole('heading', { level: 2, name: /keeps telling you why/i })).toBeVisible();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Turn-by-turn, with the score in view/i }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 3, name: /Works without a signal/i }),
    ).toBeVisible();
  });
});
