import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithRouter } from '@/test/renderWithRouter';

import { App } from './App';
import { ROUTES } from './data/routes';

function renderAt(path: string) {
  return renderWithRouter(<App />, { initialEntries: [path] });
}

/** Makes `(prefers-reduced-motion: reduce)` match; every other query does not. */
function emulateReducedMotion() {
  return vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

describe('App routing', () => {
  it.each(ROUTES)('renders %s with exactly one h1', async (route) => {
    const { container } = renderAt(route);
    await waitFor(() => {
      expect(container.querySelectorAll('h1').length).toBe(1);
    });
  });

  it('renders a 404 for an unknown path', async () => {
    renderAt('/definitely-not-a-page');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
        /does not go anywhere/i,
      );
    });
  });

  it('marks every reveal element visible when the visitor prefers reduced motion', async () => {
    const reducedMotion = emulateReducedMotion();
    try {
      // /features is a lazy route, so on a cold render the layout's reveal
      // effect runs while the Suspense fallback is still showing, before any
      // reveal element exists. Load the page once, then render again with the
      // chunk resolved so the effect sees the page's real elements.
      const cold = renderAt('/features');
      await screen.findByRole('heading', { level: 1 });
      cold.unmount();

      // Earlier tests in this file may have armed the hidden state on <html>.
      document.documentElement.classList.remove('motion-ready');

      const { container } = renderAt('/features');
      const reveals = container.querySelectorAll('[data-reveal], [data-reveal-stagger]');

      // Asserted synchronously: outside reduced motion these start as
      // data-visible="false" and only turn true on a later animation frame.
      expect(reveals.length).toBeGreaterThan(0);
      for (const element of reveals) {
        expect(element).toHaveAttribute('data-visible', 'true');
      }
      expect(document.documentElement).not.toHaveClass('motion-ready');
    } finally {
      reducedMotion.mockRestore();
    }
  });
});
