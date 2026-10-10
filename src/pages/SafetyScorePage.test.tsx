import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
});
