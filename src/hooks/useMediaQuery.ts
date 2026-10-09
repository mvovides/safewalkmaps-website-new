import { useEffect, useState } from 'react';

/** Subscribe to a media query. Returns `false` during SSR / before hydration. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Matches the Tailwind `lg` breakpoint — the desktop/mobile motion split. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
