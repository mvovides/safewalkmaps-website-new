import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { SiteHeader } from '@/components/navigation/SiteHeader';
import { useScrollReveal } from '@/hooks/useScrollReveal';

import { SiteFooter } from './SiteFooter';

/**
 * How many animation frames to keep looking for a `#hash` target: about one
 * second at 60Hz.
 *
 * On a direct load of a lazy route the location already carries the hash while
 * Suspense is still showing its fallback, so the target does not exist yet. A
 * chunk on a good connection lands within a few frames; a second covers a slow
 * one without leaving the search running for the life of the page. Past that the
 * visitor has probably started reading or scrolling, and a late jump would
 * yank the page out from under them, so we give up and leave them where they are.
 */
const HASH_TARGET_MAX_FRAMES = 60;

/**
 * Restores scroll position on route change, and honours a `#hash` target once
 * the new route has actually painted.
 */
function useRouteScroll(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let framesLeft = HASH_TARGET_MAX_FRAMES;
      let frame = 0;

      // Look once per frame until the target exists, then scroll and stop.
      const seek = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        framesLeft -= 1;
        if (framesLeft > 0) frame = requestAnimationFrame(seek);
      };

      // Wait a frame so the target exists before scrolling to it.
      frame = requestAnimationFrame(seek);
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    return undefined;
  }, [pathname, hash]);
}

export function SiteLayout({ children }: { children: ReactNode }) {
  useRouteScroll();
  useScrollReveal();

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
