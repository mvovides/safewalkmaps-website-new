import { useEffect } from 'react';

const SELECTOR = '[data-reveal], [data-reveal-stagger]';

/**
 * One IntersectionObserver for every reveal on the page.
 *
 * Elements start with no `data-visible` attribute, so they render fully visible
 * for crawlers and for anyone whose JS fails. This controller adds the
 * `motion-ready` class to <html> — which is what actually arms the hidden
 * state in CSS — then reveals elements as they enter the viewport.
 *
 * Re-runs on `key` (the route pathname) so page navigations pick up new nodes.
 */
export function useScrollReveal(key: string): void {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reduced || typeof IntersectionObserver !== 'function') {
      elements.forEach((element) => {
        element.dataset.visible = 'true';
      });
      return;
    }

    // Hide first, in the same frame the observer is created, to avoid a flash.
    elements.forEach((element) => {
      if (!element.dataset.visible) element.dataset.visible = 'false';
    });
    root.classList.add('motion-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.dataset.visible = 'true';
          observer.unobserve(target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    // Anything already past the fold on load (deep links, restored scroll).
    const settle = window.requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          element.dataset.visible = 'true';
          observer.unobserve(element);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(settle);
      observer.disconnect();
    };
  }, [key]);
}
