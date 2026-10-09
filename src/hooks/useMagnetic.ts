import { useCallback, useRef } from 'react';

import { useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';

/**
 * How far the element leans toward the pointer, in pixels, at the very edge.
 *
 * Small on purpose: the effect should register as the control being responsive,
 * not as it being playful. Less on the vertical axis because a button is wider
 * than it is tall, so an equal offset reads as more movement vertically.
 */
const MAX_LEAN_X = 6;
const MAX_LEAN_Y = 4;

/**
 * Very restrained pointer-follow for a primary action.
 *
 * Disabled entirely on touch devices and under reduced motion. Writes straight
 * to the node, so moving the pointer costs no re-renders.
 *
 * Uses the standalone `translate` property rather than `transform`. An inline
 * `transform` replaces the whole property, which silently killed the
 * `active:scale` press feedback on the one button this is applied to — the
 * hero's primary call to action. `translate` composes with `transform`, so the
 * lean and the press now coexist.
 *
 * The return to rest is interpolated by `.tappable`, which transitions
 * `translate` over `--duration-fast`. Deliberately short rather than a spring:
 * the whole travel is 6px, and anything longer trails the pointer instead of
 * following it.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const enabled = canHover && !reduced;

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const node = ref.current;
      if (!node || !enabled) return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.translate = `${(x * MAX_LEAN_X).toFixed(2)}px ${(y * MAX_LEAN_Y).toFixed(2)}px`;
    },
    [enabled],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (node) node.style.translate = '';
  }, []);

  return enabled
    ? { ref, onPointerMove, onPointerLeave }
    : { ref, onPointerMove: undefined, onPointerLeave: undefined };
}
