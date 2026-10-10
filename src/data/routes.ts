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
