/**
 * Every public path on the site, in one place.
 *
 * The router, the navigation, the footer and the sitemap all have to agree on
 * this list. Keeping it here means a link to a path that does not exist is a
 * test failure rather than something a visitor discovers.
 */
export const ROUTES = [
  '/',
  '/safety-score',
  '/features',
  '/about',
  '/faq',
  '/privacy',
  '/terms',
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Somewhere on the site: a route, optionally followed by the `#hash` of a
 * section on that page.
 *
 * Typing a link's destination with this makes a path that is not in `ROUTES` a
 * compile error, so renaming a route fails the build at every link that was
 * written against the old name instead of leaving it to forward to the 404.
 */
export type RouteTarget = Route | `${Route}#${string}`;
