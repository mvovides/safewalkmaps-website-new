import { useEffect } from 'react';

import { siteConfig } from '@/lib/config';

function setMeta(selector: string, attribute: 'content' | 'href', value: string) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export type DocumentMeta = {
  title: string;
  description: string;
  /** Path including the leading slash, e.g. `/privacy`. */
  path: string;
  /** Keep the page out of search results (used for 404). */
  noindex?: boolean;
};

/**
 * Keeps the document title, description and canonical URL in step with the
 * current route.
 *
 * This is a client-rendered site, so these are updated imperatively. The
 * homepage values are already correct in `index.html`, which is what crawlers
 * and link unfurlers read first.
 */
export function useDocumentMeta({ title, description, path, noindex = false }: DocumentMeta): void {
  useEffect(() => {
    const canonical = `${siteConfig.url}${path === '/' ? '/' : path}`;

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta(
      'meta[name="robots"]',
      'content',
      noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    );
  }, [title, description, path, noindex]);
}
