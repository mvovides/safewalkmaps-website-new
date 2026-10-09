import { useEffect, useState } from 'react';

/**
 * Reports whether a dark surface is currently sitting under the fixed header.
 *
 * Sections opt in with `data-nav-theme="dark"`. The observer's root margin
 * collapses the viewport to a thin band the height of the header, so a section
 * "intersects" only while it is actually behind the navigation — no scroll
 * listener, and no per-frame geometry reads.
 */
export function useNavOverDark(navHeightPx = 72): boolean {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;

    let observer: IntersectionObserver | null = null;
    const active = new Set<Element>();

    const connect = () => {
      observer?.disconnect();
      active.clear();

      const bottomInset = Math.max(0, window.innerHeight - navHeightPx);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) active.add(entry.target);
            else active.delete(entry.target);
          }
          setOverDark(active.size > 0);
        },
        { rootMargin: `0px 0px -${bottomInset}px 0px`, threshold: 0 },
      );

      document
        .querySelectorAll('[data-nav-theme="dark"]')
        .forEach((element) => observer?.observe(element));
    };

    connect();

    // The band depends on viewport height, so rebuild it when that changes.
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(connect);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [navHeightPx]);

  return overDark;
}
