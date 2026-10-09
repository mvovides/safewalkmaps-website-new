import { useCallback, useRef } from 'react';

import { useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';

/**
 * Very restrained pointer-follow for a primary action.
 *
 * Capped at a few pixels so it reads as responsiveness rather than a gimmick,
 * and disabled entirely on touch devices and under reduced motion. Writes the
 * transform directly to the node, so moving the pointer costs no re-renders.
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
      node.style.transform = `translate3d(${(x * 6).toFixed(2)}px, ${(y * 4).toFixed(2)}px, 0)`;
    },
    [enabled],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (node) node.style.transform = '';
  }, []);

  return enabled
    ? { ref, onPointerMove, onPointerLeave }
    : { ref, onPointerMove: undefined, onPointerLeave: undefined };
}
