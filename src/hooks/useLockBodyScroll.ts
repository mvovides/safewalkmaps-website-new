import { useLayoutEffect } from 'react';

/**
 * Freeze page scroll while an overlay is open.
 *
 * Padding compensates for the scrollbar disappearing on desktop so the layout
 * does not shift sideways when the mobile menu opens on a narrow desktop window.
 */
export function useLockBodyScroll(locked: boolean): void {
  useLayoutEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}
