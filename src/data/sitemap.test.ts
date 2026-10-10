import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ROUTES } from './routes';

const ORIGIN = 'https://safewalkmaps.com';

const sitemap = readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');

describe('sitemap.xml', () => {
  it('lists every public route', () => {
    for (const route of ROUTES) {
      const loc = `${ORIGIN}${route}`;
      expect(sitemap, `sitemap is missing ${route}`).toContain(`<loc>${loc}</loc>`);
    }
  });

  it('lists nothing that is not a route', () => {
    const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
      // The pattern has one capture group, so a match without it means the
      // pattern changed. Fail loudly rather than skip the entry.
      const [, url] = match;
      if (url === undefined) throw new Error(`sitemap <loc> matched without a URL: ${match[0]}`);
      return url.replace(ORIGIN, '').replace(/^$/, '/');
    });
    expect(locs.length, 'no <loc> entries were found in the sitemap').toBeGreaterThan(0);
    for (const loc of locs) {
      expect(ROUTES, `sitemap lists ${loc}, which has no route`).toContain(loc);
    }
  });
});
