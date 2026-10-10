import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { ROUTES } from '@/data/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

import { STALE_HASH_ROUTES, useStaleHashRedirect } from './useStaleHashRedirect';

function Home() {
  useStaleHashRedirect();
  return <p>home</p>;
}

/** Stands in for every route a stale hash can be forwarded to. */
function Probe() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  return (
    <>
      <p data-testid="here">{pathname + hash}</p>
      <p data-testid="navigation-type">{navigationType}</p>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  );
}

function renderAt(...entries: string[]) {
  return renderWithRouter(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Probe />} />
    </Routes>,
    { initialEntries: entries },
  );
}

/** Anchors whose sections are still on the home page, so they must never be forwarded. */
const HASHES_STILL_ON_HOME = ['#routes', '#waitlist', '#how-it-works', '#problem', '#main'];

describe('useStaleHashRedirect', () => {
  it('forwards each moved hash to the section it names, and nothing else', () => {
    // Written out in full rather than derived from the map: the test below only
    // proves each entry is navigable, not that it is the right entry. #privacy
    // is the section about data handling and lives on /about, not the /privacy
    // legal policy; #mission stays a bare path because it is the first section
    // on /about, so the top of the page already is the mission.
    expect(STALE_HASH_ROUTES).toEqual({
      '#safety-score': '/safety-score',
      '#features': '/features',
      '#scenarios': '/features#scenarios',
      '#privacy': '/about#privacy',
      '#mission': '/about',
      '#contact': '/about#contact',
      '#faq': '/faq',
    });
  });

  it('forwards only to routes the site has', () => {
    // The type already refuses a path that is not in ROUTES. This holds the same
    // line for anyone running the tests without the compiler.
    for (const [hash, target] of Object.entries(STALE_HASH_ROUTES)) {
      const [path] = target.split('#');
      expect(ROUTES, `${hash} forwards to ${target}, which is not a route`).toContain(path);
    }
  });

  it('never lists a hash whose section is still on the home page', () => {
    for (const hash of HASHES_STILL_ON_HOME) {
      expect(Object.keys(STALE_HASH_ROUTES), `${hash} must not be redirected`).not.toContain(hash);
    }
  });

  it('sends every moved hash to its new route', () => {
    for (const [hash, target] of Object.entries(STALE_HASH_ROUTES)) {
      const { unmount } = renderAt(`/${hash}`);
      expect(screen.getByTestId('here').textContent, `${hash} should go to ${target}`).toBe(target);
      unmount();
    }
  });

  it('leaves hashes whose sections are still on the home page alone', () => {
    for (const hash of HASHES_STILL_ON_HOME) {
      const { unmount } = renderAt(`/${hash}`);
      expect(screen.getByText('home'), `${hash} should stay on the home page`).toBeInTheDocument();
      unmount();
    }
  });

  it('does nothing when there is no hash', () => {
    renderAt('/');
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('redirects with a replace, not a push', () => {
    // A push would leave the stale URL in history. Back would return to it, the
    // hook would redirect again, and the visitor could never leave.
    renderAt('/#features');

    expect(screen.getByTestId('here')).toHaveTextContent('/features');
    expect(screen.getByTestId('navigation-type')).toHaveTextContent('REPLACE');
  });

  it('takes Back to where the visitor came from, not to the stale URL', () => {
    renderAt('/privacy', '/#features');
    expect(screen.getByTestId('here')).toHaveTextContent('/features');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('here')).toHaveTextContent('/privacy');
  });
});

describe('useStaleHashRedirect inside the site layout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the hash on the page it was forwarded to, never on the stale one', async () => {
    // Both pages carry #contact, so a scroll fired against the stale home page
    // would be indistinguishable from the right one except by which page it hit.
    const scrolledPages: (string | null)[] = [];
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element) {
      scrolledPages.push(this.getAttribute('data-page'));
    });

    function StaleHome() {
      useStaleHashRedirect();
      return <div id="contact" data-page="home" />;
    }

    renderWithRouter(
      <SiteLayout>
        <Routes>
          <Route path="/" element={<StaleHome />} />
          <Route path="/about" element={<div id="contact" data-page="about" />} />
        </Routes>
      </SiteLayout>,
      { initialEntries: ['/#contact'] },
    );

    await waitFor(() => expect(scrolledPages).not.toHaveLength(0));
    expect(scrolledPages).toEqual(['about']);
  });
});
