import { useEffect, useState } from 'react';

import { observeContent } from '@/lib/observeContent';

/** The contract: a section opts in to the inverted header by rendering this. */
const DARK_SURFACE = '[data-nav-theme="dark"]';

/**
 * Reports whether a dark surface is currently sitting under the fixed header.
 *
 * Sections opt in with `data-nav-theme="dark"`. The observer's root margin
 * collapses the viewport to a thin band the height of the header, so a section
 * "intersects" only while it is actually behind the navigation — no scroll
 * listener, and no per-frame geometry reads.
 *
 * The set of watched sections follows the page: sections that render after the
 * hook mounts are picked up, and sections that leave are let go.
 */
export function useNavOverDark(navHeightPx = 72): boolean {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;

    let observer: IntersectionObserver | null = null;
    // Every dark surface the observer is watching, and the subset of those that
    // is behind the header right now.
    const watched = new Set<Element>();
    const active = new Set<Element>();

    // Watch the dark surfaces that are on the page now, and let go of the ones
    // that are not. Idempotent, so running it when nothing changed does nothing.
    const sync = () => {
      const current = observer;
      if (!current) return;

      const present = new Set(document.querySelectorAll(DARK_SURFACE));
      let dropped = false;
      let added = false;

      for (const element of watched) {
        if (present.has(element)) continue;
        current.unobserve(element);
        watched.delete(element);
        if (active.delete(element)) dropped = true;
      }
      for (const element of present) {
        if (watched.has(element)) continue;
        current.observe(element);
        watched.add(element);
        added = true;
      }

      // A section that left while it was behind the header will not necessarily
      // report that, and a stale "dark" would leave pale link text on a white
      // page. Say so ourselves — unless a new section was just added, because it
      // is about to report its own state, and publishing first would flash the
      // header light for a frame while one dark page replaces another.
      if (dropped && !added) setOverDark(active.size > 0);
    };

    const connect = () => {
      observer?.disconnect();
      watched.clear();
      active.clear();

      const bottomInset = Math.max(0, window.innerHeight - navHeightPx);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // A notification can already be queued for a section that has since
            // left the page; counting it would leave the header stuck dark.
            if (!watched.has(entry.target)) continue;
            if (entry.isIntersecting) active.add(entry.target);
            else active.delete(entry.target);
          }
          setOverDark(active.size > 0);
        },
        { rootMargin: `0px 0px -${bottomInset}px 0px`, threshold: 0 },
      );

      sync();
    };

    connect();

    // Keep the watched set in step with the page for as long as the header lives.
    //
    // Not redundant — do not collapse this back into the one query at mount. The
    // header sits outside <Routes>, so it mounts once and never again, and the
    // supporting routes (/safety-score, /about, ...) are React.lazy behind
    // Suspense. On a direct load their navy sections do not exist yet when this
    // effect runs, and after a client-side navigation nothing re-runs it, so the
    // header was left navy on navy and the navigation was invisible. Watching the
    // content for added and removed nodes covers route changes, lazy chunks
    // resolving, and anything else that renders late, without knowing about the
    // router. The footer is the only dark surface outside <main>, and it mounts
    // with the header, so the scan in `sync` still finds it.
    //
    // A section that switches its theme in place is not an added or removed
    // node, so the attribute is watched too.
    const stopWatching = observeContent(sync, { attributeFilter: ['data-nav-theme'] });

    // The band depends on viewport height, so rebuild it when that changes.
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(connect);
    };
    window.addEventListener('resize', onResize);

    return () => {
      stopWatching();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [navHeightPx]);

  return overDark;
}
