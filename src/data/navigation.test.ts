import { describe, expect, it } from 'vitest';

import { footerColumns, navLinks } from './navigation';
import { ROUTES } from './routes';

// ROUTES is a literal tuple, whose `includes` only accepts known paths. Widened
// here because the point of the check is to test strings that may not be.
const knownRoutes: readonly string[] = ROUTES;

/** A link target is valid if it is a known route, optionally with a #hash. */
function resolves(href: string): boolean {
  if (href.startsWith('http')) return true;
  const [path = ''] = href.split('#');
  // `/#waitlist` splits to '/', and a bare '#x' means the current page.
  if (path === '') return true;
  return knownRoutes.includes(path);
}

describe('ROUTES', () => {
  it('lists every public path exactly once', () => {
    expect(new Set(ROUTES).size).toBe(ROUTES.length);
  });

  it('includes the four new pages', () => {
    expect(ROUTES).toEqual(
      expect.arrayContaining(['/safety-score', '/features', '/about', '/faq']),
    );
  });
});

describe('navLinks', () => {
  it('points every item at a real route', () => {
    for (const link of navLinks) {
      expect(ROUTES, `nav link "${link.label}" -> ${link.path}`).toContain(link.path);
    }
  });

  it('is the four detail pages', () => {
    expect(navLinks.map((l) => l.path)).toEqual(['/safety-score', '/features', '/about', '/faq']);
  });
});

describe('footerColumns', () => {
  it('points every link at a real route or an external URL', () => {
    for (const column of footerColumns) {
      for (const link of column.links) {
        expect(resolves(link.href), `footer link "${link.label}" -> ${link.href}`).toBe(true);
      }
    }
  });

  it('has no links left pointing at moved sections', () => {
    const moved = ['#safety-score', '#features', '#privacy', '#scenarios', '#mission', '#faq'];
    const hrefs = footerColumns.flatMap((c) => c.links.map((l) => l.href));
    for (const stale of moved) {
      expect(hrefs, `footer still links to ${stale}`).not.toContain(`/${stale}`);
    }
  });
});
