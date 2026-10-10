import { useEffect } from 'react';

import { prefersReducedMotion } from '@/lib/motion';
import { observeContent } from '@/lib/observeContent';

const SELECTOR = '[data-reveal], [data-reveal-stagger]';

/**
 * One IntersectionObserver for every reveal on the page.
 *
 * Elements start with no `data-visible` attribute, so they render fully visible
 * for crawlers and for anyone whose JS fails. This controller marks each one
 * `data-visible="false"`, adds the `motion-ready` class to <html> — which is
 * what actually arms the hidden state in CSS — then reveals elements as they
 * enter the viewport.
 *
 * The set of elements it looks after follows the page. The layout that calls
 * this mounts once and never again, while the content under it changes with the
 * route and, for the lazy routes, arrives after the layout's effect has run. A
 * single query at mount found nothing on a first visit to those routes, so the
 * whole page went without its reveals until the chunk was cached. Watching the
 * content for added and removed elements covers route changes and late chunks
 * alike, without knowing about the router.
 */
export function useScrollReveal(): void {
  useEffect(() => {
    const root = document.documentElement;

    // Every reveal element this hook has dealt with and that is still on the
    // page. Kept here rather than read back from `data-visible`: a hidden
    // element is not necessarily being observed, since React's development
    // double-run leaves the first pass's marks behind with its observer gone.
    const tracked = new Set<HTMLElement>();
    // Armed since the last frame, so the fold check below looks only at them.
    let fresh: HTMLElement[] = [];
    let settleFrame = 0;

    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const target = entry.target as HTMLElement;
                target.dataset.visible = 'true';
                observer?.unobserve(target);
              }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
          )
        : null;

    // Anything already past the fold when it arrives (deep links, restored scroll).
    const settle = () => {
      settleFrame = 0;
      const arrived = fresh;
      fresh = [];
      for (const element of arrived) {
        if (!tracked.has(element) || element.dataset.visible === 'true') continue;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          element.dataset.visible = 'true';
          observer?.unobserve(element);
        }
      }
    };

    // Take on the reveal elements that are on the page now, and let go of the
    // ones that are not. Idempotent, so running it when nothing changed does
    // nothing.
    const sync = () => {
      const present = new Set(document.querySelectorAll<HTMLElement>(SELECTOR));

      for (const element of tracked) {
        if (present.has(element)) continue;
        observer?.unobserve(element);
        tracked.delete(element);
      }

      const showImmediately = prefersReducedMotion() || !observer;
      for (const element of present) {
        if (tracked.has(element)) continue;
        tracked.add(element);

        if (showImmediately) {
          element.dataset.visible = 'true';
          continue;
        }
        if (element.dataset.visible === 'true') continue;

        // Hide first, in the same task the observer is told, to avoid a flash.
        element.dataset.visible = 'false';
        observer.observe(element);
        fresh.push(element);
      }

      // Armed only once there is something to hide.
      if (fresh.length === 0) return;
      root.classList.add('motion-ready');
      if (!settleFrame) settleFrame = window.requestAnimationFrame(settle);
    };

    sync();
    const stopWatching = observeContent(sync);

    return () => {
      stopWatching();
      window.cancelAnimationFrame(settleFrame);
      observer?.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);
}
