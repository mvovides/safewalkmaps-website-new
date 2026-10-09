/**
 * Single source of truth for environment-configurable site values.
 *
 * Everything here has a sensible production default so the site builds and
 * renders correctly before any environment variables are supplied.
 */

const DEFAULT_SITE_URL = 'https://safewalkmaps.com';
const DEFAULT_CONTACT_EMAIL = 'safewalkmaps@gmail.com';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const siteConfig = {
  name: 'SafeWalkMaps',
  /** Used for canonical URLs and the sitemap. */
  url: trimTrailingSlash(import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL,
  tagline: 'The safer route. Not just the fastest one.',
  description:
    'SafeWalkMaps compares walking routes using street lighting, police crime data, foot traffic and community reports, then shows you why each route scored the way it did.',
  /** Cities where the app is currently in beta. Keep this factual. */
  betaCities: ['London', 'Sheffield'] as const,
  parentCompany: {
    name: 'Marvian Tech',
    url: 'https://marvian.tech',
  },
} as const;

/**
 * Web3Forms access key. Public by design (it only permits submissions to the
 * configured inbox) but read from the environment so it can be rotated.
 * When absent, the form services run in development mode instead of failing.
 */
export const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() ?? '';

export const isFormBackendConfigured = web3FormsAccessKey.length > 0;
