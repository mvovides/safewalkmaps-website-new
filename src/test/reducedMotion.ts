import { vi } from 'vitest';

/**
 * Makes `(prefers-reduced-motion: reduce)` match; every other query does not.
 *
 * Returns the spy, so a test that needs the real `matchMedia` back before the
 * end of the run can restore it. The config restores mocks between tests anyway.
 */
export function emulateReducedMotion() {
  return vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}
