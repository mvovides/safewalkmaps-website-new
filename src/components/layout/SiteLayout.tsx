import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { SiteHeader } from '@/components/navigation/SiteHeader';
import { useScrollReveal } from '@/hooks/useScrollReveal';

import { SiteFooter } from './SiteFooter';

/**
 * Restores scroll position on route change, and honours a `#hash` target once
 * the new route has actually painted.
 */
function useRouteScroll(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target exists before scrolling to it.
      const frame = requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    return undefined;
  }, [pathname, hash]);
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useRouteScroll();
  useScrollReveal(pathname);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-pill bg-navy-800 px-5 py-3 text-body-sm font-semibold text-white shadow-lg transition-transform duration-base focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
