import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { emulateReducedMotion } from '@/test/reducedMotion';
import { renderWithRouter } from '@/test/renderWithRouter';

import { App } from './App';
import { ROUTES, type Route } from './data/routes';
import { STALE_HASH_ROUTES } from './hooks/useStaleHashRedirect';

function renderAt(path: string) {
  return renderWithRouter(<App />, { initialEntries: [path] });
}

const REVEALS = '[data-reveal], [data-reveal-stagger]';

/**
 * Renders a lazy route the way a first-time visitor meets it: the chunk is still
 * in flight, so Suspense is showing its fallback.
 *
 * A lazy component only suspends the first time it renders in a module graph,
 * and the routing tests below load every route. That is why this block comes
 * first and why each test uses a route of its own. The check on the fallback is
 * there so that reordering these tests fails loudly, instead of quietly
 * testing a route that is already warm.
 */
function renderCold(path: string) {
  const view = renderAt(path);
  expect(
    view.container.querySelector('[aria-busy="true"]'),
    `${path} was already loaded, so this is not a first visit`,
  ).not.toBeNull();
  return view;
}

describe('App on a first visit to a lazy route', () => {
  it('arms the scroll reveals for the elements that arrive with the page', async () => {
    const { container } = renderCold('/features');
    await screen.findByRole('heading', { level: 1 });

    // Armed means the layout has marked each element, hidden or already shown.
    // Which of the two depends on a frame this test does not wait for.
    await waitFor(() => {
      const reveals = container.querySelectorAll(REVEALS);
      expect(reveals.length).toBeGreaterThan(0);
      for (const element of reveals) expect(element).toHaveAttribute('data-visible');
    });
    expect(document.documentElement).toHaveClass('motion-ready');
  });

  it('marks every reveal element visible when the visitor prefers reduced motion', async () => {
    emulateReducedMotion();
    const { container } = renderCold('/safety-score');
    await screen.findByRole('heading', { level: 1 });

    await waitFor(() => {
      const reveals = container.querySelectorAll(REVEALS);
      expect(reveals.length).toBeGreaterThan(0);
      for (const element of reveals) expect(element).toHaveAttribute('data-visible', 'true');
    });
    expect(document.documentElement).not.toHaveClass('motion-ready');
  });
});

/**
 * An id that only each route's own page carries. The 404 has an h1 of its own,
 * so counting h1s cannot tell a route from the catch-all that a misspelled path
 * would fall through to. Keyed by `Route`, so adding a route without saying what
 * it renders is a compile error.
 */
const OWN_CONTENT: Record<Route, string> = {
  '/': 'hero',
  '/safety-score': 'safety-score',
  '/features': 'features',
  '/about': 'mission',
  '/faq': 'faq',
  '/privacy': 'principles',
  '/terms': 'what-it-is',
};

describe('App routing', () => {
  it.each(ROUTES)('renders %s as its own page, with exactly one h1', async (route) => {
    const { container } = renderAt(route);
    await waitFor(() => {
      expect(
        container.querySelector(`#${OWN_CONTENT[route]}`),
        `${route} did not render its own page`,
      ).not.toBeNull();
    });
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('renders a 404 for an unknown path', async () => {
    renderAt('/definitely-not-a-page');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
        /does not go anywhere/i,
      );
    });
  });
});

describe('App forwarding of links to sections that moved', () => {
  // The hook's own tests render stand-in routes, so they cannot say whether a
  // target is a page the router actually has. Here the real router decides: a
  // target that is not registered lands on the 404, which has none of the ids.
  it.each(Object.keys(STALE_HASH_ROUTES))(
    'lands %s on a page that holds that section',
    async (hash) => {
      const { container } = renderAt(`/${hash}`);
      await waitFor(() => {
        expect(
          container.querySelector(hash),
          `${hash} forwards to ${STALE_HASH_ROUTES[hash]}, which has no ${hash} section`,
        ).not.toBeNull();
      });
    },
  );
});
