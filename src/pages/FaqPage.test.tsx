import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FaqSection } from '@/components/sections/FaqSection';
import { faqItems } from '@/data/faq';
import { renderWithRouter } from '@/test/renderWithRouter';

import { FaqPage } from './FaqPage';

function renderPage() {
  return renderWithRouter(<FaqPage />);
}

function faqLd(): HTMLScriptElement | null {
  return document.head.querySelector<HTMLScriptElement>('script[data-faq-schema]');
}

describe('FaqPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows the accordion', () => {
    const { container } = renderPage();
    expect(container.querySelector('#faq')).toBeInTheDocument();
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

  it('injects FAQPage structured data while mounted', () => {
    renderPage();
    const script = faqLd();
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent ?? '{}');
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.length).toBeGreaterThan(0);
    expect(parsed.mainEntity[0]['@type']).toBe('Question');
  });

  it('removes the structured data on unmount, so it never describes another page', () => {
    const { unmount } = renderPage();
    expect(faqLd()).not.toBeNull();
    unmount();
    expect(faqLd()).toBeNull();
  });
});

describe('FaqSection', () => {
  it('renders an h2 heading with h3 questions when given no props, as on the home page', () => {
    renderWithRouter(<FaqSection />);
    expect(
      screen.getByRole('heading', { level: 2, name: /questions worth asking/i }),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(faqItems.length);
  });
});
